
// Configuration
const API_BASE_URL = 'http://localhost:8080';

// Global variables
let room = null;
let isTestActive = false;
let transcript = [];
let currentPart = 1;
let livekitConfig = null;

// Wait for LiveKit to load
function waitForLiveKit() {
    return new Promise((resolve) => {
        if (typeof window.LivekitClient !== 'undefined') {
            resolve();
        } else {
            const checkInterval = setInterval(() => {
                if (typeof window.LivekitClient !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        }
    });
}

// Status update helper
function updateConnectionStatus(message, type) {
    const statusEl = document.getElementById('connectionStatus');
    statusEl.textContent = message;
    statusEl.className = 'connection-status show ' + type;
}

// Initialize and connect to LiveKit
async function initializeLiveKit() {
    try {
        updateConnectionStatus('Connecting to server...', 'connecting');

        // Start the LiveKit agent
        const startResponse = await fetch(`${API_BASE_URL}/start_server`, {
            method: 'POST'
        });
        const startData = await startResponse.json();
        console.log('Server start response:', startData);

        // Wait a bit for the agent to fully initialize
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get LiveKit configuration
        const configResponse = await fetch(`${API_BASE_URL}/config`);
        livekitConfig = await configResponse.json();

        if (livekitConfig.error) {
            throw new Error(livekitConfig.error);
        }

        console.log('LiveKit config received');
        updateConnectionStatus('Server ready', 'connected');
        return true;

    } catch (error) {
        console.error('Failed to initialize LiveKit:', error);
        updateConnectionStatus('Connection failed: ' + error.message, 'error');
        return false;
    }
}

// Connect to LiveKit room
async function connectToRoom() {
    try {
        // Ensure LiveKit is loaded
        await waitForLiveKit();

        if (!livekitConfig || !livekitConfig.url || !livekitConfig.token) {
            throw new Error('Invalid LiveKit configuration');
        }

        updateConnectionStatus('Joining voice room...', 'connecting');

        // Create room instance using the global LivekitClient
        const { Room, RoomEvent, Track } = window.LivekitClient;

        room = new Room({
            adaptiveStream: true,
            dynacast: true,
        });

        // Setup event listeners
        setupRoomEventListeners();

        // Connect to room
        await room.connect(livekitConfig.url, livekitConfig.token);

        console.log('Connected to LiveKit room:', room.name);
        updateConnectionStatus('Connected to examiner', 'connected');

        // Enable local audio
        await room.localParticipant.setMicrophoneEnabled(true);

        return true;

    } catch (error) {
        console.error('Failed to connect to room:', error);
        updateConnectionStatus('Failed to join room: ' + error.message, 'error');
        return false;
    }
}

// Setup room event listeners
function setupRoomEventListeners() {
    const { RoomEvent, Track } = window.LivekitClient;

    // Handle participant connection
    room.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log('Participant connected:', participant.identity);
        if (participant.identity.includes('agent')) {
            updateRecordingIndicator(true);
            document.getElementById('finishBtn').disabled = false;
        }
    });

    // Handle track subscription (for receiving audio from agent)
    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log('Track subscribed:', track.kind, 'from', participant.identity);

        if (track.kind === Track.Kind.Audio) {
            // Attach audio track to play agent's voice
            const audioElement = track.attach();
            document.body.appendChild(audioElement);
        }
    });

    // Handle transcription data (if available)
    room.on(RoomEvent.DataReceived, (payload, participant) => {
        try {
            const decoder = new TextDecoder();
            const data = JSON.parse(decoder.decode(payload));
            console.log('Data received:', data);

            // Handle different data types (transcription, messages, etc.)
            if (data.type === 'transcription') {
                handleTranscription(data);
            }
        } catch (error) {
            console.error('Error processing data:', error);
        }
    });

    // Handle participant disconnection
    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log('Participant disconnected:', participant.identity);
    });

    // Handle room disconnection
    room.on(RoomEvent.Disconnected, () => {
        console.log('Disconnected from room');
        updateRecordingIndicator(false);
    });

    // Handle connection quality changes
    room.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
        console.log('Connection quality:', quality, 'for', participant.identity);
    });
}

// Handle transcription data
function handleTranscription(data) {
    const { role, text, isFinal } = data;

    if (isFinal && text) {
        if (role === 'assistant') {
            showAiMessage(text);
        } else if (role === 'user') {
            addUserResponse(text);
        }
    }
}

// Update recording indicator
function updateRecordingIndicator(active) {
    const indicator = document.getElementById('recordingIndicator');
    if (active) {
        indicator.classList.remove('inactive');
    } else {
        indicator.classList.add('inactive');
    }
}

// Start test function
async function startTest() {
    const name = document.getElementById('fullName').value.trim();
    const id = document.getElementById('candidateId').value.trim();
    let isValid = true;

    if (!name) {
        document.getElementById('fullName').classList.add('error');
        document.getElementById('nameError').classList.add('show');
        isValid = false;
    } else {
        document.getElementById('fullName').classList.remove('error');
        document.getElementById('nameError').classList.remove('show');
    }

    if (!id) {
        document.getElementById('candidateId').classList.add('error');
        document.getElementById('idError').classList.add('show');
        isValid = false;
    } else {
        document.getElementById('candidateId').classList.remove('error');
        document.getElementById('idError').classList.remove('show');
    }

    if (!isValid) return;

    // Disable start button
    const startBtn = document.getElementById('startBtn');
    startBtn.disabled = true;
    startBtn.textContent = 'Connecting...';

    // Initialize LiveKit
    const initialized = await initializeLiveKit();
    if (!initialized) {
        startBtn.disabled = false;
        startBtn.textContent = 'Begin Assessment';
        return;
    }

    // Connect to room
    const connected = await connectToRoom();
    if (!connected) {
        startBtn.disabled = false;
        startBtn.textContent = 'Begin Assessment';
        return;
    }

    // Hide user info card
    document.getElementById('userInfoCard').classList.add('hidden');

    // Start the test immediately
    setTimeout(() => {
        document.getElementById('testContainer').classList.add('active');
        document.getElementById('displayName').textContent = name;
        document.getElementById('displayId').textContent = id;

        isTestActive = true;
        updateAiMessage('Good morning! Welcome to your IELTS speaking test. The examiner will begin shortly...');
    }, 400);
}

// Update AI message display
function updateAiMessage(text) {
    const messageEl = document.getElementById('aiMessageText');
    messageEl.textContent = text;
}

// Show AI message and add to transcript
function showAiMessage(text) {
    if (!isTestActive) return;

    updateAiMessage(text);

    const time = new Date().toLocaleTimeString();
    addTranscriptEntry('ai', text, time);
}

// Add user response to transcript
function addUserResponse(text) {
    if (!isTestActive) return;

    const time = new Date().toLocaleTimeString();
    addTranscriptEntry('user', text, time);
}

// Add entry to transcript
function addTranscriptEntry(type, text, time) {
    const container = document.getElementById('transcriptContent');

    const entry = document.createElement('div');
    entry.className = `transcript-entry ${type}-entry`;

    const speaker = type === 'ai' ? 'Examiner' : 'Candidate';
    const icon = type === 'ai' ? '🤖' : '👤';

    entry.innerHTML = `
                <div class="entry-header">
                    <div class="entry-speaker">
                        <div class="speaker-icon">${icon}</div>
                        ${speaker}
                    </div>
                    <div class="entry-time">${time}</div>
                </div>
                <div class="entry-content">${text}</div>
            `;

    container.appendChild(entry);
    container.scrollTop = container.scrollHeight;

    transcript.push({
        type: type,
        speaker: speaker,
        text: text,
        time: time
    });
}

// Finish test
async function finishTest() {
    if (!isTestActive) return;

    isTestActive = false;

    // Disconnect from room
    if (room) {
        await room.disconnect();
        room = null;
    }

    // Stop the server
    try {
        await fetch(`${API_BASE_URL}/stop_server`, { method: 'POST' });
    } catch (error) {
        console.error('Error stopping server:', error);
    }

    document.getElementById('finishBtn').disabled = true;
    document.getElementById('testContainer').style.display = 'none';
    document.getElementById('completionScreen').classList.add('show');
}

// Download transcript
function downloadTranscript() {
    const name = document.getElementById('displayName').textContent;
    const id = document.getElementById('displayId').textContent;

    const header = `═══════════════════════════════════════════════\n  IELTS SPEAKING TEST - OFFICIAL TRANSCRIPT\n═══════════════════════════════════════════════\n\n`;
    const info = `Candidate Name: ${name}\nCandidate ID: ${id}\nTest Date: ${new Date().toLocaleDateString()}\nTest Time: ${new Date().toLocaleTimeString()}\n\n`;
    const divider = `───────────────────────────────────────────────\n\n`;

    let content = header + info + divider;

    transcript.forEach((entry, index) => {
        content += `[${entry.time}] ${entry.speaker}:\n`;
        content += `${entry.text}\n\n`;
        if (index < transcript.length - 1) {
            content += `---\n\n`;
        }
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `IELTS_Speaking_Test_${id}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Cleanup on page unload
window.addEventListener('beforeunload', async () => {
    if (room) {
        await room.disconnect();
    }
    try {
        await fetch(`${API_BASE_URL}/stop_server`, { method: 'POST' });
    } catch (error) {
        console.error('Error stopping server:', error);
    }
});
