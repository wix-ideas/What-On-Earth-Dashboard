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
        // Cross-browser fullscreen change events
        document.addEventListener('fullscreenchange', () => {
            this.handleFullscreenChange();
        });
        
        document.addEventListener('webkitfullscreenchange', () => {
            this.handleFullscreenChange();
        });
        
        document.addEventListener('mozfullscreenchange', () => {
            this.handleFullscreenChange();
        });
        
        document.addEventListener('MSFullscreenChange', () => {
            this.handleFullscreenChange();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen()) {
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
        
        // Cross-browser fullscreen implementation
        const element = document.documentElement;
        
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            // Firefox
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            // Safari/Chrome/Edge
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) {
            // IE11
            element.msRequestFullscreen();
        }
        
        // Mobile-specific optimizations
        setTimeout(() => {
            // Force scroll to hide address bar
            window.scrollTo(0, 1);
            
            // Set viewport for better mobile experience
            const viewport = document.querySelector('meta[name=viewport]');
            if (viewport) {
                viewport.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no, minimal-ui');
            }
            
            // Lock orientation to landscape if possible
            if (window.screen && window.screen.orientation) {
                try {
                    window.screen.orientation.lock('landscape');
                } catch (e) {
                    console.log('Orientation lock not supported');
                }
            }
        }, 100);
    }
    
    exitFullscreen() {
        document.body.classList.remove('fullscreen-mode');
        
        // Cross-browser exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            // Safari/Chrome/Edge
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            // IE11
            document.msExitFullscreen();
        }
    }
    
    handleFullscreenChange() {
        const isFullscreen = this.isFullscreen();
        
        if (isFullscreen) {
            document.body.classList.add('fullscreen-mode');
        } else {
            document.body.classList.remove('fullscreen-mode');
            if (this.currentScreen === 'game') {
                this.showScreen('inter-round');
            }
        }
    }
    
    isFullscreen() {
        return !!(document.fullscreenElement || 
                 document.webkitFullscreenElement || 
                 document.mozFullScreenElement || 
                 document.msFullscreenElement);
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