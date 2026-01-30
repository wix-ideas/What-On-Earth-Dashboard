# What On Earth Game Dashboard

A mobile-first party game dashboard for "What On Earth Are You Talking About?" - a fun guessing game where aliens try to understand human concepts.

## Features

- **Mobile-First Design**: Optimized for phones and tablets
- **Fullscreen Game Mode**: Automatic fullscreen during gameplay
- **Multiple Game Modes**: Base WOE, Skeleton Crew, Close Encounters, Space Race
- **Player Management**: Easy player setup and role assignment
- **Responsive Layout**: Works on all screen sizes
- **Wix Integration**: Communicates with Wix parent page for data

## Quick Start

1. Clone the repository
2. Open `index.html` in a web browser
3. Or serve locally: `npx serve .`

## Game Modes

- **What On Earth**: 4+ players, aliens guess human concepts
- **Skeleton Crew**: 2-3 players, cooperative mode
- **Close Encounters**: 4+ players, team vs team
- **Space Race**: 4+ players, team competition with milestones

## Technology

- Pure HTML5, CSS3, JavaScript (ES6 modules)
- No external dependencies
- PostMessage API for Wix communication
- Local storage for game state persistence

## Deployment

This app is designed to be hosted on Vercel and embedded in a Wix page via iframe.

## Development

The app uses a modular architecture:
- `js/ScreenManager.js` - Screen navigation and transitions
- `js/GameStateManager.js` - Game state and persistence
- `js/WixCommunication.js` - Parent page communication
- `css/styles.css` - Responsive styling