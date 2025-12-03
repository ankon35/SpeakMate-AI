import logging
import asyncio
from dotenv import load_dotenv
 
from livekit import agents
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    llm,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import assemblyai, google, silero
 
from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION
 
load_dotenv()
 
async def entrypoint(ctx: JobContext):
    # 1. Connect to the room
    # We must subscribe to AUDIO to let AssemblyAI hear the user
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
 
    # 2. Wait for a user to join
    participant = await ctx.wait_for_participant()
 
    # 3. Define the Agent Pipeline
    # This architecture separates Hearing (STT), Thinking (LLM), and Speaking (TTS)
    agent = VoicePipelineAgent(
        vad=silero.VAD.load(),          # Detects when user starts/stops speaking
        stt=assemblyai.STT(),           # <--- USES ASSEMBLYAI (pulls key from env)
        llm=google.LLM(
            model="gemini-1.5-flash",   # Standard Gemini model
        ),
        tts=google.TTS(),               # Google Text-to-Speech
        chat_ctx=llm.ChatContext().append(
            role="system",
            text=AGENT_INSTRUCTION
        ),
    )
 
    # 4. Print User Transcription to Console
    @agent.on("user_speech_committed")
    def on_user_transcription(msg: llm.ChatMessage):
        print(f"\n[USER]: {msg.content}")
 
    # 5. Print AI Response to Console
    @agent.on("agent_speech_committed")
    def on_agent_transcription(msg: llm.ChatMessage):
        print(f"\n[AI]: {msg.content}")
 
    # 6. Start the agent
    agent.start(ctx.room, participant)
 
    # 7. Say the welcome message
    await agent.say(SESSION_INSTRUCTION, allow_interruptions=True)
 
 
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    agents.cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))