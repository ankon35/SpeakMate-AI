
let countdown;
let timeRemaining = 160;
let isTestActive = false;
let transcript = [];

const aiPrompts = [
    "Hello! Welcome to your speaking assessment. Let's begin by having you introduce yourself.",
    "That's wonderful. Could you elaborate on your educational qualifications and academic achievements?",
    "Interesting. What professional goals are you working towards in your career?",
    "Please describe a significant challenge you've encountered and explain how you resolved it.",
    "I'd like to know more about your personal interests. What hobbies do you enjoy in your free time?",
    "How do you typically manage stressful situations and maintain your productivity under pressure?",
    "Can you share an example of a successful team collaboration experience you've had?",
    "Finally, what do you consider to be the most critical skills for achieving success in your field?"
];

const userAnswers = [
    "Good morning! My name is Sarah Johnson, and I'm delighted to participate in this assessment today.",
    "I graduated with honors from the University of California, earning my Bachelor's degree in Computer Science in 2021.",
    "My primary goal is to become a lead software architect and contribute to innovative technology solutions.",
    "During a critical project deadline, our system crashed. I coordinated with the team to implement a backup solution within 24 hours.",
    "I'm passionate about photography and digital art. I also enjoy competitive swimming and exploring new technologies.",
    "I use time management techniques and prioritize tasks effectively. Regular exercise and meditation help me stay focused.",
    "In my previous role, I led a cross-functional team of eight people to successfully launch a customer portal application.",
    "I believe adaptability, strong communication, continuous learning, and problem-solving abilities are fundamental to success."
];

let currentIndex = 0;

function startTest() {
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

    document.getElementById('userInfoCard').classList.add('hidden');
    setTimeout(() => {
        document.getElementById('testContainer').classList.add('active');
        document.getElementById('displayName').textContent = name;
        document.getElementById('displayId').textContent = id;

        isTestActive = true;
        initTimer();
        beginConversation();
    }, 400);
}

function initTimer() {
    updateTimer();
    countdown = setInterval(() => {
        timeRemaining--;
        updateTimer();

        if (timeRemaining <= 0) {
            clearInterval(countdown);
            finishTest();
        }
    }, 1000);
}

function updateTimer() {
    const display = document.getElementById('timerDisplay');
    const bar = document.getElementById('progressBar');

    display.textContent = timeRemaining;

    const percent = (timeRemaining / 160) * 100;
    bar.style.width = percent + '%';

    display.className = 'timer-display';
    if (timeRemaining > 60) {
        bar.style.background = 'linear-gradient(90deg, var(--success), var(--success))';
    } else if (timeRemaining > 30) {
        display.classList.add('warning');
        bar.style.background = 'linear-gradient(90deg, var(--accent), var(--accent))';
    } else {
        display.classList.add('danger');
        bar.style.background = 'linear-gradient(90deg, #EF4444, #EF4444)';
    }
}

function beginConversation() {
    setTimeout(() => showAiMessage(aiPrompts[0]), 600);

    let delay = 4500;
    for (let i = 0; i < Math.min(aiPrompts.length, userAnswers.length); i++) {
        setTimeout(() => {
            if (isTestActive) addUserResponse(userAnswers[i]);
        }, delay);
        delay += 5500;

        if (i + 1 < aiPrompts.length) {
            setTimeout(() => {
                if (isTestActive) showAiMessage(aiPrompts[i + 1]);
            }, delay);
            delay += 3500;
        }
    }
}

function showAiMessage(text) {
    if (!isTestActive) return;

    const messageEl = document.getElementById('aiMessageText');
    messageEl.textContent = text;

    const time = new Date().toLocaleTimeString();
    addTranscriptEntry('ai', text, time);
}

function addUserResponse(text) {
    if (!isTestActive) return;

    const time = new Date().toLocaleTimeString();
    addTranscriptEntry('user', text, time);
}

function addTranscriptEntry(type, text, time) {
    const container = document.getElementById('transcriptContent');

    const entry = document.createElement('div');
    entry.className = `transcript-entry ${type}-entry`;

    const speaker = type === 'ai' ? 'AI Assessor' : 'Your Response';
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

    // Store for download
    transcript.push({
        type: type,
        speaker: speaker,
        text: text,
        time: time
    });
}

function updateTranscript() {
    const transcriptBox = document.getElementById('transcriptContent');
    transcriptBox.scrollTop = transcriptBox.scrollHeight;
}

function finishTest() {
    if (!isTestActive) return;

    isTestActive = false;
    clearInterval(countdown);

    document.getElementById('finishBtn').disabled = true;
    document.getElementById('testContainer').style.display = 'none';
    document.getElementById('completionScreen').classList.add('show');
}

function downloadTranscript() {
    const name = document.getElementById('displayName').textContent;
    const id = document.getElementById('displayId').textContent;

    const header = `═══════════════════════════════════════════════\n  AI SPEAKING TEST - OFFICIAL TRANSCRIPT\n═══════════════════════════════════════════════\n\n`;
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
    link.download = `AI_Speaking_Test_${id}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
