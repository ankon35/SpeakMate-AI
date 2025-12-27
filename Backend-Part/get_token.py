import os
import asyncio
from livekit import api
from dotenv import load_dotenv

load_dotenv()

async def main():
    # Create a token for a user named "Human_User"
    token = api.AccessToken(
        os.getenv("LIVEKIT_API_KEY"), 
        os.getenv("LIVEKIT_API_SECRET")
    ).with_identity("human_user") \
    .with_name("Human User") \
    .with_grants(api.VideoGrants(
        room_join=True,
        room="room_1", # Must match the room the agent joins (default is usually room_1)
    ))
    
    print(f"\n✅ TOKEN GENERATED:\n\n{token.to_jwt()}\n")

if __name__ == "__main__":
    asyncio.run(main())