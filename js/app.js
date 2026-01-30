import { ScreenManager } from './ScreenManager.js';
import { GameStateManager } from './GameStateManager.js';
import { wixComm } from './WixCommunication.js';

let screenManager;
let gameStateManager;

const state = {
    currentScreen: 'setup',
    mode: 'woe',
    nsfwEnabled: false,
    players: [],
    editingPlayerId: null,
    addMode: false,
    currentRound: 1,
    currentCycle: 0,
    alienIndices: [],
    timerSeconds: 120,
    timerRunning: false,
    timerInterval: null,
    conceptRevealed: false,
    currentConcept: '',
    roundScores: {},
    roundTotal: 0,
    seenConcepts: [],
    editMode: false,
    timerStartTime: null,
    timerPausedTime: 0,
    lastMilestone: 0,
    audioEnabled: true,
    audioElements: {}
};

const concepts = {
    woe: [
        'DEMOCRACY', 'PIZZA', 'GRAVITY', 'THUNDER', 'MICROWAVE', 'BIRTHDAY',
        'MEDICINE', 'TRAFFIC', 'MUSIC', 'INTERNET', 'MOVIES', 'SPORTS',
        'WEDDING', 'VACATION', 'SCHOOL', 'MONEY', 'GOVERNMENT', 'RELIGION',
        'FASHION', 'ART', 'SCIENCE', 'HISTORY', 'BREAKFAST', 'COFFEE'
    ],
    skeleton: [
        'HAUNTED HOUSE', 'GRAVEYARD', 'GHOST', 'VAMPIRE', 'ZOMBIE', 'WITCH',
        'MONSTER', 'CURSE', 'SPELL', 'POTION', 'BONES', 'COBWEBS'
    ],
    encounters: [
        'UFO', 'ALIEN', 'SPACESHIP', 'PLANET', 'GALAXY', 'STAR', 'MOON',
        'ASTEROID', 'COMET', 'BLACK HOLE', 'NEBULA', 'ORBIT'
    ],
    space: [
        'ROCKET', 'ASTRONAUT', 'SATELLITE', 'MARS', 'VENUS', 'JUPITER',
        'METEOR', 'APOLLO', 'NASA', 'TELESCOPE', 'SPACE STATION'
    ]
};

const modes = {
    woe: { minPlayers: 4, title: 'What On Earth' },
    skeleton: { minPlayers: 2, title: 'Skeleton Crew' },
    encounters: { minPlayers: 4, title: 'Close Encounters' },
    space: { minPlayers: 4, title: 'Space Race' }
};

function showScreen(screenId) {
    if (screenManager) {
        screenManager.showScreen(screenId);
    } else {
        // Fallback if screenManager not ready
        const screens = document.querySelectorAll('.screen');
        screens.forEach(s => s.style.display = 'none');
        const targetScreen = document.getElementById(screenId + 'Screen');
        if (targetScreen) {
            targetScreen.style.display = 'flex';
        }
    }
}

function goToLanding() {
    showScreen('setup');
}

function handleModeChange(event) {
    const modeKey = event.target.value;
    selectMode(modeKey);
}

function selectMode(modeKey) {
    state.mode = modeKey;
    state.players = [];
    state.currentRound = 1;
    state.currentCycle = 0;
    
    showScreen('setup');

    const landscapeModes = ['woe', 'skeleton', 'encounters', 'space'];
    if (landscapeModes.includes(modeKey)) {
        document.body.classList.add('landscape-mode');
    } else {
        document.body.classList.remove('landscape-mode');
    }

    renderPlayers();
    updateStartButton();
}

function closeModeSelect() {
    // No longer needed
}

function openMenu() {
    document.getElementById('menuModal').classList.add('active');
}

function closeMenu() {
    document.getElementById('menuModal').classList.remove('active');
}

function showTutorial() {
    closeMenu();
    alert('Tutorial coming soon! For now:\n\n1. Add players (top half are Aliens)\n2. Start game\n3. Reveal concept, start timer\n4. Tap alien names to score\n5. Humans get bonus points at milestones (3, 5, 6, 7... correct)');
}

function confirmNewGame() {
    if (confirm('Start a new game? All progress will be lost.')) {
        closeMenu();
        resetGame();
        goToLanding();
    }
}

function confirmExit() {
    if (confirm('Exit to main menu? All progress will be lost.')) {
        closeMenu();
        resetGame();
        goToLanding();
    }
}

function exitGame() {
    if (confirm('Exit game? Progress will be saved.')) {
        showScreen('inter-round');
    }
}

function resetGame() {
    state.players = [];
    state.currentRound = 1;
    state.currentCycle = 0;
    state.seenConcepts = [];
    state.editMode = false;
    state.nsfwEnabled = false;
    updateNSFWUI();
}

function toggleNSFW() {
    state.nsfwEnabled = !state.nsfwEnabled;
    updateNSFWUI();
}

function updateNSFWUI() {
    const sw = document.getElementById('nsfwSwitch');

    if (state.nsfwEnabled) {
        sw.classList.add('active');
    } else {
        sw.classList.remove('active');
    }
}

function normalizeInitials(str) {
    return String(str).trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
}

function getAlienCount() {
    return Math.floor(state.players.length / 2);
}

function showAddMode() {
    document.getElementById('wideAddBtn').style.display = 'none';
    document.getElementById('addPlayerRow').style.display = 'flex';
    document.getElementById('addPlayerInput').focus();
}

function cancelAddPlayer() {
    document.getElementById('wideAddBtn').style.display = 'flex';
    document.getElementById('addPlayerRow').style.display = 'none';
    document.getElementById('addPlayerInput').value = '';
}

function confirmAddPlayer() {
    const input = document.getElementById('addPlayerInput');
    const initials = normalizeInitials(input.value);

    if (!initials) return;
    if (state.players.some(p => p.initials === initials)) {
        alert('Player with these initials already exists!');
        return;
    }

    state.players.push({
        id: Date.now() + '_' + Math.random().toString(36).slice(2),
        initials: initials,
        score: 0,
        editing: false
    });

    input.value = '';
    assignTeams();
    renderPlayers();
    updateStartButton();
    cancelAddPlayer();
}

function assignTeams() {
    if (!['encounters', 'space'].includes(state.mode)) {
        state.players.forEach(p => p.team = null);
        return;
    }

    state.players.forEach((p, idx) => {
        const isTeam1 = idx % 2 === 0;
        if (state.mode === 'encounters') {
            p.team = isTeam1 ? 'team-red' : 'team-blue';
        } else if (state.mode === 'space') {
            p.team = isTeam1 ? 'team-green' : 'team-blue';
        }
    });
}

function deletePlayer(id) {
    state.players = state.players.filter(p => p.id !== id);
    assignTeams();
    renderPlayers();
    updateStartButton();
}

function renderPlayers() {
    const list = document.getElementById('playersList');
    const alienCount = getAlienCount();

    list.innerHTML = '';

    state.players.forEach((p, idx) => {
        const isAlien = idx < alienCount;
        let teamClass = '';
        if (p.team) {
            teamClass = ' ' + p.team;
        }

        const row = document.createElement('div');
        row.className = 'player-row' + (isAlien ? ' alien' : '') + teamClass;

        if (p.editing) {
            row.innerHTML = `
                <div class="player-icon"></div>
                <input class="player-input" value="${p.initials}" maxlength="3" id="edit-${p.id}" />
                <div class="row-tools">
                    <button class="tool-btn delete" onclick="deletePlayer('${p.id}')">
                        <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                    </button>
                    <button class="tool-btn" onclick="movePlayerUp('${p.id}')">
                        <svg viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z"/></svg>
                    </button>
                    <button class="tool-btn" onclick="movePlayerDown('${p.id}')">
                        <svg viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>
                    </button>
                    <button class="tool-btn" onclick="savePlayerEdit('${p.id}')">
                        <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    </button>
                </div>
            `;
            setTimeout(() => {
                const input = document.getElementById(`edit-${p.id}`);
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 0);
        } else {
            row.innerHTML = `
                <div class="player-icon"></div>
                <div class="player-name">${p.initials}</div>
                <button class="edit-icon" onclick="editPlayer('${p.id}')">
                    <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                </button>
            `;
        }

        list.appendChild(row);
    });
}

function editPlayer(id) {
    state.players.forEach(p => p.editing = false);
    const player = state.players.find(p => p.id === id);
    if (player) {
        player.editing = true;
        renderPlayers();
    }
}

function savePlayerEdit(id) {
    const input = document.getElementById(`edit-${id}`);
    if (!input) return;

    const initials = normalizeInitials(input.value);
    if (!initials) return;
    if (state.players.some(p => p.id !== id && p.initials === initials)) {
        alert('Player with these initials already exists!');
        return;
    }

    const player = state.players.find(p => p.id === id);
    if (player) {
        player.initials = initials;
        player.editing = false;
        renderPlayers();
    }
}

function movePlayerUp(id) {
    const idx = state.players.findIndex(p => p.id === id);
    if (idx > 0) {
        [state.players[idx], state.players[idx - 1]] = [state.players[idx - 1], state.players[idx]];
        assignTeams();
        renderPlayers();
    }
}

function movePlayerDown(id) {
    const idx = state.players.findIndex(p => p.id === id);
    if (idx < state.players.length - 1) {
        [state.players[idx], state.players[idx + 1]] = [state.players[idx + 1], state.players[idx]];
        assignTeams();
        renderPlayers();
    }
}

function handleAddPlayerKeydown(e) {
    if (e.key === 'Enter') {
        confirmAddPlayer();
    } else if (e.key === 'Escape') {
        cancelAddPlayer();
    }
}

function updateStartButton() {
    const btn = document.getElementById('startBtn');
    const mode = modes[state.mode];
    const minPlayers = mode ? mode.minPlayers : 4;

    if (state.players.length >= minPlayers) {
        btn.classList.remove('disabled');
        btn.style.display = 'flex';
    } else {
        btn.classList.add('disabled');
        btn.style.display = 'flex';
    }
}

function startGame() {
    const mode = modes[state.mode];
    const minPlayers = mode ? mode.minPlayers : 4;

    if (state.players.length < minPlayers) {
        alert(`This mode requires at least ${minPlayers} players.`);
        return;
    }

    resetRound();
    
    // Trigger fullscreen when starting the game
    if (screenManager) {
        screenManager.enterFullscreen();
    }
    
    showScreen('game');
}

function resetRound() {
    state.timerSeconds = 120;
    state.timerRunning = false;
    state.conceptRevealed = false;
    state.currentConcept = '';
    state.roundTotal = 0;
    state.roundScores = {};
    state.timerStartTime = null;
    state.timerPausedTime = 0;
    state.lastMilestone = 0;

    state.players.forEach(p => {
        state.roundScores[p.id] = 0;
    });

    document.getElementById('conceptDisplay').textContent = 'TAP TO REVEAL';
    document.getElementById('conceptDisplay').style.cursor = 'pointer';
    document.getElementById('nextRoundBtn').style.display = 'none';
    
    updateTimerDisplay();
    updateRoundScoreDisplay();
    renderAlienPlayers();
}

function renderAlienPlayers() {
    const container = document.getElementById('alienPlayers');
    const alienCount = getAlienCount();

    container.innerHTML = '';

    state.players.forEach((p, idx) => {
        const isAlien = idx < alienCount;
        const tile = document.createElement('div');
        tile.className = isAlien ? 'alien-tile' : 'human-tile';
        tile.onclick = () => isAlien ? scoreAlien(p.id) : scoreHuman(p.id);
        tile.textContent = p.initials;
        
        if (p.team) {
            tile.classList.add(p.team);
        }
        
        container.appendChild(tile);
    });
}

function getRandomConcept() {
    const pool = concepts[state.mode] || concepts.woe;
    const available = pool.filter(c => !state.seenConcepts.includes(c));

    if (available.length === 0) {
        state.seenConcepts = [];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    const concept = available[Math.floor(Math.random() * available.length)];
    state.seenConcepts.push(concept);
    return concept;
}

function revealConcept() {
    if (state.conceptRevealed) return;

    state.currentConcept = getRandomConcept();
    state.conceptRevealed = true;

    const conceptDisplay = document.getElementById('conceptDisplay');
    conceptDisplay.textContent = state.currentConcept;
    conceptDisplay.style.cursor = 'default';
    
    // Show start button on pause button
    const pauseBtn = document.querySelector('.control-btn');
    if (pauseBtn) {
        pauseBtn.textContent = '▶';
        pauseBtn.style.background = 'var(--green)';
    }
}

function skipConcept() {
    if (!state.conceptRevealed) return;

    state.currentConcept = getRandomConcept();
    document.getElementById('conceptDisplay').textContent = state.currentConcept;
}

function previousConcept() {
    alert('Previous/undo functionality coming soon!');
}

function togglePause() {
    if (!state.conceptRevealed) {
        alert('Reveal the concept first!');
        return;
    }

    if (state.timerRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
    
    updatePauseButton();
}

function updatePauseButton() {
    const pauseBtn = document.querySelector('.control-btn');
    if (!pauseBtn) return;
    
    if (state.timerRunning) {
        pauseBtn.textContent = '||';
        pauseBtn.style.background = 'var(--yellow)';
    } else {
        pauseBtn.textContent = '▶';
        pauseBtn.style.background = 'var(--green)';
    }
}

function startTimer() {
    if (!state.timerStartTime) {
        state.timerStartTime = Date.now();
    } else {
        // Resume from pause
        state.timerStartTime = Date.now() - state.timerPausedTime;
    }
    
    state.timerRunning = true;
    
    state.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - state.timerStartTime) / 1000);
        state.timerSeconds = 120 - elapsed;
        
        updateTimerDisplay();
        checkTimerAudioCues();

        if (state.timerSeconds <= 0) {
            state.timerSeconds = 0;
            endRound();
        }
    }, 100); // Update every 100ms for smooth display
}

function pauseTimer() {
    state.timerRunning = false;
    state.timerPausedTime = Date.now() - state.timerStartTime;
    
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(state.timerSeconds / 60);
    const seconds = state.timerSeconds % 60;
    const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const timerEl = document.getElementById('timerDisplay');
    if (timerEl) {
        timerEl.textContent = display;
        
        // Color changes based on time remaining
        if (state.timerSeconds <= 10) {
            timerEl.style.background = 'var(--red)';
            timerEl.style.color = 'var(--cream)';
        } else if (state.timerSeconds <= 30) {
            timerEl.style.background = 'var(--yellow)';
            timerEl.style.color = 'var(--dark)';
        } else {
            timerEl.style.background = 'var(--yellow)';
            timerEl.style.color = 'var(--dark)';
        }
    }
}

function checkTimerAudioCues() {
    const t = state.timerSeconds;
    
    // Play audio cues at specific times (only once per second)
    if (t === 60) playAudio('warning60');
    else if (t === 30) playAudio('warning30');
    else if (t === 10) playAudio('warning10');
    else if (t === 5) playAudio('countdown5');
    else if (t === 4) playAudio('countdown4');
    else if (t === 3) playAudio('countdown3');
    else if (t === 2) playAudio('countdown2');
    else if (t === 1) playAudio('countdown1');
}

function endRound() {
    pauseTimer();
    playAudio('end');
    
    updateTimerDisplay();
    
    const conceptDisplay = document.getElementById('conceptDisplay');
    if (conceptDisplay) {
        conceptDisplay.textContent = 'ROUND OVER';
        conceptDisplay.style.cursor = 'default';
    }
    
    document.getElementById('nextRoundBtn').style.display = 'flex';
}

function scoreAlien(playerId) {
    if (!state.conceptRevealed || !state.timerRunning) return;

    const player = state.players.find(p => p.id === playerId);
    if (!player) return;

    // Award point to alien
    state.roundScores[playerId]++;
    player.score++;
    state.roundTotal++;

    // Show +1 animation
    showScoreAnimation(playerId, '+1', 'var(--green)');

    // Check for human milestone bonuses
    checkHumanMilestones();

    // Update displays
    updateRoundScoreDisplay();
    renderAlienPlayers();

    // Load next concept
    state.currentConcept = getRandomConcept();
    document.getElementById('conceptDisplay').textContent = state.currentConcept;
}

function showScoreAnimation(playerId, text, color) {
    // Find the player tile
    const tiles = document.querySelectorAll('.alien-tile, .human-tile');
    tiles.forEach(tile => {
        if (tile.textContent.includes(state.players.find(p => p.id === playerId)?.initials)) {
            const animation = document.createElement('div');
            animation.textContent = text;
            animation.style.position = 'absolute';
            animation.style.color = color;
            animation.style.fontFamily = 'var(--font-title)';
            animation.style.fontSize = '24px';
            animation.style.fontWeight = 'bold';
            animation.style.pointerEvents = 'none';
            animation.style.animation = 'floatUp 1s ease-out forwards';
            
            tile.style.position = 'relative';
            tile.appendChild(animation);
            
            setTimeout(() => animation.remove(), 1000);
        }
    });
}

function checkHumanMilestones() {
    const alienCount = getAlienCount();
    const humanPlayers = state.players.slice(alienCount);
    
    // Milestone logic: 3 → +1, 5 → +1, then 6, 7, 8, 9... → +1 each
    const milestones = [3, 5];
    for (let i = 6; i <= 50; i++) {
        milestones.push(i);
    }
    
    // Check if we just hit a milestone
    if (milestones.includes(state.roundTotal) && state.roundTotal > state.lastMilestone) {
        state.lastMilestone = state.roundTotal;
        
        // Award bonus point to all humans
        humanPlayers.forEach(h => {
            h.score++;
            showScoreAnimation(h.id, '+1', 'var(--yellow)');
        });
        
        // Show gold helmet animation
        showMilestoneAnimation();
    }
}

function showMilestoneAnimation() {
    const astronautScore = document.getElementById('astronautScore');
    if (astronautScore) {
        astronautScore.style.filter = 'brightness(1.5) saturate(1.5)';
        astronautScore.style.transform = 'scale(1.2)';
        
        setTimeout(() => {
            astronautScore.style.filter = '';
            astronautScore.style.transform = '';
        }, 500);
    }
}

function updateRoundScoreDisplay() {
    const astronautScore = document.getElementById('astronautScore');
    if (astronautScore) {
        astronautScore.textContent = state.roundTotal;
    }
}

function scoreHuman(playerId) {
    if (!state.conceptRevealed) return;

    const player = state.players.find(p => p.id === playerId);
    if (!player) return;

    state.roundScores[playerId]++;
    player.score++;

    const scoreEl = document.getElementById(`human-score-${playerId}`);
    if (scoreEl) scoreEl.textContent = state.roundScores[playerId];

    state.currentConcept = getRandomConcept();
    document.getElementById('conceptDisplay').textContent = state.currentConcept;
}

function checkHumanMilestones() {
    const alienCount = getAlienCount();
    const humanPlayers = state.players.slice(alienCount);

    const milestones = [3, 5];
    for (let i = 6; i <= 50; i++) {
        milestones.push(i);
    }

    if (milestones.includes(state.roundTotal)) {
        humanPlayers.forEach(h => h.score++);
    }
}

function goToInterRound() {
    if (state.players.length > 0) {
        const topPlayer = state.players.shift();
        state.players.push(topPlayer);
        state.currentRound++;
    }

    renderInterRound();
    showScreen('inter-round');
}

function renderInterRound() {
    const list = document.getElementById('interPlayersList');
    const alienCount = getAlienCount();

    list.innerHTML = '';

    const sortedPlayers = [...state.players].sort((a, b) => b.score - a.score);

    sortedPlayers.forEach((p, idx) => {
        const isNextAlien = state.players.indexOf(p) < alienCount;
        let teamClass = p.team ? (' ' + p.team) : '';

        const row = document.createElement('div');
        row.className = 'player-row' + (isNextAlien ? ' alien' : '') + teamClass;

        row.innerHTML = `
            <div class="player-name">${p.initials}</div>
            <div class="player-score">${p.score}</div>
        `;

        list.appendChild(row);
    });
}

function toggleEditMode() {
    state.editMode = !state.editMode;
    renderInterRound();
}

function nextRound() {
    const cycleLength = state.players.length;
    if (state.currentRound >= cycleLength * 2) {
        checkForWinner();
        return;
    }

    resetRound();
    showScreen('game');
}

function checkForWinner() {
    const sorted = [...state.players].sort((a, b) => b.score - a.score);
    const winner = sorted[0];

    document.getElementById('winnerName').textContent = winner.initials;
    document.getElementById('winnerScore').textContent = winner.score;

    const finalList = document.getElementById('finalScoresList');
    finalList.innerHTML = '';

    sorted.forEach(p => {
        const row = document.createElement('div');
        row.className = 'player-row';
        row.innerHTML = `
            <div class="player-name">${p.initials}</div>
            <div class="player-score">${p.score}</div>
        `;
        finalList.appendChild(row);
    });

    showScreen('end-game');
}

function continuePlaying() {
    resetRound();
    showScreen('game');
}

function initializeAudio() {
    // Create audio elements for timer cues
    state.audioElements = {
        warning60: createAudioElement('https://cdn.jsdelivr.net/gh/wix-ideas/woe-dashboard@main/audio/beep.mp3'),
        warning30: createAudioElement('https://cdn.jsdelivr.net/gh/wix-ideas/woe-dashboard@main/audio/beep.mp3'),
        warning10: createAudioElement('https://cdn.jsdelivr.net/gh/wix-ideas/woe-dashboard@main/audio/beep.mp3'),
        countdown5: createAudioElement('https://cdn.jsdelivr.net/gh/wix-ideas/woe-dashboard@main/audio/beep.mp3'),
        countdown4: createAudioElement('https://cdn.jsdelivr.net/gh/wix-ideas/woe-dashboard@main/audio/beep.mp3'),
        countdown3: createAudioElement('https://cdn.jsdelivr.net/gh/wix-ideas/woe-dashboard@main/audio/beep.mp3'),
        countdown2: createAudioElement('https://cdn.jsdelivr.net/gh/wix-ideas/woe-dashboard@main/audio/beep.mp3'),
        countdown1: createAudioElement('https://cdn.jsdelivr.net/gh/wix-ideas/woe-dashboard@main/audio/beep.mp3'),
        end: createAudioElement('https://cdn.jsdelivr.net/gh/wix-ideas/woe-dashboard@main/audio/end.mp3')
    };
}

function createAudioElement(src) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = 0.7;
    return audio;
}

function playAudio(key) {
    if (!state.audioEnabled || !state.audioElements[key]) return;
    
    try {
        const audio = state.audioElements[key];
        audio.currentTime = 0;
        audio.play().catch(err => console.log('Audio play failed:', err));
    } catch (err) {
        console.log('Audio error:', err);
    }
}

window.addEventListener('load', () => {
    screenManager = new ScreenManager();
    gameStateManager = new GameStateManager();
    
    window.screenManager = screenManager;
    window.gameStateManager = gameStateManager;
    
    initializeAudio();
    updateStartButton();
    updateNSFWUI();
    
    // Show setup screen after a brief delay to ensure everything is loaded
    setTimeout(() => {
        showScreen('setup');
    }, 100);
});

window.selectMode = selectMode;
window.handleModeChange = handleModeChange;
window.closeModeSelect = closeModeSelect;
window.openMenu = openMenu;
window.closeMenu = closeMenu;
window.showTutorial = showTutorial;
window.confirmNewGame = confirmNewGame;
window.confirmExit = confirmExit;
window.exitGame = exitGame;
window.toggleNSFW = toggleNSFW;
window.showAddMode = showAddMode;
window.cancelAddPlayer = cancelAddPlayer;
window.confirmAddPlayer = confirmAddPlayer;
window.editPlayer = editPlayer;
window.savePlayerEdit = savePlayerEdit;
window.movePlayerUp = movePlayerUp;
window.movePlayerDown = movePlayerDown;
window.deletePlayer = deletePlayer;
window.startGame = startGame;
window.revealConcept = revealConcept;
window.skipConcept = skipConcept;
window.previousConcept = previousConcept;
window.togglePause = togglePause;
window.scoreAlien = scoreAlien;
window.scoreHuman = scoreHuman;
window.goToInterRound = goToInterRound;
window.toggleEditMode = toggleEditMode;
window.nextRound = nextRound;
window.continuePlaying = continuePlaying;
window.goToLanding = goToLanding;
window.handleAddPlayerKeydown = handleAddPlayerKeydown;