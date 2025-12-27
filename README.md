# SpeakMate-AI

## Setup Instructions

### Dependencies

Install the required Python packages:

```bash
pip install openai
```

### Environment Variables

Create a `.env` file in the `AI-Part` directory with the following:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### Usage

The application now uses OpenAI Whisper API for real-time transcription instead of Deepgram.

**Note:** OpenAI Whisper API processes audio in chunks (default: 2 seconds). This means transcription will have a slight delay compared to true real-time streaming services like Deepgram, but it provides high-quality transcription results.