<script lang="ts">
  import type { CharacterAnalysis } from '../../types';

  interface Props {
    characters: CharacterAnalysis[];
  }

  let { characters }: Props = $props();

  let sortBy = $state<'speed' | 'accuracy'>('speed');
  let showCount = $state(10);

  let sortedCharacters = $derived.by(() => {
    const chars = [...characters];
    if (sortBy === 'speed') {
      return chars.sort((a, b) => b.avgDelay - a.avgDelay); // Slowest first
    }
    // Sort by most errors first
    return chars.sort((a, b) => b.errors - a.errors);
  });

  function formatChar(char: string): string {
    if (char === ' ') return 'Space';
    if (char === '\t') return 'Tab';
    if (char === '\n') return 'Enter';
    return char;
  }

  function formatMistypes(mistypes: string[]): string {
    if (mistypes.length === 0) return '-';
    return mistypes.map(m => m === ' ' ? '␣' : m).join(', ');
  }
</script>

<div class="characters-panel">
  <div class="panel-header">
    <h3 class="panel-title">Characters</h3>
    <div class="toggle-group">
      <button
        class="toggle-btn"
        class:active={sortBy === 'speed'}
        onclick={() => sortBy = 'speed'}
      >
        Speed
      </button>
      <button
        class="toggle-btn"
        class:active={sortBy === 'accuracy'}
        onclick={() => sortBy = 'accuracy'}
      >
        Accuracy
      </button>
    </div>
  </div>

  <div class="panel-info">
    Showing {Math.min(showCount, sortedCharacters.length)} of {sortedCharacters.length} items
    {#if sortedCharacters.length > showCount}
      <button class="show-more" onclick={() => showCount += 10}>
        Show More ({sortedCharacters.length - showCount} more)
      </button>
    {/if}
  </div>

  <div class="char-table">
    <div class="table-header">
      <span class="col-char">Char</span>
      <span class="col-count">#</span>
      <span class="col-delay">Avg. Delay</span>
      <span class="col-mistypes">Mistypes</span>
    </div>

    {#each sortedCharacters.slice(0, showCount) as char}
      <div class="table-row" class:has-error={char.errors > 0}>
        <span class="col-char">
          <span class="char-box">{formatChar(char.char)}</span>
        </span>
        <span class="col-count">{char.count}</span>
        <span class="col-delay">{char.avgDelay}ms</span>
        <span class="col-mistypes">
          {#if char.mistypes.length > 0}
            {#each char.mistypes.slice(0, 3) as mistype}
              <span class="mistype-box">{mistype === ' ' ? '␣' : mistype}</span>
            {/each}
            {#if char.mistypes.length > 3}
              <span class="more-mistypes">+{char.mistypes.length - 3}</span>
            {/if}
          {:else}
            <span class="no-errors">-</span>
          {/if}
        </span>
      </div>
    {/each}
  </div>
</div>

<style>
  .characters-panel {
    @apply bg-slate-900/50 rounded-xl p-6 border border-slate-700/50;
  }

  .panel-header {
    @apply flex items-center justify-between mb-4;
  }

  .panel-title {
    @apply text-lg font-semibold text-white;
  }

  .toggle-group {
    @apply flex bg-slate-700/50 rounded-lg p-1;
  }

  .toggle-btn {
    @apply px-4 py-1.5 text-xs font-medium rounded-md transition-colors;
    @apply text-slate-400 hover:text-white;
  }

  .toggle-btn.active {
    @apply bg-blue-600 text-white;
  }

  .panel-info {
    @apply text-xs text-slate-500 mb-3 flex items-center justify-between;
  }

  .show-more {
    @apply text-blue-400 hover:text-blue-300 transition-colors;
  }

  .char-table {
    @apply flex flex-col;
  }

  .table-header {
    @apply flex items-center py-2 text-xs font-medium text-slate-500;
    @apply border-b border-slate-700/50 mb-1;
  }

  .table-row {
    @apply flex items-center py-2.5;
    @apply border-b border-slate-800/30;
    @apply hover:bg-slate-800/20 transition-colors rounded;
  }

  .table-row.has-error {
    @apply bg-red-900/10;
  }

  .col-char {
    @apply w-20 flex items-center;
  }

  .char-box {
    @apply inline-flex items-center justify-center min-w-[28px] h-7 px-2;
    @apply bg-slate-700/50 rounded border border-slate-600/50;
    @apply text-sm font-mono text-slate-200;
  }

  .col-count {
    @apply w-12 text-center text-slate-400 text-sm;
  }

  .col-delay {
    @apply w-20 text-slate-300 font-mono text-sm;
  }

  .col-mistypes {
    @apply flex-1 flex items-center gap-1;
  }

  .mistype-box {
    @apply inline-flex items-center justify-center w-6 h-6;
    @apply bg-red-900/30 rounded border border-red-700/50;
    @apply text-xs font-mono text-red-400;
  }

  .more-mistypes {
    @apply text-xs text-slate-500 ml-1;
  }

  .no-errors {
    @apply text-slate-600;
  }
</style>
