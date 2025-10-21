# deepgram_stt.py

import os
import asyncio
from typing import AsyncIterator
from deepgram import (
    DeepgramClient,
    DeepgramClientOptions,
    LiveTranscriptionEvents,
    LiveOptions,
)
from livekit import rtc
from livekit.agents import stt

# Load the API key from environment variables
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
if not DEEPGRAM_API_KEY:
    raise ValueError("DEEPGRAM_API_KEY is not set in the environment.")

config = DeepgramClientOptions(
    verbose=0, # Set to 1 for more detailed logging
)
deepgram_client = DeepgramClient(DEEPGRAM_API_KEY, config)

class DeepgramSTT(stt.STT):
    def __init__(self):
        super().__init__(streaming=True)
        self._queue = asyncio.Queue()

    async def _process_stream(self) -> AsyncIterator[stt.SpeechEvent]:
        """
        This method processes the audio stream from the queue and yields speech events.
        """
        try:
            # Establish connection to Deepgram
            dg_connection = deepgram_client.listen.asynclive.v("1")

            async def on_message(self, result, **kwargs):
                sentence = result.channel.alternatives[0].transcript
                if len(sentence) == 0:
                    return

                is_final = result.is_final
                
                # Yield a SpeechEvent to the LiveKit agent session
                yield stt.SpeechEvent(
                    type=stt.SpeechEventType.FINAL_TRANSCRIPT if is_final else stt.SpeechEventType.INTERIM_TRANSCRIPT,
                    alternatives=[stt.SpeechData(text=sentence, language="en")],
                )

            dg_connection.on(LiveTranscriptionEvents.Transcript, on_message)

            # Define Deepgram options
            options = LiveOptions(
                model="nova-2",
                language="en-US",
                encoding="linear16",
                channels=1,
                sample_rate=16000,
                interim_results=True,
                smart_format=True,
            )

            await dg_connection.start(options)

            while True:
                # Get audio data from the LiveKit track
                audio_frame = await self._queue.get()
                if audio_frame is None:
                    break # End of stream
                
                # Send audio data to Deepgram
                await dg_connection.send(audio_frame.data)

        except asyncio.CancelledError:
            pass
        finally:
            if 'dg_connection' in locals() and dg_connection:
                await dg_connection.finish()

    async def _push_audio_frame(self, frame: rtc.AudioFrame):
        """
        Receives audio frames from LiveKit and puts them in a queue.
        """
        await self._queue.put(frame)

    async def _close(self):
        """
        Signal the end of the stream.
        """
        await self._queue.put(None)