export class ScreenManager {
    constructor() {
        this.currentScreen = null;
        this.navigationStack = [];
        this.screenStates = {};
        this.transitionDuration = 300;
        this.isTransitioning = false;
        
        this.initializeScreens();
        this.setupFullscreenHandlers();
    }
    
    initializeScreens() {
        this.screens = {
            'landing': document.getElementById('landingScreen'),
            'setup': document.getElementById('setupScreen'), 
            'game': document.getElementById('gameScreen'),
            'inter-round': document.getElementById('interRoundScreen'),
            'end-game': document.getElementById('endGameScreen'),
            'menu': document.getElementById('menuModal')
        };
        
        Object.values(this.screens).forEach(screen => {
            if (screen) {
                screen.style.display = 'none';
                screen.classList.add('screen-transition');
            }
        });
    }
    
    setupFullscreenHandlers() {
        document.addEventListener('fullscreenchange', () => {
            this.handleFullscreenChange();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.fullscreenElement) {
                this.exitFullscreen();
            }
        });
    }
    
    showScreen(screenName, data = {}, addToStack = true) {
        if (this.isTransitioning) {
            return false;
        }
        
        const targetScreen = this.screens[screenName];
        if (!targetScreen) {
            console.error(`Screen '${screenName}' not found`);
            return false;
        }
        
        this.isTransitioning = true;
        
        if (this.currentScreen) {
            this.saveScreenState(this.currentScreen);
            
            if (addToStack && this.currentScreen !== screenName) {
                this.navigationStack.push({
                    screen: this.currentScreen,
                    state: this.screenStates[this.currentScreen]
                });
            }
        }
        
        this.performTransition(this.currentScreen, screenName, data);
        
        if (screenName === 'game') {
            this.enterFullscreen();
        } else if (this.currentScreen === 'game') {
            this.exitFullscreen();
        }
        
        return true;
    }
    
    performTransition(fromScreen, toScreen, data) {
        const currentScreenElement = fromScreen ? this.screens[fromScreen] : null;
        const targetScreenElement = this.screens[toScreen];
        
        if (currentScreenElement) {
            currentScreenElement.classList.add('screen-fade-out');
            
            setTimeout(() => {
                currentScreenElement.style.display = 'none';
                currentScreenElement.classList.remove('screen-fade-out');
            }, this.transitionDuration / 2);
        }
        
        setTimeout(() => {
            targetScreenElement.style.display = 'flex';
            targetScreenElement.classList.add('screen-fade-in');
            
            this.currentScreen = toScreen;
            this.restoreScreenState(toScreen, data);
            sessionStorage.setItem('currentScreen', toScreen);
            
            setTimeout(() => {
                this.isTransitioning = false;
                targetScreenElement.classList.remove('screen-fade-in');
            }, this.transitionDuration / 2);
            
        }, this.transitionDuration / 2);
    }
    
    navigateBack() {
        if (this.navigationStack.length === 0) {
            return false;
        }
        
        const previousScreen = this.navigationStack.pop();
        this.showScreen(previousScreen.screen, previousScreen.state, false);
        return true;
    }
    
    enterFullscreen() {
        document.body.classList.add('fullscreen-mode');
        
        // Try the Fullscreen API (works on desktop and some mobile browsers)
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen().catch(() => {
                console.log('Fullscreen API not supported, using CSS fallback');
            });
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    
    exitFullscreen() {
        document.body.classList.remove('fullscreen-mode');
        
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
    
    handleFullscreenChange() {
        const isFullscreen = !!(document.fullscreenElement || 
                               document.webkitFullscreenElement || 
                               document.msFullscreenElement);
        
        if (isFullscreen) {
            document.body.classList.add('fullscreen-mode');
        } else {
            document.body.classList.remove('fullscreen-mode');
            if (this.currentScreen === 'game') {
                this.showScreen('inter-round');
            }
        }
    }
    
    saveScreenState(screenName) {
        const state = {
            timestamp: Date.now(),
            scrollPosition: 0,
            formData: {}
        };
        
        this.screenStates[screenName] = state;
        sessionStorage.setItem(`screenState_${screenName}`, JSON.stringify(state));
    }
    
    restoreScreenState(screenName, additionalData = {}) {
        let savedState = this.screenStates[screenName];
        
        if (!savedState) {
            const sessionState = sessionStorage.getItem(`screenState_${screenName}`);
            if (sessionState) {
                try {
                    savedState = JSON.parse(sessionState);
                    this.screenStates[screenName] = savedState;
                } catch (e) {
                    console.error('Failed to parse saved screen state:', e);
                }
            }
        }
    }
    
    getCurrentScreen() {
        return this.currentScreen;
    }
    
    canNavigateBack() {
        return this.navigationStack.length > 0;
    }
    
    clearNavigationStack() {
        this.navigationStack = [];
    }
    
    reset() {
        this.currentScreen = null;
        this.navigationStack = [];
        this.screenStates = {};
        
        sessionStorage.removeItem('currentScreen');
        Object.keys(this.screens).forEach(screenName => {
            sessionStorage.removeItem(`screenState_${screenName}`);
        });
    }
    
    restoreFromSession() {
        const savedScreen = sessionStorage.getItem('currentScreen');
        if (savedScreen && this.screens[savedScreen]) {
            this.showScreen(savedScreen, {}, false);
        } else {
            this.showScreen('landing', {}, false);
        }
    }
}