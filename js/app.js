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
    editMode: false
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
    screenManager.showScreen(screenId);
}

function goToLanding() {
    document.getElementById('modeSelectModal').classList.add('active');
}

function selectMode(modeKey) {
    state.mode = modeKey;
    state.players = [];
    state.currentRound = 1;
    state.currentCycle = 0;
    closeModeSelect();
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
    document.getElementById('modeSelectModal').classList.remove('active');
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
    const pill = document.getElementById('nsfwPill');
    const sw = document.getElementById('nsfwSwitch');

    if (state.nsfwEnabled) {
        pill.classList.add('active');
        sw.classList.add('active');
    } else {
        pill.classList.remove('active');
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
                    <button class="tool-btn delete" onclick="deletePlayer('${p.id}')">×</button>
                    <button class="tool-btn" onclick="movePlayerUp('${p.id}')">▲</button>
                    <button class="tool-btn" onclick="movePlayerDown('${p.id}')">▼</button>
                    <button class="tool-btn" onclick="savePlayerEdit('${p.id}')">✓</button>
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
                <div class="row-tools">
                    <button class="tool-btn delete" onclick="deletePlayer('${p.id}')">×</button>
                    <button class="tool-btn" onclick="editPlayer('${p.id}')">✏</button>
                </div>
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
    showScreen('game');
}

function resetRound() {
    state.timerSeconds = 120;
    state.timerRunning = false;
    state.conceptRevealed = false;
    state.currentConcept = '';
    state.roundTotal = 0;
    state.roundScores = {};

    state.players.forEach(p => {
        state.roundScores[p.id] = 0;
    });

    document.getElementById('conceptDisplay').textContent = 'TAP TO REVEAL';
    document.getElementById('nextRoundBtn').style.display = 'none';

    renderAlienPlayers();
}

function renderAlienPlayers() {
    const container = document.getElementById('alienPlayers');
    const alienCount = getAlienCount();

    container.innerHTML = '';

    state.players.slice(0, alienCount).forEach((p, idx) => {
        const tile = document.createElement('div');
        let teamClass = p.team ? (' ' + p.team) : '';
        tile.className = 'alien-tile' + teamClass;
        tile.onclick = () => scoreAlien(p.id);

        tile.innerHTML = `
            <div class="alien-initials">${p.initials}</div>
            <div class="alien-score" id="alien-score-${p.id}">0</div>
        `;

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

    document.getElementById('conceptDisplay').textContent = state.currentConcept;
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
}

function startTimer() {
    state.timerRunning = true;
    state.timerInterval = setInterval(() => {
        state.timerSeconds--;

        if (state.timerSeconds <= 0) {
            endRound();
        }
    }, 1000);
}

function pauseTimer() {
    state.timerRunning = false;
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}

function endRound() {
    pauseTimer();
    document.getElementById('nextRoundBtn').style.display = 'flex';
}

function scoreAlien(playerId) {
    if (!state.conceptRevealed) return;

    const player = state.players.find(p => p.id === playerId);
    if (!player) return;

    state.roundScores[playerId]++;
    player.score++;
    state.roundTotal++;

    const scoreEl = document.getElementById(`alien-score-${playerId}`);
    if (scoreEl) scoreEl.textContent = state.roundScores[playerId];

    checkHumanMilestones();

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

window.addEventListener('load', () => {
    screenManager = new ScreenManager();
    gameStateManager = new GameStateManager();
    
    window.screenManager = screenManager;
    window.gameStateManager = gameStateManager;
    
    updateStartButton();
    goToLanding();
    updateNSFWUI();
});

window.selectMode = selectMode;
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
window.goToInterRound = goToInterRound;
window.toggleEditMode = toggleEditMode;
window.nextRound = nextRound;
window.continuePlaying = continuePlaying;
window.goToLanding = goToLanding;
window.handleAddPlayerKeydown = handleAddPlayerKeydown;