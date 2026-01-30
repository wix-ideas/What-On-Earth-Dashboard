import { wixComm } from './WixCommunication.js';

export class GameStateManager {
    constructor() {
        this.state = {
            gameMode: null,
            nsfwEnabled: false,
            players: [],
            currentRound: 1,
            gamePhase: 'setup',
            scores: {},
            settings: {},
            conceptCache: [],
            availableModes: [],
            concepts: []
        };
        
        this.loadState();
        this.setupWixCommunication();
    }
    
    setupWixCommunication() {
        wixComm.onMessage('INIT', (data) => {
            this.initializeFromWix(data);
        });
        
        wixComm.onMessage('CONCEPTS', (concepts) => {
            this.updateConcepts(concepts);
        });
    }
    
    initializeFromWix(data) {
        this.state.availableModes = data.modes || [];
        this.state.concepts = data.concepts || [];
        this.state.sessionId = data.sessionId;
        
        if (data.mode) {
            this.state.gameMode = data.mode.modeKey;
            this.state.currentModeData = data.mode;
        }
        
        this.state.nsfwEnabled = data.nsfwEnabled || false;
        this.saveState();
        
        wixComm.logEvent('DASHBOARD_INIT', {
            modesCount: this.state.availableModes.length,
            conceptsCount: this.state.concepts.length,
            initialMode: this.state.gameMode
        });
    }
    
    updateConcepts(concepts) {
        this.state.concepts = concepts;
        this.saveState();
    }
    
    setGameMode(mode) {
        this.state.gameMode = mode;
        
        const modeData = this.state.availableModes.find(m => m.modeKey === mode);
        if (modeData) {
            this.state.currentModeData = modeData;
        }
        
        wixComm.requestConcepts(mode, this.state.nsfwEnabled);
        wixComm.logEvent('MODE_SELECTED', { mode });
        
        this.saveState();
    }
    
    setNSFWEnabled(enabled) {
        this.state.nsfwEnabled = enabled;
        
        if (this.state.gameMode) {
            wixComm.requestConcepts(this.state.gameMode, enabled);
        }
        
        wixComm.logEvent('NSFW_TOGGLED', { enabled });
        this.saveState();
    }
    
    getMinPlayersForMode() {
        if (this.state.currentModeData) {
            return this.state.currentModeData.minPlayers || 4;
        }
        
        const modes = {
            'base': 4,
            'skeleton': 2,
            'encounters': 4,
            'space': 4
        };
        
        return modes[this.state.gameMode] || 4;
    }
    
    getPlayerCount() {
        return this.state.players.length;
    }
    
    initializeGame() {
        this.state.gamePhase = 'active';
        this.state.currentRound = 1;
        this.state.scores = {};
        
        this.state.players.forEach(player => {
            this.state.scores[player.id] = 0;
        });
        
        this.saveState();
    }
    
    checkGameEnd() {
        return this.state.currentRound >= this.state.players.length * 2;
    }
    
    advanceRound() {
        this.state.currentRound++;
        this.state.gamePhase = 'active';
        this.saveState();
    }
    
    reset() {
        this.state = {
            gameMode: null,
            nsfwEnabled: false,
            players: [],
            currentRound: 1,
            gamePhase: 'setup',
            scores: {},
            settings: {},
            conceptCache: [],
            availableModes: [],
            concepts: []
        };
        
        this.saveState();
    }
    
    resetToSetup() {
        this.state.gamePhase = 'setup';
        this.state.currentRound = 1;
        this.state.scores = {};
        this.saveState();
    }
    
    initiateTiebreaker() {
        this.state.gamePhase = 'tiebreaker';
        this.saveState();
    }
    
    toggleScoreEditMode() {
        this.state.scoreEditMode = !this.state.scoreEditMode;
        this.saveState();
        return this.state.scoreEditMode;
    }
    
    toggleTimer() {
        
    }
    
    pauseTimer() {
        
    }
    
    getTimerState() {
        return {
            display: '2:00',
            isRunning: false
        };
    }
    
    skipConcept() {
        
    }
    
    previousConcept() {
        
    }
    
    revealConcept() {
        
    }
    
    getConceptState() {
        return {
            current: 'SAMPLE CONCEPT',
            revealed: false
        };
    }
    
    saveState() {
        try {
            localStorage.setItem('gameState', JSON.stringify(this.state));
        } catch (error) {
            console.error('Failed to save game state:', error);
        }
    }
    
    loadState() {
        try {
            const savedState = localStorage.getItem('gameState');
            if (savedState) {
                const parsedState = JSON.parse(savedState);
                this.state = { ...this.state, ...parsedState };
            }
        } catch (error) {
            console.error('Failed to load game state:', error);
        }
    }
    
    getState() {
        return { ...this.state };
    }
}