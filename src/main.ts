import App from './App.svelte';
import { mount } from 'svelte';
import { setDemoFlagFromEnv } from './lib/utils/demo';
import './app.css';

// If launched via `npm run demo`, convert the build-time env var into a
// self-cleaning localStorage flag before the app mounts.
setDemoFlagFromEnv();

const app = mount(App, {
  target: document.getElementById('app')!,
});

export default app;
