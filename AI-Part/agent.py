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










from dotenv import load_dotenv
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import noise_cancellation, google, deepgram # Import deepgram plugin
from prompts import AGENT_INSTRUCTION, SESSION_INSTRUCTION

load_dotenv(".env")

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=AGENT_INSTRUCTION)

async def entrypoint(ctx: agents.JobContext):
    await ctx.connect()

    session = AgentSession(
        llm=google.beta.realtime.RealtimeModel(
            voice="Zephyr"
        ),
        # FIX: Use the official Deepgram STT plugin here.
        # It automatically uses DEEPGRAM_API_KEY from your .env file.
        stt=deepgram.STT(language="en-US"),
    )

    @session.on("user_input_transcribed")
    def on_user_transcribed(event: agents.UserInputTranscribedEvent):
        if event.is_final:
            print(f"\nuser: {event.transcript}\n")
        else:
            print(f"user: {event.transcript}", end="\r")

    @session.on("conversation_item_added")
    def on_item_added(event: agents.ConversationItemAddedEvent):
        if event.item.role == "assistant":
            print(f"\n[AGENT SPEECH]: {event.item.text_content}\n")
            if event.item.interrupted:
                print("(interrupted)")

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            noise_cancellation=noise_cancellation.BVC(),
        ),
    )

    await session.generate_reply(
        instructions=SESSION_INSTRUCTION
    )

if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))