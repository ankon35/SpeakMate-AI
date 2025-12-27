import sys
import os

try:
    import livekit
    print(f"✅ LiveKit found at: {livekit.__file__}")
    print(f"   (Should be in: ...\\venv\\Lib\\site-packages\\livekit\\__init__.py)")
    
    import livekit.agents
    print(f"✅ LiveKit Agents found at: {livekit.agents.__path__}")
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Search paths:")
    for p in sys.path:
        print(f" - {p}")