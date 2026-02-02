# What On Earth Are You Talking About? - Bootstrap Dashboard

A clean, responsive Bootstrap implementation of the WOE game dashboard.

## Features

✅ **Bootstrap 5** - Modern, responsive framework  
✅ **Clean HTML Structure** - Semantic, accessible markup  
✅ **NSFW Toggle** - Exact design match to reference images  
✅ **Player Management** - Add, delete, and manage players  
✅ **Game Modes** - WOE, Skeleton Crew, Close Encounters, Space Race  
✅ **Responsive Design** - Works on mobile, tablet, and desktop  
✅ **Custom Fonts** - Cubano and P22Underground integration  

## Quick Start

1. **Clone the repository**
2. **Open `index.html`** in your browser
3. **Or serve locally**:
   ```bash
   npm start
   # Opens on http://localhost:3000
   ```

## File Structure

```
├── index.html          # Main HTML file with Bootstrap
├── css/
│   └── styles.css      # Custom styles and design system
├── js/
│   └── app.js          # Game logic and interactions
├── package.json        # Project configuration
└── README.md          # This file
```

## Design System

### Colors (Exact from design brief)
- **Dark**: `#1C313B`
- **Yellow**: `#FFBD00` 
- **Green**: `#4DAD73`
- **Blue**: `#58B6BF`
- **Red**: `#DF4C4C`
- **Cream**: `#FFEAC3`

### Fonts
- **Cubano**: Titles, buttons, player names
- **P22Underground**: UI text, dropdowns

## NSFW Toggle Implementation

The toggle matches your reference images exactly:

- **OFF State**: Dark navy label + dark navy square with cream rectangle
- **ON State**: Red label + red square with cream rectangle
- **Text Color**: Always cream (never changes)

```css
.nsfw-label.active {
    background: var(--red);
    border-color: var(--red);
    color: var(--cream); /* Always cream */
}
```

## Bootstrap Integration

Uses Bootstrap 5 for:
- **Grid System**: Responsive layout
- **Components**: Modals, buttons, forms
- **Utilities**: Spacing, display, flexbox
- **Custom Overrides**: Design system colors and fonts

## Deployment

### Vercel
```bash
# Deploy to Vercel
npx vercel --prod
```

### Netlify
```bash
# Deploy to Netlify
npx netlify deploy --prod --dir .
```

### GitHub Pages
1. Push to GitHub
2. Enable GitHub Pages in repository settings
3. Select source: main branch

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest) 
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Local Development
```bash
npm run dev
# Opens on http://localhost:3000
```

### File Watching
Use any live server extension in your editor, or:
```bash
npx live-server
```

## Key Improvements

1. **Bootstrap Framework** - Reliable, tested components
2. **Semantic HTML** - Better accessibility and SEO
3. **Clean CSS** - Organized, maintainable styles
4. **Simple JavaScript** - No complex module loading
5. **Responsive Design** - Works on all screen sizes

## Game Modes

- **What On Earth** (4+ players)
- **Skeleton Crew** (2-3 players) 
- **Close Encounters** (4+ players, team-based)
- **Space Race** (4+ players, team-based)

## Next Steps

- [ ] Game screen implementation
- [ ] Timer functionality
- [ ] Scoring system
- [ ] Sound effects
- [ ] Animations
- [ ] Local storage for game state

This Bootstrap implementation provides a solid, maintainable foundation for the WOE dashboard!