# from dotenv import load_dotenv

# from livekit import agents
# from livekit.agents import AgentSession, Agent, RoomInputOptions
# from livekit.plugins import (
#     noise_cancellation,
# )

# from livekit.plugins import google
# from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION
# load_dotenv(".env")


# class Assistant(Agent):
#     def __init__(self) -> None:
#         super().__init__(instructions=AGENT_INSTRUCTION)


# async def entrypoint(ctx: agents.JobContext):
#     session = AgentSession(
#         llm=google.beta.realtime.RealtimeModel(
#             voice="Zephyr"
#         )
#     )

#     await session.start(
#         room=ctx.room,
#         agent=Assistant(),
#         room_input_options=RoomInputOptions(
#             # For telephony applications, use `BVCTelephony` instead for best results
#             noise_cancellation=noise_cancellation.BVC(),
#         ),
#     )

#     await ctx.connect()

#     await session.generate_reply(
#         instructions=SESSION_INSTRUCTION
#     )


# if __name__ == "__main__":
#     agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))











# from dotenv import load_dotenv
# from livekit import agents
# from livekit.agents import AgentSession, Agent, RoomInputOptions
# from livekit.plugins import noise_cancellation, google, deepgram # Import deepgram plugin
# from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION

# load_dotenv(".env")

# class Assistant(Agent):
#     def __init__(self) -> None:
#         super().__init__(instructions=AGENT_INSTRUCTION)

# async def entrypoint(ctx: agents.JobContext):
#     await ctx.connect()

#     session = AgentSession(
#         llm=google.beta.realtime.RealtimeModel(
#             voice="Zephyr"
#         ),
#         # FIX: Use the official Deepgram STT plugin here.
#         # It automatically uses DEEPGRAM_API_KEY from your .env file.
#         stt=deepgram.STT(language="en-US"),
#     )

#     @session.on("user_input_transcribed")
#     def on_user_transcribed(event: agents.UserInputTranscribedEvent):
#         if event.is_final:
#             print(f"\nuser: {event.transcript}\n")
#         else:
#             print(f"user: {event.transcript}", end="\r")

#     @session.on("conversation_item_added")
#     def on_item_added(event: agents.ConversationItemAddedEvent):
#         if event.item.role == "assistant":
#             print(f"\n[AGENT SPEECH]: {event.item.text_content}\n")
#             if event.item.interrupted:
#                 print("(interrupted)")

#     await session.start(
#         room=ctx.room,
#         agent=Assistant(),
#         room_input_options=RoomInputOptions(
#             noise_cancellation=noise_cancellation.BVC(),
#         ),
#     )

#     await session.generate_reply(
#         instructions=SESSION_INSTRUCTION
#     )

# if __name__ == "__main__":
#     agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))













import asyncio
from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    noise_cancellation,
    google,
    deepgram,
)
from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION
import logging

load_dotenv(".env")

# ---------- Setup logging to a file ----------
logging.basicConfig(
    filename="transcripts_log.txt",
    level=logging.INFO,
    format="%(asctime)s - %(message)s",
)

# ---------- Define the Agent ----------
class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=AGENT_INSTRUCTION)


# ---------- Entrypoint ----------
async def entrypoint(ctx: agents.JobContext):
    # Initialize Agent Session
    session = AgentSession(
        llm=google.beta.realtime.RealtimeModel(
            model="gemini-2.0-flash-exp",  # Realtime Gemini model
            voice="Puck",
        ),
        stt=deepgram.STT(language="en-US"),  # Realtime transcription
    )

    # ===== Console & File Logging Section =====

    # Log user speech transcripts
    @session.on("user_speech_committed")
    def handle_user_speech(transcript: str):
        if transcript.strip():
            print(f"\n🎙️ [USER SPEECH] → {transcript}")
            logging.info(f"USER SPEECH → {transcript}")

    # Log agent text responses
    @session.on("agent_speech_committed")
    def handle_agent_speech(transcript: str):
        if transcript.strip():
            print(f"\n🤖 [GEMINI RESPONSE] → {transcript}")
            logging.info(f"GEMINI RESPONSE → {transcript}")

    # Alternative: Log interim transcripts (optional - captures partial speech)
    @session.on("user_transcript")
    def handle_user_transcript(transcript):
        if hasattr(transcript, 'text') and transcript.text.strip():
            if hasattr(transcript, 'is_final') and transcript.is_final:
                print(f"\n🎙️ [USER FINAL] → {transcript.text}")
                logging.info(f"USER FINAL → {transcript.text}")

    # Alternative: Log agent interim responses (optional)
    @session.on("agent_transcript")
    def handle_agent_transcript(transcript):
        if hasattr(transcript, 'text') and transcript.text.strip():
            if hasattr(transcript, 'is_final') and transcript.is_final:
                print(f"\n🤖 [AGENT FINAL] → {transcript.text}")
                logging.info(f"AGENT FINAL → {transcript.text}")

    # Session started
    @session.on("agent_started_speaking")
    def handle_agent_speaking():
        print("\n🔊 Agent started speaking...")
        logging.info("Agent started speaking")

    # Session stopped
    @session.on("agent_stopped_speaking")
    def handle_agent_stopped():
        print("\n🔇 Agent stopped speaking")
        logging.info("Agent stopped speaking")

    # ===== Start the LiveKit Session =====
    print("\n🚀 Initializing LiveKit session...")
    logging.info("Initializing LiveKit session")

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await ctx.connect()

    print("\n✅ Connected to LiveKit room. Gemini Live is now active!")
    logging.info("Connected to LiveKit room. Gemini Live is active")

    # Initial greeting
    await session.generate_reply(
        instructions=SESSION_INSTRUCTION
    )

    # Keep the session alive
    try:
        while True:
            await asyncio.sleep(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        logging.error(f"Error occurred: {e}")
    finally:
        print("\n❌ Session ended.")
        logging.info("Session ended")


# ---------- Run Worker ----------
if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))












