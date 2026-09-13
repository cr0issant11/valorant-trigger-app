// Game State
let gameState = {
    isActive: false,
    triggerCount: 0,
    score: 0,
    sensitivity: 5,
    mode: 'auto',
    soundEnabled: true,
    vibrationEnabled: false,
    logs: []
};

// DOM Elements
const triggerBtn = document.getElementById('triggerBtn');
const statusIndicator = document.querySelector('.status-indicator');
const statusText = document.getElementById('statusText');
const triggerCount = document.getElementById('triggerCount');
const scoreCount = document.getElementById('scoreCount');
const modeDisplay = document.getElementById('modeDisplay');
const logContent = document.getElementById('logContent');
const sensitivitySlider = document.getElementById('sensitivity');
const sensValue = document.getElementById('sensValue');
const triggerMode = document.getElementById('triggerMode');
const soundToggle = document.getElementById('soundToggle');
const vibrationToggle = document.getElementById('vibrationToggle');
const resetBtn = document.getElementById('resetBtn');

// Audio Context
let audioContext = null;

// Initialize
function init() {
    setupEventListeners();
    loadSettings();
    addLog('🎮 Valorant Trigger App initialized');
    addLog('🔴 System ready - Click ACTIVATE TRIGGER');
}

// Event Listeners
function setupEventListeners() {
    triggerBtn.addEventListener('click', handleTrigger);
    sensitivitySlider.addEventListener('input', handleSensitivityChange);
    triggerMode.addEventListener('change', handleModeChange);
    soundToggle.addEventListener('change', handleSoundToggle);
    vibrationToggle.addEventListener('change', handleVibrationToggle);
    resetBtn.addEventListener('click', handleReset);

    // Keyboard shortcut (Space)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            handleTrigger();
        }
    });
}

// Trigger Handler
function handleTrigger() {
    gameState.isActive = true;
    gameState.triggerCount++;
    
    const baseScore = 100;
    const sensBonus = gameState.sensitivity * 10;
    const score = baseScore + sensBonus;
    gameState.score += score;

    // Update UI
    triggerBtn.classList.add('triggered');
    statusIndicator.classList.add('active');
    statusText.textContent = 'ACTIVE';
    triggerCount.textContent = gameState.triggerCount;
    scoreCount.textContent = gameState.score;

    // Sound & Vibration
    playTriggerSound();
    if (gameState.vibrationEnabled) {
        navigator.vibrate && navigator.vibrate([10, 5, 10]);
    }

    // Add log entry
    addLog(`⚡ TRIGGER #${gameState.triggerCount} - +${score} points (Sensitivity: ${gameState.sensitivity})`);

    // Cool down
    setTimeout(resetTrigger, 500);

    // Auto mode - random activation
    if (gameState.mode === 'auto') {
        handleAutoMode();
    }
}

function resetTrigger() {
    gameState.isActive = false;
    triggerBtn.classList.remove('triggered');
    statusIndicator.classList.remove('active');
    statusText.textContent = 'STANDBY';
}

// Sound Effects
function playTriggerSound() {
    if (!gameState.soundEnabled) return;

    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        const ctx = audioContext;
        const now = ctx.currentTime;
        
        // Trigger sound - fast beep sequence
        const beeps = [
            { freq: 800, duration: 0.05 },
            { freq: 1200, duration: 0.05 },
            { freq: 1600, duration: 0.1 }
        ];

        beeps.forEach((beep, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.frequency.value = beep.freq;
            gain.gain.setValueAtTime(0.3, now + index * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.06 + beep.duration);
            
            osc.start(now + index * 0.06);
            osc.stop(now + index * 0.06 + beep.duration);
        });
    } catch (e) {
        console.log('Audio not available');
    }
}

// Auto Mode
function handleAutoMode() {
    const delay = Math.random() * 3000 + 2000; // 2-5 seconds
    const randomChance = Math.random();
    
    if (randomChance > 0.6) {
        setTimeout(() => {
            if (gameState.mode === 'auto' && !gameState.isActive) {
                statusText.textContent = 'AUTO-TRIGGER INCOMING...';
                statusText.style.color = '#ff9500';
                addLog('🤖 Auto-trigger incoming...');
                
                setTimeout(() => {
                    if (gameState.mode === 'auto') {
                        triggerBtn.click();
                        statusText.style.color = '#00d4ff';
                    }
                }, 1000);
            }
        }, delay);
    }
}

// Burst Mode
function handleBurstMode() {
    addLog('💥 BURST MODE ACTIVATED - Rapid fire!');
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            if (gameState.mode === 'burst') {
                gameState.triggerCount++;
                gameState.score += 100 + gameState.sensitivity * 10;
                playTriggerSound();
            }
        }, i * 150);
    }
}

// Settings Handlers
function handleSensitivityChange(e) {
    gameState.sensitivity = parseInt(e.target.value);
    sensValue.textContent = gameState.sensitivity;
    addLog(`🎯 Sensitivity adjusted to ${gameState.sensitivity}`);
}

function handleModeChange(e) {
    gameState.mode = e.target.value;
    modeDisplay.textContent = gameState.mode.toUpperCase();
    
    if (gameState.mode === 'burst') {
        addLog('💥 Switched to BURST mode');
    } else if (gameState.mode === 'auto') {
        addLog('🤖 Switched to AUTO mode');
    } else {
        addLog('🎮 Switched to MANUAL mode');
    }
}

function handleSoundToggle(e) {
    gameState.soundEnabled = e.target.checked;
    addLog(`🔊 Sound ${gameState.soundEnabled ? 'enabled' : 'disabled'}`);
}

function handleVibrationToggle(e) {
    gameState.vibrationEnabled = e.target.checked;
    addLog(`📳 Vibration ${gameState.vibrationEnabled ? 'enabled' : 'disabled'}`);
}

function handleReset() {
    gameState.triggerCount = 0;
    gameState.score = 0;
    triggerCount.textContent = '0';
    scoreCount.textContent = '0';
    addLog('🔄 Stats reset');
}

// Logging System
function addLog(message) {
    gameState.logs.unshift(message);
    
    // Keep only last 10 logs
    if (gameState.logs.length > 10) {
        gameState.logs.pop();
    }

    // Update UI
    logContent.innerHTML = gameState.logs
        .map(log => `<p class="log-entry">${log}</p>`)
        .join('');

    // Auto scroll to top
    logContent.scrollTop = 0;
}

// Settings Persistence
function loadSettings() {
    const saved = localStorage.getItem('valorantSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        gameState.sensitivity = settings.sensitivity || 5;
        gameState.mode = settings.mode || 'auto';
        gameState.soundEnabled = settings.soundEnabled !== false;
        gameState.vibrationEnabled = settings.vibrationEnabled || false;

        sensValue.textContent = gameState.sensitivity;
        sensitivitySlider.value = gameState.sensitivity;
        triggerMode.value = gameState.mode;
        soundToggle.checked = gameState.soundEnabled;
        vibrationToggle.checked = gameState.vibrationEnabled;
        modeDisplay.textContent = gameState.mode.toUpperCase();
    }
}

function saveSettings() {
    localStorage.setItem('valorantSettings', JSON.stringify({
        sensitivity: gameState.sensitivity,
        mode: gameState.mode,
        soundEnabled: gameState.soundEnabled,
        vibrationEnabled: gameState.vibrationEnabled
    }));
}

// Save settings when changed
sensitivitySlider.addEventListener('change', saveSettings);
triggerMode.addEventListener('change', saveSettings);
soundToggle.addEventListener('change', saveSettings);
vibrationToggle.addEventListener('change', saveSettings);

// Initialize on load
window.addEventListener('load', init);

// Save before leaving
window.addEventListener('beforeunload', saveSettings);
