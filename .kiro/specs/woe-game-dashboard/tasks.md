# Implementation Plan: WOE Game Dashboard

## Overview

This implementation plan breaks down the WOE Game Dashboard into discrete coding tasks that build incrementally. The system will be built using Wix Editor with Velo (JavaScript) for a mobile-first party game host console. Each task focuses on specific functionality while ensuring integration with previous components.

## Tasks

- [x] 1. Set up project structure and core systems
  - [x] 1.1 Create Wix site structure and page layouts
    - Set up main dashboard page with responsive mobile-first design
    - Create page elements for all screen states (landing, setup, game, inter-round, end-game)
    - Configure color scheme (#1C313B, #FFBD00, #4DAD73, #58B6BF, #DF4C4C, #FFEAC3)
    - Set up fonts (Cubano Regular for titles, P22 Underground for UI)
    - _Requirements: 12.1, 12.2, 12.4_

  - [x] 1.2 Implement Screen Manager system
    - Create screen navigation controller with state management
    - Implement screen transition animations and state persistence
    - Add navigation stack for back button functionality
    - _Requirements: 7.4, 7.5_

  - [ ]* 1.3 Write property test for Screen Manager
    - **Property 1: Screen Navigation Consistency**
    - **Validates: Requirements 7.4, 7.5**

- [ ] 2. Implement Game State Management
  - [ ] 2.1 Create Game State Manager with local storage
    - Implement game state schema with player data, scores, and settings
    - Add local storage persistence with automatic save/restore
    - Create state validation and corruption recovery
    - _Requirements: 11.1, 11.2, 11.3, 11.5_

  - [ ] 2.2 Implement Player Manager system
    - Create player object management with role assignment
    - Implement deterministic role rotation for Base WOE game
    - Add player validation (name length, duplicates, count requirements)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 2.3 Write property test for Game State persistence
    - **Property 4: Configuration Persistence**
    - **Validates: Requirements 1.5, 11.1, 11.2, 11.3**

  - [ ]* 2.4 Write property test for Player role assignment
    - **Property 5: Role Assignment Fairness**
    - **Validates: Requirements 2.3, 2.4**

- [ ] 3. Create CMS integration and Concept Manager
  - [ ] 3.1 Set up Wix CMS collections for game concepts
    - Create CMS collections for each game mode (base-woe, skeleton-crew, close-encounters, space-race)
    - Define concept schema with NSFW flags, difficulty, and categories
    - Populate initial concept data for testing
    - _Requirements: 1.2, 3.1_

  - [ ] 3.2 Implement Concept Manager with caching
    - Create concept delivery system with CMS integration
    - Implement concept caching to prevent repetition within sessions
    - Add NSFW filtering based on toggle settings
    - Handle offline scenarios with cached concept fallbacks
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 11.4_

  - [ ]* 3.3 Write property test for NSFW filtering
    - **Property 2: NSFW Content Filtering**
    - **Validates: Requirements 1.3, 3.3**

  - [ ]* 3.4 Write property test for concept caching
    - **Property 6: Concept Caching and Uniqueness**
    - **Validates: Requirements 3.2**

- [ ] 4. Implement Timer System with audio cues
  - [ ] 4.1 Create Timer System with precise timing
    - Implement high-precision timer using performance.now()
    - Add visual countdown display with color changes
    - Create manual timer controls (pause, resume, reset, extend)
    - _Requirements: 4.1, 4.3, 4.4, 13.1_

  - [ ] 4.2 Add audio cue system
    - Implement HTML5 Audio API with preloaded sound files
    - Add audio cues at specified intervals (30s, 10s, 5s, 3-2-1)
    - Create audio enable/disable toggle
    - _Requirements: 4.2_

  - [ ]* 4.3 Write property test for timer behavior
    - **Property 7: Timer Behavior and Controls**
    - **Validates: Requirements 4.1, 4.3, 4.4, 13.1**

  - [ ]* 4.4 Write property test for audio cue delivery
    - **Property 8: Audio Cue Delivery**
    - **Validates: Requirements 4.2**

- [ ] 5. Checkpoint - Core systems integration test
  - Ensure all core systems work together, ask the user if questions arise.

- [ ] 6. Implement Scoring Engine for all game modes
  - [ ] 6.1 Create Base WOE Game scoring system
    - Implement Alien scoring (+1 per correct guess)
    - Implement Human milestone bonuses (3→1pt, 5→2pts, 6→3pts, 7→4pts, 8+→5pts)
    - Add real-time score display updates
    - _Requirements: 5.1, 5.2, 6.2, 6.5_

  - [ ] 6.2 Create Skeleton Crew scoring system
    - Implement team scoring (+1 per concept, +1 bonus at 4 concepts)
    - Add victory condition detection at 20 points
    - _Requirements: 5.3_

  - [ ] 6.3 Create team mode scoring (Close Encounters & Space Race)
    - Implement separate team score tracking
    - Add Close Encounters rules (first to 20 points or 3 concepts in 5 minutes)
    - Add Space Race milestone bonuses
    - _Requirements: 5.4_

  - [ ] 6.4 Add scoring management features
    - Implement tap-first scoring interface with immediate response
    - Add undo functionality for scoring actions
    - Create manual score adjustment with confirmation prompts
    - _Requirements: 5.5, 6.1, 6.3, 6.4, 13.2_

  - [ ]* 6.5 Write property test for Base WOE scoring
    - **Property 9: Base WOE Scoring Rules**
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 6.6 Write property test for Skeleton Crew scoring
    - **Property 10: Skeleton Crew Scoring Rules**
    - **Validates: Requirements 5.3**

  - [ ]* 6.7 Write property test for team mode scoring
    - **Property 11: Team Mode Scoring Rules**
    - **Validates: Requirements 5.4**

  - [ ]* 6.8 Write property test for score management
    - **Property 12: Score Management and Corrections**
    - **Validates: Requirements 5.5, 6.3, 6.4, 7.3, 13.2**

- [ ] 7. Create game mode selection and setup screens
  - [ ] 7.1 Implement Landing Page with game mode selection
    - Create game mode selection interface (Base WOE, Skeleton Crew, Close Encounters, Space Race)
    - Add game mode descriptions and player requirement displays
    - Implement NSFW toggle with clear labeling
    - _Requirements: 1.1, 1.3_

  - [ ] 7.2 Create Player Setup Page
    - Implement rapid player entry with validation
    - Add player reordering functionality
    - Create player count validation per game mode
    - Add setup completion validation and game start button
    - _Requirements: 2.1, 2.2, 2.5_

  - [ ]* 7.3 Write property test for game mode validation
    - **Property 3: Player Count Validation**
    - **Validates: Requirements 1.4, 2.2, 2.5**

- [ ] 8. Implement main Game Screen functionality
  - [ ] 8.1 Create Game Screen layout and concept display
    - Implement large, clear concept display with typography
    - Add current player/role indicators
    - Create skip/previous concept navigation
    - Add current score displays for all players/teams
    - _Requirements: 3.4, 6.2_

  - [ ] 8.2 Integrate timer and scoring systems
    - Connect timer system to game screen with prominent display
    - Integrate scoring engine with tap-first interface
    - Add manual override controls for timer and scoring
    - _Requirements: 4.1, 6.1, 13.1, 13.2_

  - [ ]* 8.3 Write property test for real-time updates
    - **Property 13: Real-time Score Display Updates**
    - **Validates: Requirements 6.2, 6.5**

- [ ] 9. Create Inter-Round and End Game screens
  - [ ] 9.1 Implement Inter-Round Screen
    - Create score review display with current standings
    - Add upcoming role assignment preview
    - Implement manual score adjustment interface
    - Add continue to next round controls
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 9.2 Create End Game Screen with winner detection
    - Implement automatic game end detection for all modes
    - Create final score display and winner announcement
    - Add new game and return to setup options
    - _Requirements: 8.1, 8.2, 8.4, 8.5_

  - [ ] 9.3 Implement Tiebreaker Flow
    - Create automatic tiebreaker initiation for tied scores
    - Implement simplified tiebreaker rounds with only tied players
    - Add tiebreaker round limits to prevent indefinite play
    - _Requirements: 8.3, 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 9.4 Write property test for inter-round state management
    - **Property 14: Inter-round State Management**
    - **Validates: Requirements 7.1, 7.2, 7.4, 7.5**

  - [ ]* 9.5 Write property test for game end detection
    - **Property 15: Game End Detection and Winner Announcement**
    - **Validates: Requirements 8.1, 8.2, 8.4, 8.5**

  - [ ]* 9.6 Write property test for tiebreaker flow
    - **Property 16: Tiebreaker Flow Management**
    - **Validates: Requirements 8.3, 9.1, 9.2, 9.3, 9.4, 9.5**

- [ ] 10. Implement Analytics Engine
  - [ ] 10.1 Create analytics data collection system
    - Implement event tracking for concept skips, manual overrides, game completions
    - Add timing data collection and metric calculations
    - Create local queuing with retry logic for network failures
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 10.2 Set up backend analytics storage
    - Create Wix backend functions for analytics data processing
    - Implement privacy-compliant data aggregation
    - Add analytics dashboard for system administrators
    - _Requirements: 10.4, 10.5_

  - [ ]* 10.3 Write property test for analytics collection
    - **Property 17: Analytics Data Collection**
    - **Validates: Requirements 10.1, 10.2, 10.3**

- [ ] 11. Add Tutorial and Help System
  - [ ] 11.1 Create Tutorial screens
    - Implement interactive tutorial for each game mode
    - Add contextual help during setup and gameplay
    - Create rule explanations with visual examples
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ] 11.2 Implement Hamburger Menu
    - Create navigation menu with tutorial, new game, and exit options
    - Add help system accessibility from any screen
    - Ensure help doesn't disrupt active gameplay
    - _Requirements: 14.4, 14.5_

  - [ ]* 11.3 Write property test for help system availability
    - **Property 21: Help System Availability**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5**

- [ ] 12. Implement responsive design and mobile optimization
  - [ ] 12.1 Optimize for mobile devices
    - Ensure proper display on 320px+ width screens
    - Implement touch-friendly controls with 44px+ touch targets
    - Add screen orientation handling
    - _Requirements: 12.1, 12.3, 12.5_

  - [ ] 12.2 Add accessibility features
    - Implement semantic HTML structure with ARIA labels
    - Add screen reader compatibility
    - Create high contrast mode support
    - _Requirements: 12.4_

  - [ ]* 12.3 Write property test for responsive design
    - **Property 19: Responsive Design Adaptation**
    - **Validates: Requirements 12.1, 12.2, 12.5**

- [ ] 13. Add manual override capabilities
  - [ ] 13.1 Implement comprehensive manual controls
    - Add manual role reassignment during setup and between rounds
    - Create manual concept skipping and replacement
    - Implement manual game state reset functionality
    - _Requirements: 13.3, 13.4, 13.5_

  - [ ]* 13.2 Write property test for manual overrides
    - **Property 20: Manual Override Capabilities**
    - **Validates: Requirements 13.3, 13.4, 13.5**

- [ ] 14. Implement offline functionality and error handling
  - [ ] 14.1 Add network error handling
    - Implement graceful degradation to cached concepts
    - Add user notification of offline mode
    - Create retry logic with exponential backoff
    - _Requirements: 11.4_

  - [ ] 14.2 Create comprehensive error handling
    - Add input validation and sanitization
    - Implement game state recovery from corruption
    - Create user-friendly error messages and recovery options
    - _Requirements: 11.1, 11.2_

  - [ ]* 14.3 Write property test for offline functionality
    - **Property 18: Offline Functionality and Synchronization**
    - **Validates: Requirements 11.4, 11.5**

- [ ] 15. Final integration and testing
  - [ ] 15.1 Complete system integration
    - Wire all components together with proper error handling
    - Implement final game flow testing across all modes
    - Add performance optimizations for mobile devices
    - _Requirements: All requirements integration_

  - [ ] 15.2 Create comprehensive test suite
    - Add integration tests for complete game flows
    - Test all game modes with various player configurations
    - Validate error handling and edge cases
    - _Requirements: All requirements validation_

- [ ] 16. Final checkpoint - Complete system validation
  - Ensure all tests pass and all game modes function correctly, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- The implementation uses JavaScript with Wix Velo for native platform integration
- Checkpoints ensure incremental validation and user feedback opportunities
- All game modes (Base WOE, Skeleton Crew, Close Encounters, Space Race) are fully implemented
- Mobile-first responsive design ensures optimal experience on all devices