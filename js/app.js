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
    audioElements: {},
    timerButtonState: 'timer' // 'timer', 'start', 'next-round'
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
    // Remove game mode styling when going back to setup
    document.body.classList.remove('game-mode');
    
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

let menuOpen = false;

function toggleMenu(event) {
    // Prevent event from bubbling if event is provided
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    console.log('toggleMenu called, current menuOpen:', menuOpen);
    const popover = document.getElementById('menuPopover');
    
    if (!popover) {
        console.error('menuPopover not found');
        return;
    }
    
    menuOpen = !menuOpen;
    console.log('toggleMenu new menuOpen:', menuOpen);
    
    // Update all menu buttons across all screens
    const menuButtons = [
        { bars: 'menuBars', x: 'menuX' }, // Setup screen
        { bars: 'menuBarsInterRound', x: 'menuXInterRound' }, // Inter-round screen
        { bars: 'menuBarsEndGame', x: 'menuXEndGame' } // End-game screen
    ];
    
    if (menuOpen) {
        popover.classList.add('active');
        
        // Update all menu button icons
        menuButtons.forEach(btn => {
            const bars = document.getElementById(btn.bars);
            const x = document.getElementById(btn.x);
            if (bars) bars.style.display = 'none';
            if (x) x.style.display = 'flex';
        });
        
        // Add click outside listener
        setTimeout(() => {
            document.addEventListener('click', closeMenuOnClickOutside);
        }, 0);
    } else {
        popover.classList.remove('active');
        
        // Update all menu button icons
        menuButtons.forEach(btn => {
            const bars = document.getElementById(btn.bars);
            const x = document.getElementById(btn.x);
            if (bars) bars.style.display = 'flex';
            if (x) x.style.display = 'none';
        });
        
        // Remove click outside listener
        document.removeEventListener('click', closeMenuOnClickOutside);
    }
}

function closeMenuOnClickOutside(event) {
    const popover = document.getElementById('menuPopover');
    const menuBtns = [
        document.getElementById('menuBtn'),
        document.getElementById('menuBtnInterRound'),
        document.getElementById('menuBtnEndGame')
    ].filter(btn => btn !== null);
    
    // Check if click is outside both popover and all menu buttons
    const clickedMenuBtn = menuBtns.some(btn => btn.contains(event.target));
    
    if (popover && !popover.contains(event.target) && !clickedMenuBtn) {
        closeMenu();
    }
}

function openMenu() {
    if (!menuOpen) toggleMenu();
}

function closeMenu() {
    if (menuOpen) toggleMenu();
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
        // Remove game mode styling
        document.body.classList.remove('game-mode');
        
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
    console.log('toggleNSFW called, current state:', state.nsfwEnabled);
    state.nsfwEnabled = !state.nsfwEnabled;
    console.log('toggleNSFW new state:', state.nsfwEnabled);
    updateNSFWUI();
}

function updateNSFWUI() {
    const sw = document.getElementById('nsfwSwitch');
    const label = document.querySelector('.nsfw-label');

    if (state.nsfwEnabled) {
        sw.classList.add('active');
        label.classList.add('active');
    } else {
        sw.classList.remove('active');
        label.classList.remove('active');
    }
}

function normalizeInitials(str) {
    return String(str).trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
}

function getAlienCount() {
    return Math.floor(state.players.length / 2);
}

function showAddMode() {
    const addBtn = document.getElementById('wideAddBtn');
    const addRow = document.getElementById('addPlayerRow');
    
    // Hide the + button and show the input row right after it
    addBtn.style.display = 'none';
    addRow.style.display = 'flex';
    
    // Focus on the input
    const input = document.getElementById('addPlayerInput');
    if (input) {
        setTimeout(() => input.focus(), 50);
    }
}

function cancelAddPlayer() {
    const addBtn = document.getElementById('wideAddBtn');
    const addRow = document.getElementById('addPlayerRow');
    const input = document.getElementById('addPlayerInput');
    
    // Show the + button and hide the input row
    addBtn.style.display = 'flex';
    addRow.style.display = 'none';
    input.value = '';
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
    
    // Hide input form and show + button after adding
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
    const addBtn = document.getElementById('wideAddBtn');

    // Store the add button temporarily
    let addBtnParent = addBtn.parentElement;
    let addBtnNextSibling = addBtn.nextSibling;

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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m18 15-6-6-6 6"/></svg>
                    </button>
                    <button class="tool-btn" onclick="movePlayerDown('${p.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    <button class="tool-btn" onclick="savePlayerEdit('${p.id}')">
                        <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    </button>
                </div>
            `;
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

    // Handle add button positioning
    if (state.players.length === 0) {
        // No players - button should be in original position (outside players-wrap)
        if (addBtnParent.classList.contains('players-list')) {
            const playersWrap = document.querySelector('.players-wrap');
            playersWrap.parentElement.insertBefore(addBtn, playersWrap);
        }
    } else {
        // Players exist - move button to end of players list
        list.appendChild(addBtn);
    }

    // Focus on edit input if needed
    const editingPlayer = state.players.find(p => p.editing);
    if (editingPlayer) {
        setTimeout(() => {
            const input = document.getElementById(`edit-${editingPlayer.id}`);
            if (input) {
                input.focus();
                input.select();
            }
        }, 0);
    }
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
    
    // Add game mode styling
    document.body.classList.add('game-mode');
    
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
    state.timerButtonState = 'timer';

    state.players.forEach(p => {
        state.roundScores[p.id] = 0;
    });

    document.getElementById('conceptDisplay').textContent = 'TAP TO REVEAL';
    document.getElementById('conceptDisplay').style.cursor = 'pointer';
    
    updateTimerButton();
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
    
    // Change timer button to START
    state.timerButtonState = 'start';
    updateTimerButton();
}

function startTimerFromButton() {
    // Change button back to timer mode
    state.timerButtonState = 'timer';
    updateTimerButton();
    
    // Start the timer
    startTimer();
    updatePauseButton();
}

function handleTimerButtonClick() {
    if (state.timerButtonState === 'start') {
        // START button clicked - begin timer
        startTimerFromButton();
    } else if (state.timerButtonState === 'next-round') {
        // NEXT ROUND button clicked
        goToInterRound();
    }
    // If state is 'timer', button is not clickable (just displays time)
}

function updateTimerButton() {
    const timerBtn = document.getElementById('timerButton');
    if (!timerBtn) return;
    
    timerBtn.classList.remove('start-mode', 'next-round-mode');
    
    if (state.timerButtonState === 'timer') {
        // Show timer
        const minutes = Math.floor(state.timerSeconds / 60);
        const seconds = state.timerSeconds % 60;
        timerBtn.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        timerBtn.style.background = 'var(--yellow)';
        timerBtn.style.cursor = 'default';
        
        // Color changes based on time remaining
        if (state.timerSeconds <= 10) {
            timerBtn.style.background = 'var(--red)';
            timerBtn.style.color = 'var(--cream)';
        } else if (state.timerSeconds <= 30) {
            timerBtn.style.background = 'var(--yellow)';
            timerBtn.style.color = 'var(--dark)';
        } else {
            timerBtn.style.background = 'var(--yellow)';
            timerBtn.style.color = 'var(--dark)';
        }
    } else if (state.timerButtonState === 'start') {
        // Show START button
        timerBtn.textContent = 'START';
        timerBtn.classList.add('start-mode');
    } else if (state.timerButtonState === 'next-round') {
        // Show NEXT ROUND button
        timerBtn.textContent = 'NEXT ROUND';
        timerBtn.classList.add('next-round-mode');
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
    
    // Check if START button is still showing
    if (state.timerButtonState === 'start') {
        alert('Click START to begin the timer!');
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
    const pauseBtn = document.getElementById('pauseBtn');
    if (!pauseBtn) return;
    
    if (state.timerRunning) {
        pauseBtn.textContent = '||';
        pauseBtn.style.background = 'var(--yellow)';
    } else {
        pauseBtn.textContent = '▶';
        pauseBtn.style.background = 'var(--yellow)';
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
    updateTimerButton();
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
    
    // Change timer button to NEXT ROUND
    state.timerButtonState = 'next-round';
    updateTimerButton();
}

function scoreAlien(playerId) {
    // Check if timer has started (button should be in timer mode and running)
    if (state.timerButtonState !== 'timer' || !state.timerRunning) {
        return; // Don't allow scoring before timer starts
    }
    
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

    // Update displays (don't re-render players to preserve animations)
    updateRoundScoreDisplay();

    // Load next concept
    state.currentConcept = getRandomConcept();
    document.getElementById('conceptDisplay').textContent = state.currentConcept;
}

function showScoreAnimation(playerId, text, color) {
    // Find the player tile
    const player = state.players.find(p => p.id === playerId);
    if (!player) return;
    
    const tiles = document.querySelectorAll('.alien-tile, .human-tile');
    tiles.forEach(tile => {
        if (tile.textContent.trim() === player.initials) {
            const animation = document.createElement('div');
            animation.textContent = text;
            animation.style.position = 'absolute';
            animation.style.color = color;
            animation.style.fontFamily = 'var(--font-title)';
            animation.style.fontSize = '28px';
            animation.style.fontWeight = 'bold';
            animation.style.pointerEvents = 'none';
            animation.style.animation = 'floatUp 1s ease-out forwards';
            animation.style.zIndex = '100';
            animation.style.textShadow = '-2px -2px 0 var(--dark), 2px -2px 0 var(--dark), -2px 2px 0 var(--dark), 2px 2px 0 var(--dark)';
            
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
        // Switch to gold helmet
        astronautScore.classList.add('gold');
        astronautScore.style.filter = 'brightness(1.5) saturate(1.5)';
        astronautScore.style.transform = 'scale(1.2)';
        
        setTimeout(() => {
            astronautScore.style.filter = '';
            astronautScore.style.transform = '';
            // Keep gold helmet for a few seconds, then back to normal
            setTimeout(() => {
                astronautScore.classList.remove('gold');
            }, 2000);
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
    
    // Re-apply game mode styling
    document.body.classList.add('game-mode');
    
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
    
    // Re-apply game mode styling
    document.body.classList.add('game-mode');
    
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
    
    // Add event listeners for buttons - wait for DOM to be ready
    setTimeout(() => {
        const wideAddBtn = document.getElementById('wideAddBtn');
        if (wideAddBtn) {
            wideAddBtn.addEventListener('click', showAddMode);
        }
        
        const nsfwSwitch = document.getElementById('nsfwSwitch');
        if (nsfwSwitch) {
            console.log('Adding click listener to nsfwSwitch');
            nsfwSwitch.addEventListener('click', function(e) {
                console.log('nsfwSwitch clicked');
                e.preventDefault();
                e.stopPropagation();
                toggleNSFW();
            });
        }
        
        const nsfwLabel = document.querySelector('.nsfw-label');
        if (nsfwLabel) {
            console.log('Adding click listener to nsfwLabel');
            nsfwLabel.addEventListener('click', function(e) {
                console.log('nsfwLabel clicked');
                e.preventDefault();
                e.stopPropagation();
                toggleNSFW();
            });
        }
        
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', startGame);
        }
        
        // Add event listeners for add player row buttons
        const cancelBtn = document.querySelector('#addPlayerRow .tool-btn.delete');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', cancelAddPlayer);
        }
        
        const confirmBtn = document.querySelector('#addPlayerRow .tool-btn:last-child');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', confirmAddPlayer);
        }
    }, 100);
    
    // Show setup screen after a brief delay to ensure everything is loaded
    setTimeout(() => {
        showScreen('setup');
    }, 200);
});

window.selectMode = selectMode;
window.handleModeChange = handleModeChange;
window.closeModeSelect = closeModeSelect;
window.toggleMenu = toggleMenu;
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
window.handleTimerButtonClick = handleTimerButtonClick;
window.startTimerFromButton = startTimerFromButton;
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