import sys
import os
import asyncio
import json
import multiprocessing
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
import langdetect
from langdetect import DetectorFactory

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from livekit import agents, rtc
from livekit.agents import Agent, AgentSession, JobContext, room_io, UserInputTranscribedEvent, ConversationItemAddedEvent
from livekit.plugins import google, noise_cancellation, silero

# IMPORT DYNAMIC PROMPTS
from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION

load_dotenv(".env")

DetectorFactory.seed = 0

CONVERSATIONS_DIR = Path("conversations")
CONVERSATIONS_DIR.mkdir(exist_ok=True)

# --- 1. SETUP DATA HANDLING ---
class ConversationHistory:
    def __init__(self):
        self.messages = []
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.file_path = CONVERSATIONS_DIR / f"conversation_{self.session_id}.json"

    def add_message(self, role: str, content: str, language: str = "en"):
        timestamp = datetime.now().isoformat()
        message = {
            "timestamp": timestamp,
            "role": role,
            "content": content,
            "language": language
        }
        self.messages.append(message)
        self.save()

    def save(self):
        try:
            with open(self.file_path, 'w', encoding='utf-8') as f:
                json.dump(self.messages, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Error saving conversation history: {e}")

def detect_language(text: str) -> str:
    try:
        if not text.strip():
            return "unknown"
        return langdetect.detect(text)
    except Exception:
        return "unknown"

# --- 2. SETUP LIVEKIT AGENT ---
class Assistant(Agent):
    def __init__(self, history: ConversationHistory) -> None:
        super().__init__(instructions=AGENT_INSTRUCTION)
        self.history = history

# Define the server globally so it can be picked up by the worker process
server = agents.AgentServer()

@server.rtc_session()
async def my_agent(ctx: JobContext):
    # Re-initialize history for this specific session
    history = ConversationHistory()
    
    print(f"Agent joining room: {ctx.room.name}")
    
    session = AgentSession(
        stt="assemblyai/universal-streaming:en", 
        llm=google.LLM(model="gemini-2.0-flash"),
        tts="cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc", 
        vad=silero.VAD.load(),
    )

    processed_transcripts = set()

    @session.on("user_input_transcribed")
    def on_user_input_transcribed(event: UserInputTranscribedEvent):
        if event.is_final:
            transcript = event.transcript.strip()
            if transcript and transcript not in processed_transcripts:
                processed_transcripts.add(transcript)
                lang = detect_language(transcript)
                if lang == "en":
                    print(f"\nUser: {transcript}")
                    history.add_message("user", transcript, language=lang)
                else:
                    print(f"\nNon-English input detected ({lang}) – Ignored")

    @session.on("conversation_item_added")
    def on_conversation_item_added(event: ConversationItemAddedEvent):
        item = event.item
        if item.role == "assistant":
            text = getattr(item, "text_content", None)
            if text and not item.interrupted:
                print(f"\nAgent: {text}")
                history.add_message("agent", text, language="en")

    await session.start(
        room=ctx.room,
        agent=Assistant(history),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    await session.generate_reply(instructions=SESSION_INSTRUCTION)


# --- 3. WORKER PROCESS LOGIC ---
def run_livekit_worker():
    """This runs in a separate process to allow signal handling."""
    # We force the arguments so the CLI knows what to do
    sys.argv = ["agent", "start"]
    try:
        print("--> Worker Process Started")
        agents.cli.run_app(server)
    except KeyboardInterrupt:
        print("--> Worker Process Interrupted")
    except Exception as e:
        print(f"--> Worker Process Error: {e}")

# --- 4. FASTAPI SERVER ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global process reference
agent_process = None

@app.get("/healthz")
async def health_check():
    return {"status": "ok"}

@app.post("/start_server")
def start_server():
    global agent_process
    
    if agent_process and agent_process.is_alive():
         return {"status": "agent_already_running"}

    # Start the agent in a FULL SEPARATE PROCESS
    agent_process = multiprocessing.Process(target=run_livekit_worker)
    agent_process.start()
    
    return {"status": "starting", "pid": agent_process.pid}

@app.post("/stop_server")
def stop_server():
    global agent_process
    if agent_process and agent_process.is_alive():
        agent_process.terminate()
        agent_process.join()
        agent_process = None
        return {"status": "stopped"}
    return {"status": "not_running"}

@app.get("/conversations")
def list_conversations():
    files = sorted(CONVERSATIONS_DIR.glob("*.json"), reverse=True)
    return [f.name for f in files]

@app.get("/conversation/{filename}")
def get_conversation(filename: str):
    file_path = CONVERSATIONS_DIR / filename
    if not file_path.exists():
        return {"error": "File not found"}
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

# --- 5. ENTRY POINT ---
if __name__ == "__main__":
    # Required for Windows multiprocessing
    multiprocessing.freeze_support() 
    
    print("Starting FastAPI on port 8080...")
    uvicorn.run(app, host="0.0.0.0", port=8080)