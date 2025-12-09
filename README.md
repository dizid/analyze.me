# Grok AI Self-Analysis App

A Vue 3 + Vite + Netlify application that integrates Google Docs with xAI's Grok AI for personal document analysis, featuring a stunning Cyberpunk Dashboard theme.

## Features

- **Google Docs Integration**: OAuth authentication, document picker, and content fetching
- **Grok AI Analysis**: Proxy via Netlify Functions with pre-configured and custom prompts
- **Cyberpunk UI**: Dark backgrounds, neon accents (cyan, pink, lime), glitch effects, futuristic fonts
- **Analysis Prompts**: 5 pre-configured options + custom textarea
- **Results Display**: Markdown rendering with DOMPurify, PDF export, copy to clipboard
- **History**: localStorage-based analysis history

## Tech Stack

- **Frontend**: Vue 3 (Composition API), Vite
- **Styling**: Tailwind CSS v4 (custom cyberpunk theme)
- **Backend**: Netlify Functions
- **APIs**: Google Drive API, Google Docs API, xAI Grok API

## Prerequisites

- Node.js 18+
- npm or yarn
- Google Cloud account (for OAuth credentials)
- xAI API key (for Grok analysis)
- Netlify account (for deployment)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/dizid/analyze.me.git
cd analyze.me
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Google OAuth Credentials

Follow the detailed step-by-step guide in **[GOOGLE_SETUP.md](./GOOGLE_SETUP.md)** to:
- Create a Google Cloud project
- Enable Drive and Docs APIs
- Configure OAuth consent screen
- Get your Client ID and API Key

### 4. Set Up xAI Grok API

- Sign up at [x.ai](https://x.ai/)
- Get your API key from the dashboard
- Save it for step 5

### 5. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
VITE_NETLIFY_FUNCTIONS_URL=http://localhost:9999/.netlify/functions
```

For Netlify Functions (set in Netlify dashboard later):
```env
XAI_API_KEY=your_xai_grok_api_key
```

### 6. Run Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

For Netlify Functions local development:

```bash
npm run netlify:dev
```

This starts both Vite dev server and Netlify Functions locally.

## Project Structure

```
analyze.me/
├── netlify/
│   └── functions/
│       └── analyze.js              # Grok API proxy (TO BE IMPLEMENTED)
├── public/
├── src/
│   ├── assets/
│   │   └── styles/
│   │       ├── main.css            # Tailwind v4 config + cyberpunk theme
│   │       └── animations.css      # Glitch effects, holographic overlays
│   ├── components/
│   │   ├── GoogleAuth.vue          # OAuth & document selection (TO BE IMPLEMENTED)
│   │   ├── GrokAnalysis.vue        # Prompt selection & analysis (TO BE IMPLEMENTED)
│   │   ├── ResultDisplay.vue       # Results with markdown rendering (TO BE IMPLEMENTED)
│   │   ├── ErrorDialog.vue         # Cyberpunk error modal (TO BE IMPLEMENTED)
│   │   ├── LoadingSpinner.vue      # Neon loading animation ✅
│   │   └── ui/
│   │       ├── CyberpunkButton.vue # Reusable neon button ✅
│   │       ├── CyberpunkPanel.vue  # Dashboard panel container ✅
│   │       └── GlitchText.vue      # Animated glitch text ✅
│   ├── composables/
│   │   ├── useGoogleAuth.js        # Google OAuth logic (TO BE IMPLEMENTED)
│   │   ├── useGrokAnalysis.js      # Grok API integration (TO BE IMPLEMENTED)
│   │   ├── useAnalysisHistory.js   # localStorage management ✅
│   │   ├── useMarkdownRenderer.js  # Safe markdown rendering ✅
│   │   └── usePdfExport.js         # PDF generation ✅
│   ├── config/
│   │   ├── prompts.js              # Pre-configured analysis prompts ✅
│   │   └── google.js               # Google API scopes & config ✅
│   ├── utils/
│   │   └── errorHandler.js         # Centralized error handling ✅
│   ├── views/
│   │   └── HomeView.vue            # Main dashboard layout (TO BE IMPLEMENTED)
│   ├── App.vue                     # Root component (TO BE IMPLEMENTED)
│   └── main.js                     # App entry point (TO BE IMPLEMENTED)
├── .env.example                    # Environment variables template ✅
├── .env.local                      # Local environment variables (create this) ✅
├── .gitignore                      # Git ignore file ✅
├── index.html                      # HTML entry point (TO BE IMPLEMENTED)
├── netlify.toml                    # Netlify configuration ✅
├── package.json                    # Dependencies ✅
├── vite.config.js                  # Vite configuration ✅
├── vitest.config.js                # Test configuration ✅
├── GOOGLE_SETUP.md                 # Detailed Google OAuth setup guide ✅
└── README.md                       # This file ✅
```

## Implementation Status

### ✅ Completed
- Project setup and configuration
- Tailwind CSS v4 with Cyberpunk theme
- All reusable UI components (CyberpunkButton, CyberpunkPanel, GlitchText, LoadingSpinner)
- Configuration files (Google, Analysis Prompts)
- Utility composables (Markdown renderer, PDF export, Analysis history, Error handler)
- Development environment setup
- Comprehensive Google OAuth setup guide

### 🚧 To Be Implemented
1. **Google OAuth Composable** (`src/composables/useGoogleAuth.js`)
   - Google Identity Services integration
   - OAuth token management
   - Document picker integration
   - Content fetching from Google Docs

2. **Netlify Function** (`netlify/functions/analyze.js`)
   - Grok AI API proxy
   - Rate limiting
   - Request validation
   - Error handling

3. **Grok Analysis Composable** (`src/composables/useGrokAnalysis.js`)
   - API call to Netlify Function
   - Loading states
   - Error handling

4. **Main Components**:
   - `GoogleAuth.vue` - OAuth UI and document selection
   - `GrokAnalysis.vue` - Prompt selection and analysis trigger
   - `ResultDisplay.vue` - Results with markdown and export
   - `ErrorDialog.vue` - Cyberpunk-themed error modal

5. **HomeView Dashboard** (`src/views/HomeView.vue`)
   - 3-column responsive grid layout
   - State management
   - Component orchestration

6. **App Entry Points**:
   - `src/main.js` - Vue app initialization
   - `src/App.vue` - Root component
   - `index.html` - HTML with Google API scripts

## Development Scripts

```bash
# Run development server (Vite only)
npm run dev

# Run with Netlify Functions
npm run netlify:dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Deploy to Netlify
npm run netlify:deploy
```

## Cyberpunk Theme

The app features a custom Tailwind CSS v4 theme with:

**Colors:**
- Background: Deep black (#0a0a0f)
- Panels: Translucent purple (rgba(45, 27, 61, 0.8))
- Accents: Neon cyan (#00ffee), hot pink (#ff00ff), lime green (#00ff41)

**Effects:**
- Glitch animations on text
- Neon glow shadows on buttons and panels
- Holographic overlays
- Scan line effects
- Pulse animations

**Fonts:**
- Primary: Orbitron (futuristic sans-serif)
- Code: Courier New (monospace)

## Security

- ✅ XAI_API_KEY never exposed to client (Netlify Function only)
- ✅ All markdown sanitized with DOMPurify
- ✅ Rate limiting in Netlify Function (10 req/min per IP)
- ✅ Input validation (max 50k chars for documents)
- ✅ Google OAuth with proper scopes
- ✅ CORS headers configured

## Deployment

### Netlify Deployment

1. **Connect GitHub Repository**:
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Connect to `dizid/analyze.me` repository

2. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

3. **Set Environment Variable**:
   - In Netlify: Site settings → Environment variables
   - Add: `XAI_API_KEY` = (your xAI API key)

4. **Update Google OAuth**:
   - Add your Netlify URL to authorized origins and redirect URIs
   - See [GOOGLE_SETUP.md](./GOOGLE_SETUP.md) Step 8 for details

5. **Deploy**:
   - Push to main branch or click "Deploy site"

## Testing

Unit tests for composables:

```bash
npm test
```

Manual testing checklist:
- [ ] Google OAuth flow
- [ ] Document selection and content fetch
- [ ] All 5 pre-configured prompts
- [ ] Custom prompt editing
- [ ] Analysis results display
- [ ] Markdown rendering
- [ ] PDF export
- [ ] History persistence
- [ ] Error handling

## Troubleshooting

See [GOOGLE_SETUP.md](./GOOGLE_SETUP.md) for common Google OAuth issues.

**Vite server not starting:**
- Check Node version (18+)
- Delete `node_modules` and `package-lock.json`, then `npm install`

**Tailwind styles not loading:**
- Check that `@import "tailwindcss"` is in `main.css`
- Verify `@tailwindcss/vite` plugin in `vite.config.js`

**Netlify Functions not working locally:**
- Use `npm run netlify:dev` instead of `npm run dev`
- Check `.env.local` has correct Netlify Functions URL

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See LICENSE file for details

## Acknowledgments

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [xAI Grok](https://x.ai/)
- [Google Cloud Platform](https://cloud.google.com/)
- [Netlify](https://www.netlify.com/)

---

**Built with** 🤖 **Claude Code** and ⚡ **xAI Grok**
