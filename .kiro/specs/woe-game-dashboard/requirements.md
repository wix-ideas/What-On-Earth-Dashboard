# Requirements Document

## Introduction

This document specifies the requirements for a mobile Wix web app dashboard that serves as the host console for the party game "What On Earth Are You Talking About?" The system supports multiple game modes with different player configurations, scoring systems, and gameplay mechanics. The dashboard manages player setup, concept delivery, timing, scoring, and analytics tracking.

## Glossary

- **WOE_System**: The complete web application dashboard for managing party games
- **Game_Mode**: A specific variant of the party game with unique rules and scoring
- **Concept**: A word or phrase that players must guess or explain during gameplay
- **Alien**: A player role that guesses concepts in the Base WOE Game
- **Human**: A player role that explains concepts in the Base WOE Game
- **Round**: A complete cycle of gameplay where all players participate once
- **CMS**: Content Management System storing concept lists for different game modes
- **Analytics_Engine**: Backend system tracking game statistics and player behavior
- **Game_State**: Current status of an active game including scores, players, and progress

## Requirements

### Requirement 1: Game Mode Selection and Configuration

**User Story:** As a game host, I want to select from multiple game modes and configure game settings, so that I can customize the experience for my group.

#### Acceptance Criteria

1. WHEN the host accesses the landing page, THE WOE_System SHALL display all available game modes (Base WOE Game, Skeleton Crew, Close Encounters, Space Race)
2. WHEN a game mode is selected, THE WOE_System SHALL load the appropriate CMS concept source for that mode
3. WHERE NSFW content is available, THE WOE_System SHALL provide a toggle to include or exclude adult concepts
4. WHEN game settings are configured, THE WOE_System SHALL validate minimum player requirements for the selected mode
5. THE WOE_System SHALL persist game configuration choices throughout the session

### Requirement 2: Player Management and Setup

**User Story:** As a game host, I want to quickly add players and assign roles, so that we can start playing without delays.

#### Acceptance Criteria

1. WHEN adding players, THE WOE_System SHALL allow rapid entry of player names in seconds
2. WHEN player count meets minimum requirements, THE WOE_System SHALL enable game start functionality
3. FOR Base WOE Game mode, THE WOE_System SHALL automatically assign half the players as Aliens and half as Humans
4. WHEN roles are assigned, THE WOE_System SHALL implement deterministic rotation ensuring fair role distribution across rounds
5. THE WOE_System SHALL validate that player counts meet the minimum requirements for each game mode (4+ for Base WOE, 2+ for Skeleton Crew, 4+ for team modes)

### Requirement 3: Concept Delivery and Management

**User Story:** As a game host, I want the system to deliver concepts from the appropriate source without repetition, so that gameplay remains fresh and engaging.

#### Acceptance Criteria

1. WHEN a round begins, THE WOE_System SHALL retrieve concepts from the CMS source matching the selected game mode
2. THE WOE_System SHALL cache delivered concepts to prevent repetition within the same game session
3. WHEN NSFW toggle is disabled, THE WOE_System SHALL filter out adult content from concept delivery
4. THE WOE_System SHALL display concepts with large, clear typography for easy reading during gameplay
5. IF the concept pool is exhausted, THEN THE WOE_System SHALL notify the host and provide options to continue

### Requirement 4: Timer Management and Audio Cues

**User Story:** As a game host, I want precise timing control with clear audio feedback, so that rounds progress smoothly and players know when time is running out.

#### Acceptance Criteria

1. WHEN a round starts, THE WOE_System SHALL display a prominent countdown timer
2. THE WOE_System SHALL provide audio cues at appropriate intervals during countdown
3. WHEN the timer expires, THE WOE_System SHALL automatically end the current round
4. THE WOE_System SHALL allow manual timer control including pause, resume, and reset functionality
5. FOR different game modes, THE WOE_System SHALL apply the correct timing rules (5-minute rounds for Close Encounters, overall timer for Skeleton Crew)

### Requirement 5: Scoring System Implementation

**User Story:** As a game host, I want accurate scoring that follows each game mode's rules, so that winners are determined correctly.

#### Acceptance Criteria

1. FOR Base WOE Game, WHEN Aliens guess correctly, THE WOE_System SHALL award 1 point per correct guess
2. FOR Base WOE Game, WHEN Humans reach concept milestones, THE WOE_System SHALL award bonus points (3, 5, 6, 7, 8+ concepts)
3. FOR Skeleton Crew mode, THE WOE_System SHALL award 1 point per concept plus 1 bonus point at 4 concepts, with victory at 20 points
4. FOR Close Encounters and Space Race, THE WOE_System SHALL track team scores separately and apply mode-specific bonuses
5. THE WOE_System SHALL provide manual score correction and undo functionality for all scoring actions

### Requirement 6: Fast Scoring Interface

**User Story:** As a game host, I want to quickly record scores during fast-paced gameplay, so that I don't interrupt the game flow.

#### Acceptance Criteria

1. WHEN concepts are guessed correctly, THE WOE_System SHALL provide tap-first scoring with immediate response
2. THE WOE_System SHALL display current scores prominently during gameplay
3. WHEN scoring errors occur, THE WOE_System SHALL provide immediate undo functionality
4. THE WOE_System SHALL allow manual score adjustments with clear confirmation prompts
5. THE WOE_System SHALL update all score displays in real-time as points are awarded

### Requirement 7: Inter-Round Management

**User Story:** As a game host, I want clear transitions between rounds with score review and role preview, so that players understand the current game state.

#### Acceptance Criteria

1. WHEN a round ends, THE WOE_System SHALL display an inter-round screen with current scores
2. THE WOE_System SHALL show role assignments for the upcoming round
3. THE WOE_System SHALL allow score adjustments during inter-round periods
4. WHEN ready to continue, THE WOE_System SHALL provide clear controls to start the next round
5. THE WOE_System SHALL maintain game state consistency across round transitions

### Requirement 8: End Game and Winner Determination

**User Story:** As a game host, I want clear end game detection and winner announcement, so that games conclude satisfyingly.

#### Acceptance Criteria

1. WHEN victory conditions are met, THE WOE_System SHALL automatically detect game end
2. THE WOE_System SHALL display final scores and announce the winner clearly
3. WHEN scores are tied, THE WOE_System SHALL initiate tiebreaker procedures
4. THE WOE_System SHALL provide options to start a new game or return to setup
5. THE WOE_System SHALL preserve final game results for potential review

### Requirement 9: Tiebreaker Flow Management

**User Story:** As a game host, I want automated tiebreaker rounds when games end in ties, so that we always have a clear winner.

#### Acceptance Criteria

1. WHEN final scores are tied, THE WOE_System SHALL automatically initiate tiebreaker mode
2. THE WOE_System SHALL include only tied players in tiebreaker rounds
3. THE WOE_System SHALL apply simplified scoring rules during tiebreaker play
4. WHEN tiebreaker rounds conclude, THE WOE_System SHALL determine and announce the final winner
5. THE WOE_System SHALL limit tiebreaker rounds to prevent indefinite play

### Requirement 10: Analytics and Performance Tracking

**User Story:** As a system administrator, I want to collect gameplay analytics, so that I can understand user behavior and improve the game experience.

#### Acceptance Criteria

1. WHEN concepts are skipped, THE Analytics_Engine SHALL record skip counts and timing data
2. THE Analytics_Engine SHALL calculate average time-to-skip metrics for different concepts
3. THE Analytics_Engine SHALL track game completion rates and session durations
4. THE Analytics_Engine SHALL store analytics data securely in the backend system
5. THE WOE_System SHALL transmit analytics data without impacting game performance

### Requirement 11: Local Game State Management

**User Story:** As a game host, I want the system to maintain game state reliably, so that temporary interruptions don't lose our progress.

#### Acceptance Criteria

1. THE WOE_System SHALL store current game state locally throughout gameplay
2. WHEN the browser is refreshed, THE WOE_System SHALL restore the active game state
3. THE WOE_System SHALL persist player names, scores, and round progress
4. WHEN network connectivity is lost, THE WOE_System SHALL continue functioning with cached data
5. THE WOE_System SHALL synchronize state with backend systems when connectivity is restored

### Requirement 12: Responsive Mobile Interface

**User Story:** As a game host using mobile devices, I want the interface to work perfectly on phones and tablets, so that I can host games anywhere.

#### Acceptance Criteria

1. THE WOE_System SHALL display correctly on mobile phone screens (320px+ width)
2. THE WOE_System SHALL adapt layout appropriately for tablet screens
3. THE WOE_System SHALL use touch-friendly controls with appropriate sizing
4. THE WOE_System SHALL maintain readability with large fonts (Cubano Regular, P22 Underground)
5. THE WOE_System SHALL provide consistent user experience across different screen orientations

### Requirement 13: Manual Override Capabilities

**User Story:** As a game host, I want to manually override any automated function, so that I can handle unexpected situations during gameplay.

#### Acceptance Criteria

1. THE WOE_System SHALL provide manual timer controls (pause, resume, reset, extend)
2. THE WOE_System SHALL allow manual score adjustments for any player at any time
3. THE WOE_System SHALL permit manual role reassignment during setup or between rounds
4. THE WOE_System SHALL enable manual concept skipping and replacement
5. THE WOE_System SHALL provide manual game state reset functionality

### Requirement 14: Tutorial and Help System

**User Story:** As a new user, I want access to tutorials and help information, so that I can learn how to use the system effectively.

#### Acceptance Criteria

1. THE WOE_System SHALL provide tutorial screens explaining each game mode
2. THE WOE_System SHALL offer contextual help during setup and gameplay
3. THE WOE_System SHALL include rule explanations for each game mode
4. THE WOE_System SHALL provide navigation back to help from any screen
5. THE WOE_System SHALL display help information without disrupting active games