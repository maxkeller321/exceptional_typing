<script lang="ts">
  import { typingMode, settingsStore } from '../stores/settings';
  import type { TypingMode } from '../types';
  import { onMount } from 'svelte';

  let currentMode = $state<TypingMode>('normal');

  onMount(() => {
    const unsub = typingMode.subscribe((mode) => {
      currentMode = mode;
    });
    return unsub;
  });

  function setMode(mode: TypingMode) {
    settingsStore.setTypingMode(mode);
  }
</script>

<div class="mode-toggle">
  <button
    class="mode-btn"
    class:active={currentMode === 'normal'}
    onclick={() => setMode('normal')}
    aria-pressed={currentMode === 'normal'}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 7V4h16v3" />
      <path d="M9 20h6" />
      <path d="M12 4v16" />
    </svg>
    <span>Writer</span>
  </button>

  <button
    class="mode-btn"
    class:active={currentMode === 'coder'}
    onclick={() => setMode('coder')}
    aria-pressed={currentMode === 'coder'}
  >
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="16,18 22,12 16,6" />
      <polyline points="8,6 2,12 8,18" />
    </svg>
    <span>Coder</span>
  </button>
</div>

<style>
  .mode-toggle {
    @apply flex gap-0.5 p-0.5 rounded;
    background-color: var(--bg-tertiary);
  }

  .mode-btn {
    @apply flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm;
    @apply text-xs font-normal;
    @apply transition-all duration-150;
    @apply flex-1;
    color: var(--text-secondary);
  }

  .mode-btn svg {
    @apply w-3.5 h-3.5;
  }

  .mode-btn.active {
    background-color: var(--bg-secondary);
    color: var(--accent);
  }

  .mode-btn:not(.active):hover {
    color: var(--text-primary);
  }
</style>
