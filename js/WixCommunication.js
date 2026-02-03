export class WixCommunication {
    constructor() {
        this.messageHandlers = {};
        this.isInitialized = false;
        this.sessionId = null;
        this.currentMode = null;
        
        this.setupMessageListener();
        this.setupHeightUpdates();
    }
    
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            const message = event.data;
            if (!message || !message.type) return;
            
            this.handleMessage(message);
        });
    }
    
    handleMessage(message) {
        switch (message.type) {
            case 'INIT':
                this.handleInit(message.data);
                break;
            case 'CONCEPTS':
                this.handleConcepts(message.data);
                break;
            case 'FATAL':
                this.handleFatalError(message.message);
                break;
            default:
                if (this.messageHandlers[message.type]) {
                    this.messageHandlers[message.type].forEach(handler => {
                        handler(message.data);
                    });
                }
        }
    }
    
    handleInit(data) {
        this.sessionId = data.sessionId;
        this.currentMode = data.mode;
        this.isInitialized = true;
        
        if (window.gameStateManager) {
            window.gameStateManager.initializeFromWix(data);
        }
        
        this.notifyHandlers('INIT', data);
    }
    
    handleConcepts(concepts) {
        if (window.gameStateManager) {
            window.gameStateManager.updateConcepts(concepts);
        }
        
        this.notifyHandlers('CONCEPTS', concepts);
    }
    
    handleFatalError(message) {
        console.error('Fatal error from Wix:', message);
        
        const errorElement = document.getElementById('errorDisplay');
        if (errorElement) {
            errorElement.textContent = `Error: ${message}`;
            errorElement.style.display = 'block';
        }
        
        this.notifyHandlers('FATAL_ERROR', message);
    }
    
    sendMessage(type, data = {}) {
        const message = { type, ...data };
        
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(message, '*');
        }
    }
    
    requestConcepts(modeKey, nsfwEnabled = false) {
        this.sendMessage('REQUEST_CONCEPTS', {
            modeKey,
            nsfwEnabled
        });
    }
    
    logEvent(eventType, payload = {}) {
        this.sendMessage('LOG', {
            modeKey: this.currentMode?.modeKey,
            eventType,
            payload
        });
    }
    
    logGameStart(gameData) {
        this.sendMessage('START_GAME', {
            modeKey: this.currentMode?.modeKey,
            data: gameData
        });
    }
    
    updateHeight(height) {
        this.sendMessage('SET_HEIGHT', { h: height });
    }
    
    onMessage(type, handler) {
        if (!this.messageHandlers[type]) {
            this.messageHandlers[type] = [];
        }
        this.messageHandlers[type].push(handler);
        
        return () => {
            const handlers = this.messageHandlers[type];
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        };
    }
    
    notifyHandlers(type, data) {
        if (this.messageHandlers[type]) {
            this.messageHandlers[type].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`Error in message handler for ${type}:`, error);
                }
            });
        }
    }
    
    setupHeightUpdates() {
        window.addEventListener('resize', () => {
            this.updateHeightFromContent();
        });
        
        setInterval(() => {
            this.updateHeightFromContent();
        }, 1000);
        
        setTimeout(() => {
            this.updateHeightFromContent();
        }, 100);
    }
    
    updateHeightFromContent() {
        const body = document.body;
        const html = document.documentElement;
        
        const height = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight,
            480
        );
        
        this.updateHeight(height);
    }
    
    isReady() {
        return this.isInitialized;
    }
    
    getSessionId() {
        return this.sessionId;
    }
    
    getCurrentMode() {
        return this.currentMode;
    }
}

export const wixComm = new WixCommunication();