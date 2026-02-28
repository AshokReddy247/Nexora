document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const micButton = document.getElementById('micButton');
    const listeningText = document.getElementById('listeningText');
    const conversationArea = document.getElementById('conversationArea');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettings = document.getElementById('closeSettings');
    const saveSettings = document.getElementById('saveSettings');
    const apiKeyInput = document.getElementById('apiKey');

    // State
    let isListening = false;
    let recognition;
    let synth = window.speechSynthesis;
    let voices = [];

    // Load API Key from LocalStorage
    let apiKey = localStorage.getItem('openai_api_key');
    if (apiKey) {
        apiKeyInput.value = apiKey;
    } else {
        setTimeout(() => {
            openModal();
            addAssistantMessage("Please set your OpenAI API Key in the settings to start.");
        }, 1000);
    }

    // --- Speech Recognition Setup ---
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            isListening = true;
            updateUIState(true);
        };

        recognition.onend = () => {
            isListening = false;
            updateUIState(false);
        };

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            addUserMessage(transcript);

            if (!apiKey) {
                addAssistantMessage("Please set your OpenAI API Key first.");
                openModal();
                return;
            }

            await processWithOpenAI(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            isListening = false;
            updateUIState(false);
            listeningText.textContent = "Error: " + event.error;
        };
    } else {
        micButton.disabled = true;
        listeningText.textContent = "Speech recognition not supported in this browser.";
    }

    // --- Event Listeners ---
    micButton.addEventListener('click', () => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
        } else {
            // Stop speaking if currently speaking
            if (synth.speaking) {
                synth.cancel();
            }
            try {
                recognition.start();
                listeningText.textContent = "Listening...";
            } catch (e) {
                console.error(e);
            }
        }
    });

    settingsBtn.addEventListener('click', openModal);
    closeSettings.addEventListener('click', closeModal);

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) closeModal();
    });

    saveSettings.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key.startsWith('sk-')) {
            apiKey = key;
            localStorage.setItem('openai_api_key', key);
            closeModal();
            addAssistantMessage("API Key saved! I'm ready to help.");
        } else {
            alert("Please enter a valid OpenAI API Key starting with 'sk-'");
        }
    });

    // --- Helper Functions ---

    function openModal() {
        settingsModal.classList.add('active');
    }

    function closeModal() {
        settingsModal.classList.remove('active');
    }

    function updateUIState(listening) {
        if (listening) {
            micButton.classList.add('listening');
            listeningText.textContent = "Listening...";
        } else {
            micButton.classList.remove('listening');
            listeningText.textContent = "Tap to speak";
        }
    }

    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="avatar"><i class="ph ph-user"></i></div>
            <div class="content">${text}</div>
        `;
        conversationArea.appendChild(messageDiv);
        scrollToBottom();
    }

    function addAssistantMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant-message';
        messageDiv.innerHTML = `
            <div class="avatar"><i class="ph ph-robot"></i></div>
            <div class="content">${text}</div>
        `;
        conversationArea.appendChild(messageDiv);
        scrollToBottom();

        // Speak the text
        speak(text);
    }

    function scrollToBottom() {
        conversationArea.scrollTop = conversationArea.scrollHeight;
    }

    // --- OpenAI Integration ---
    async function processWithOpenAI(userText) {
        // Show loading state (could be improved)
        const loadingId = 'loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message assistant-message';
        loadingDiv.id = loadingId;
        loadingDiv.innerHTML = `
            <div class="avatar"><i class="ph ph-robot"></i></div>
            <div class="content">Thinking...</div>
        `;
        conversationArea.appendChild(loadingDiv);
        scrollToBottom();

        try {
            // Using local backend proxy to avoid CORS/Browser blocking
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userText,
                    apiKey: apiKey, // Sending key to backend
                    model: "gpt-4o-mini"
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Server Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const reply = data.choices[0].message.content;

            // Remove loading message
            document.getElementById(loadingId).remove();

            // Add actual response
            addAssistantMessage(reply);

        } catch (error) {
            console.error(error);
            document.getElementById(loadingId).remove();

            addAssistantMessage(`Error: ${error.message}`);
            speak("I'm having trouble connecting. Please check the screen for details.");
        }
    }

    // --- Text to Speech ---
    function populateVoices() {
        voices = synth.getVoices();
    }

    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoices;
    }

    function speak(text) {
        if (synth.speaking) {
            console.error('speechSynthesis.speaking');
            return;
        }

        if (text !== '') {
            const utterThis = new SpeechSynthesisUtterance(text);

            // Try to select a nice voice using heuristics
            // 1. Specific nice voices if available
            // 2. Google US English
            // 3. Any English voice

            const preferredVoices = [
                "Microsoft Zira", // Windows
                "Google US English", // Chrome
                "Samantha" // MacOS
            ];

            let selectedVoice = voices.find(v => preferredVoices.some(pv => v.name.includes(pv)));

            if (!selectedVoice) {
                selectedVoice = voices.find(v => v.lang === 'en-US');
            }

            if (selectedVoice) {
                utterThis.voice = selectedVoice;
            }

            utterThis.pitch = 1;
            utterThis.rate = 1;

            // Visual feedback while speaking? 
            // Could add an animation class to the avatar

            synth.speak(utterThis);
        }
    }
});
