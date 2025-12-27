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

# IMPORT DYNAMIC PROMPTS
try:
    from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION
except ImportError:
    AGENT_INSTRUCTION = "You are a helpful assistant."
    SESSION_INSTRUCTION = "Answer the user's questions."

# Load env in main process
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

# --- 2. SETUP LIVEKIT AGENT ---
async def entrypoint(ctx: agents.JobContext):
    """Entry point for the LiveKit agent."""
    print(f"--> Agent accepted job for room: {ctx.room.name}", flush=True)
    
    # Re-initialize history for this specific session
    history = ConversationHistory()
    
    # 1. Connect to the room
    # auto_subscribe=True allows the agent to hear audio immediately
    await ctx.connect(auto_subscribe=True)
    print(f"--> Agent connected to room: {ctx.room.name}", flush=True)

    # 2. Wait for the user (participant) to join
    print("--> Waiting for participant...", flush=True)
    participant = await ctx.wait_for_participant()
    
    # 3. Now you can safely access the participant's identity/name
    print(f"--> Agent paired with participant: {participant.identity}", flush=True)

    # --- CRITICAL FIX: KEEP ALIVE ---
    # Without this, the function returns and the agent disconnects immediately.
    # We create a shutdown event to keep the process running until cancelled.
    shutdown_event = asyncio.Event()
    
    # Define a simple cleanup callback
    def cleanup():
        print("--> Agent shutting down...", flush=True)
        shutdown_event.set()

    ctx.add_shutdown_callback(cleanup)

    # Setup a basic VoiceAgent (Optional - enables VAD/Speech logic if you have plugins installed)
    # If you just want it to stay in the room for now, the wait below is sufficient.
    
    # Keep the agent running indefinitely
    await shutdown_event.wait()

# --- 3. WORKER PROCESS LOGIC ---
def run_livekit_worker():
    """This runs in a separate process to allow signal handling."""
    try:
        # Windows Multiprocessing Fix: Reload Env Vars in the child process
        from dotenv import load_dotenv
        load_dotenv(".env")

        print("--> Worker Process Started", flush=True)
        
        # Initialize the worker via CLI logic
        # We manually set sys.argv to simulate running "python main.py agent dev"
        sys.argv = ["agent", "dev"]
        
        # Start the worker
        # request_on_start=True helps it connect immediately in some dev scenarios
        agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))
        
    except KeyboardInterrupt:
        print("--> Worker Process Interrupted", flush=True)
    except Exception as e:
        print(f"--> Worker Process Error: {e}", flush=True)

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
    # Ensure directory exists
    if not CONVERSATIONS_DIR.exists():
        return []
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
    
    print("Starting FastAPI on port 5080...")
    uvicorn.run(app, host="0.0.0.0", port=5080)