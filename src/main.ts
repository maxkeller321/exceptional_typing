import App from './App.svelte';
import { mount } from 'svelte';
import { setDemoFlagFromEnv } from './lib/utils/demo';
import { initStorageService } from './lib/services';
import './app.css';

// If launched via `npm run demo`, convert the build-time env var into a
// self-cleaning localStorage flag before the app mounts.
setDemoFlagFromEnv();

// Initialize storage service (SQLite via Tauri, or localStorage fallback).
// This must complete before stores try to access storage.
initStorageService().then(async () => {
  // In Tauri mode, migrate localStorage data to SQLite on first launch
  if ('__TAURI__' in window) {
    const { migrateIfNeeded } = await import('./lib/services/migration');
    await migrateIfNeeded();
  }

  mount(App, {
    target: document.getElementById('app')!,
  });
});
