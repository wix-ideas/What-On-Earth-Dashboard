// Game State
const state = {
    mode: 'woe',
    nsfwEnabled: false,
    players: [],
    addMode: false
};

// Game modes configuration
const modes = {
    woe: { minPlayers: 4, title: 'What On Earth' },
    skeleton: { minPlayers: 2, title: 'Skeleton Crew' },
    encounters: { minPlayers: 4, title: 'Close Encounters' },
    space: { minPlayers: 4, title: 'Space Race' }
};

// Concepts for each mode
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

// Utility functions
function normalizeInitials(str) {
    return String(str).trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
}

function getAlienCount() {
    return Math.floor(state.players.length / 2);
}

// NSFW Toggle
function toggleNSFW() {
    state.nsfwEnabled = !state.nsfwEnabled;
    updateNSFWUI();
}

function updateNSFWUI() {
    const label = document.querySelector('.nsfw-label');
    const switchBtn = document.getElementById('nsfwSwitch');

    if (state.nsfwEnabled) {
        label.classList.add('active');
        switchBtn.classList.add('active');
    } else {
        label.classList.remove('active');
        switchBtn.classList.remove('active');
    }
}

// Player Management
function showAddMode() {
    state.addMode = true;
    document.getElementById('addBtn').classList.add('d-none');
    document.getElementById('addPlayerRow').classList.remove('d-none');
    document.getElementById('addPlayerInput').focus();
}

function cancelAddPlayer() {
    state.addMode = false;
    document.getElementById('addBtn').classList.remove('d-none');
    document.getElementById('addPlayerRow').classList.add('d-none');
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
        score: 0
    });

    input.value = '';
    renderPlayers();
    updateStartButton();
    cancelAddPlayer();
}

function deletePlayer(id) {
    state.players = state.players.filter(p => p.id !== id);
    renderPlayers();
    updateStartButton();
}

function renderPlayers() {
    const list = document.getElementById('playersList');
    const alienCount = getAlienCount();

    list.innerHTML = '';

    state.players.forEach((player, index) => {
        const isAlien = index < alienCount;
        const row = document.createElement('div');
        row.className = `player-row ${isAlien ? 'alien' : ''}`;

        row.innerHTML = `
            <div class="player-icon"></div>
            <div class="player-name">${player.initials}</div>
            <div class="player-tools">
                <button class="btn tool-btn" onclick="deletePlayer('${player.id}')">×</button>
            </div>
        `;

        list.appendChild(row);
    });
}

// Game Management
function updateStartButton() {
    const btn = document.getElementById('startBtn');
    const mode = modes[state.mode];
    const minPlayers = mode ? mode.minPlayers : 4;

    btn.disabled = state.players.length < minPlayers;
}

function startGame() {
    const mode = modes[state.mode];
    const minPlayers = mode ? mode.minPlayers : 4;

    if (state.players.length < minPlayers) {
        alert(`This mode requires at least ${minPlayers} players.`);
        return;
    }

    alert('Game starting! (Game screen implementation coming soon)');
}

// Menu Functions
function showTutorial() {
    alert('Tutorial coming soon! For now:\n\n1. Add players (top half are Aliens)\n2. Start game\n3. Reveal concept, start timer\n4. Tap alien names to score\n5. Humans get bonus points at milestones (3, 5, 6, 7... correct)');
}

function confirmNewGame() {
    if (confirm('Start a new game? All progress will be lost.')) {
        state.players = [];
        state.nsfwEnabled = false;
        renderPlayers();
        updateNSFWUI();
        updateStartButton();
    }
}

function confirmExit() {
    if (confirm('Exit to main menu? All progress will be lost.')) {
        // Exit logic here
        alert('Exiting game...');
    }
}

// Event Handlers
function handleAddPlayerKeydown(event) {
    if (event.key === 'Enter') {
        confirmAddPlayer();
    } else if (event.key === 'Escape') {
        cancelAddPlayer();
    }
}

// Mode Selection
document.getElementById('modeDropdown').addEventListener('change', function(event) {
    state.mode = event.target.value;
    updateStartButton();
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateNSFWUI();
    updateStartButton();
    renderPlayers();
});