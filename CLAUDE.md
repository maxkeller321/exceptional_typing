# Claude Code Guide for Exceptional Typing

## Project Overview

This is a Tauri-based typing tutor application built with Svelte 5, TypeScript, and Rust. It helps users learn touch typing through structured lessons and custom practice.

## Tech Stack

- **Frontend**: Svelte 5 (with runes: `$state`, `$derived`, `$props`, `$effect`), TypeScript
- **Backend**: Tauri (Rust) with SQLite for persistence
- **Styling**: Tailwind CSS + CSS custom properties for theming
- **Testing**: Vitest
- **Build**: Vite

## Commands

### Development
```bash
npm run dev          # Start Vite dev server (frontend only)
npm run tauri dev    # Start full Tauri app with Rust backend
```

### Testing
```bash
npm test             # Run all tests once
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI
```

### Building
```bash
npm run build        # Build frontend
npm run tauri build  # Build full Tauri application
```

### Linting & Formatting
```bash
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run check        # Run Svelte check
```

## Project Structure

```
src/
├── lib/
│   ├── components/     # Svelte components
│   │   ├── analytics/  # Stats & heatmap components
│   │   ├── practice/   # Custom practice components
│   │   ├── ui/         # Reusable UI components (Toggle, Slider, etc.)
│   │   └── user/       # User profile components
│   ├── stores/         # Svelte stores (app state, settings, user, practice)
│   ├── types/          # TypeScript type definitions
│   ├── data/           # Static data (lessons, layouts, i18n)
│   └── utils/          # Utility functions
├── App.svelte          # Main app component
├── app.css             # Global styles & theme CSS variables
└── main.ts             # App entry point

src-tauri/
├── src/
│   ├── main.rs         # Tauri main entry
│   └── storage.rs      # SQLite database operations
└── tauri.conf.json     # Tauri configuration
```

## Key Files

- **Types**: [src/lib/types/index.ts](src/lib/types/index.ts) - All TypeScript interfaces
- **App Store**: [src/lib/stores/app.ts](src/lib/stores/app.ts) - Navigation, lessons, stats
- **Settings Store**: [src/lib/stores/settings.ts](src/lib/stores/settings.ts) - User preferences
- **Typing Store**: [src/lib/stores/typing.ts](src/lib/stores/typing.ts) - Typing session state
- **Theme Definitions**: [src/app.css](src/app.css) - CSS custom properties for themes

## Theming

The app uses CSS custom properties with `data-theme` attribute on `<html>`:
- `dark-gold` (default) - Monkeytype-inspired gold accent
- `dark-blue` - Blue accent on dark background
- `light` - Light theme with blue accent
- `midnight` - Pure black with cyan accent

## Testing Guidelines

1. All stores have corresponding `.test.ts` files
2. Tests use Vitest with `@testing-library/svelte` where needed
3. Run `npm test` before committing changes
4. Current test count: ~220 tests

## Svelte 5 Patterns

```typescript
// State
let count = $state(0);

// Derived
let doubled = $derived(count * 2);

// Props
let { value, onChange }: Props = $props();

// Effects
$effect(() => {
  console.log('count changed:', count);
});
```

## Common Tasks

### Adding a new setting
1. Add type to `UserSettings` in [src/lib/types/index.ts](src/lib/types/index.ts)
2. Add default value in `DEFAULT_SETTINGS` in [src/lib/stores/settings.ts](src/lib/stores/settings.ts)
3. Add setter method in `createSettingsStore()`
4. Add derived store export if needed
5. Add tests in [src/lib/stores/settings.test.ts](src/lib/stores/settings.test.ts)

### Adding a new theme
1. Add theme name to `AppTheme` type in [src/lib/types/index.ts](src/lib/types/index.ts)
2. Add CSS variables in [src/app.css](src/app.css) with `[data-theme="name"]` selector
3. Add option to theme dropdown in [src/App.svelte](src/App.svelte)

### Adding a new lesson
1. Create lesson data in [src/lib/data/lessons/](src/lib/data/lessons/)
2. Export from [src/lib/data/lessons/index.ts](src/lib/data/lessons/index.ts)

## Data Persistence

The app persists all user data to localStorage, keyed by user ID:

- **Settings**: `exceptional-typing-settings-{userId}` - User preferences (theme, keyboard layout, etc.)
- **User Stats**: `exceptional-typing-stats-{userId}` - WPM, accuracy, keystrokes, etc.
- **Lesson Progress**: `exceptional-typing-progress-{userId}` - Completed lessons, task results
- **Course Progress**: `exceptional-typing-all-courses-{userId}` - Course enrollment and stage completion
- **Snippets**: `exceptional-typing-snippets-{userId}` - Custom practice snippets
- **Daily Results**: `exceptional-typing-daily-results` - Daily test results (global, filtered by userId)

## Available Courses

1. **10 Fingers (Touch Typing)** - `tenFingerCourse` - 14 stages from home row to expert
2. **Command Line Mastery** - `cliCourse` - 15 stages from basic commands to Docker + final test

Courses are defined in [src/lib/data/courses.ts](src/lib/data/courses.ts).

## Release Automation (Fastlane)

The project uses Fastlane for automated releases. **Full documentation: [fastlane/RELEASE.md](fastlane/RELEASE.md)**

### Quick Deploy to TestFlight

```bash
cd fastlane
eval "$(rbenv init -)"
rbenv local 2.7.6
bundle exec fastlane mac beta skip_certificates:true skip_tests:true
```

### Common Commands

```bash
cd fastlane

# Build & Deploy
bundle exec fastlane mac beta           # Upload to TestFlight
bundle exec fastlane mac release        # Upload to App Store
bundle exec fastlane mac build_release  # Build only (no upload)

# Version Management
bundle exec fastlane mac bump_version type:patch  # 0.1.1 → 0.1.2
bundle exec fastlane mac bump_version type:minor  # 0.1.1 → 0.2.0

# Testing
bundle exec fastlane mac test           # Run all tests
bundle exec fastlane mac lint           # Run linting
bundle exec fastlane mac clean          # Clean build artifacts
```

### App Store Information

| Field | Value |
|-------|-------|
| Bundle ID | `com.exceptionaltyping.app` |
| Apple ID | 6758142774 |
| SKU | exceptional-typing |

### Key Files

- [fastlane/RELEASE.md](fastlane/RELEASE.md) - Full deployment guide with troubleshooting
- [fastlane/Fastfile](fastlane/Fastfile) - Lane definitions
- [fastlane/.env](fastlane/.env) - Environment configuration (not in git)
- [fastlane/.env.example](fastlane/.env.example) - Environment template

## Notes

- User data persists to localStorage (per-user keyed by user ID)
- Snippet names must be unique (case-insensitive)
- Settings auto-save with 300ms debounce
- Stats and progress auto-save after each task completion
- All views are components in `src/lib/components/`
