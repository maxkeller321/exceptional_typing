# Exceptional Typing

A modern, cross-platform typing tutor application built with Tauri 2.0 and Svelte 5.

## Features

- **Structured Lessons**: Progressive lessons from home row basics to advanced code typing
- **Real-time Feedback**: Live WPM, accuracy, and error tracking
- **Multiple Categories**: Home row, top row, bottom row, numbers, symbols, words, sentences, and code
- **Code Typing Practice**: JavaScript and Rust code patterns
- **Statistics Tracking**: Track your progress with detailed metrics
- **Problem Key Analysis**: Identify and improve on your weakest keys
- **Cross-Platform**: macOS, Windows, and Linux support
- **Mac App Store Ready**: Configured for App Store distribution

## Tech Stack

- **Frontend**: Svelte 5 + TypeScript + Tailwind CSS
- **Backend**: Rust + Tauri 2.0
- **Database**: SQLite (via rusqlite)
- **Build**: Vite

## Quick Start

### Prerequisites

- Node.js 18+
- Rust (will be installed by setup script if missing)

### Setup

```bash
# Run the setup script
chmod +x setup.sh
./setup.sh
```

Or manually:

```bash
# Install Rust (if not installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install dependencies
npm install

# Install Tauri CLI
cargo install tauri-cli
```

### Development

```bash
# Start development server with hot reload
npm run tauri:dev
```

### Building

```bash
# Build for production
npm run tauri:build
```

Build outputs will be in `src-tauri/target/release/bundle/`:
- **macOS**: `.app` and `.dmg`
- **Windows**: `.msi` and `.exe`
- **Linux**: `.deb`, `.rpm`, and `.AppImage`

## Project Structure

```
exceptional_typing/
├── src/                      # Svelte frontend
│   ├── lib/
│   │   ├── components/       # UI components
│   │   ├── stores/           # Svelte stores
│   │   ├── types/            # TypeScript types
│   │   └── data/             # Lesson data
│   └── App.svelte            # Main app component
├── src-tauri/                # Rust backend
│   ├── src/
│   │   ├── main.rs           # Tauri entry point
│   │   ├── lessons.rs        # Lesson definitions
│   │   ├── metrics.rs        # WPM/accuracy calculations
│   │   └── storage.rs        # SQLite persistence
│   ├── Cargo.toml            # Rust dependencies
│   └── tauri.conf.json       # Tauri configuration
└── package.json              # Node dependencies
```

## Mac App Store Distribution

1. Generate icons using the provided placeholder or your own:
   ```bash
   # Generate all icon sizes (requires ImageMagick)
   cd src-tauri/icons
   # Add your icon.png (1024x1024) then run:
   # sips -z 32 32 icon.png --out 32x32.png
   # etc.
   ```

2. Configure signing in `src-tauri/tauri.conf.json`:
   ```json
   "macOS": {
     "signingIdentity": "Your Developer ID",
     "providerShortName": "YOUR_TEAM_ID"
   }
   ```

3. Build with App Store profile:
   ```bash
   npm run tauri:build -- --target universal-apple-darwin
   ```

## License

MIT
