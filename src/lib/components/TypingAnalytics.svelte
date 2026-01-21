<script lang="ts">
  import type { KeystrokeEvent, WordAnalysis, BigramAnalysis, TrigramAnalysis } from '../types';
  import { calculateAnalytics } from '../utils/analytics';
  import HandsAndFingers from './analytics/HandsAndFingers.svelte';
  import CharactersPanel from './analytics/CharactersPanel.svelte';
  import CharacterDistribution from './analytics/CharacterDistribution.svelte';
  import WpmOverTime from './analytics/WpmOverTime.svelte';

  interface Props {
    keystrokes: KeystrokeEvent[];
    targetText: string;
  }

  let { keystrokes, targetText }: Props = $props();

  // Calculate analytics
  let analytics = $derived(calculateAnalytics(keystrokes, targetText));

  // State for each panel
  let wordsSortBy = $state<'speed' | 'accuracy'>('speed');
  let wordsShowCount = $state(8);

  let bigramsSortBy = $state<'count' | 'time'>('time');
  let bigramsShowCount = $state(6);

  let trigramsSortBy = $state<'count' | 'time'>('time');
  let trigramsShowCount = $state(6);

  // Sorted data
  let sortedWords = $derived.by(() => {
    const words = [...analytics.words];
    if (wordsSortBy === 'speed') {
      return words.sort((a, b) => a.avgTime - b.avgTime);
    } else {
      return words.sort((a, b) => a.accuracy - b.accuracy);
    }
  });

  let sortedBigrams = $derived.by(() => {
    const bigrams = [...analytics.bigrams];
    if (bigramsSortBy === 'count') {
      return bigrams.sort((a, b) => b.count - a.count);
    } else {
      return bigrams.sort((a, b) => b.avgTime - a.avgTime);
    }
  });

  let sortedTrigrams = $derived.by(() => {
    const trigrams = [...analytics.trigrams];
    if (trigramsSortBy === 'count') {
      return trigrams.sort((a, b) => b.count - a.count);
    } else {
      return trigrams.sort((a, b) => b.avgTime - a.avgTime);
    }
  });

  // Get max time for bar scaling
  function getMaxBigramTime(): number {
    return Math.max(...analytics.bigrams.map(b => b.avgTime), 1);
  }

  function getMaxTrigramTime(): number {
    return Math.max(...analytics.trigrams.map(t => t.avgTime), 1);
  }

  function formatChar(char: string): string {
    if (char === ' ') return '␣';
    return char;
  }
</script>

<div class="analytics-container">
  <h2 class="analytics-title">Performance Analysis</h2>

  <div class="analytics-grid">
    <!-- Words Panel -->
    <div class="panel">
      <div class="panel-header">
        <h3 class="panel-title">Words</h3>
        <div class="toggle-group">
          <button
            class="toggle-btn"
            class:active={wordsSortBy === 'speed'}
            onclick={() => wordsSortBy = 'speed'}
          >
            Speed
          </button>
          <button
            class="toggle-btn"
            class:active={wordsSortBy === 'accuracy'}
            onclick={() => wordsSortBy = 'accuracy'}
          >
            Accuracy
          </button>
        </div>
      </div>

      <div class="panel-info">
        Showing {Math.min(wordsShowCount, sortedWords.length)} of {sortedWords.length} items
        {#if sortedWords.length > wordsShowCount}
          <button class="show-more" onclick={() => wordsShowCount += 8}>
            Show More ({sortedWords.length - wordsShowCount} more)
          </button>
        {/if}
      </div>

      <div class="words-table">
        <div class="table-header">
          <span class="col-word">Word</span>
          <span class="col-count">#</span>
          <span class="col-wpm">WPM</span>
        </div>
        {#each sortedWords.slice(0, wordsShowCount) as word}
          <div class="table-row">
            <span class="col-word word-text">{word.word}</span>
            <span class="col-count">{word.count}</span>
            <span class="col-wpm" class:slow={word.wpm < 30} class:fast={word.wpm > 60}>
              {word.wpm}
            </span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Bigrams Panel -->
    <div class="panel">
      <div class="panel-header">
        <h3 class="panel-title">Bigrams</h3>
        <div class="sort-label">
          Sort by:
          <button
            class="sort-btn"
            class:active={bigramsSortBy === 'count'}
            onclick={() => bigramsSortBy = 'count'}
          >
            Count
          </button>
          <button
            class="sort-btn"
            class:active={bigramsSortBy === 'time'}
            onclick={() => bigramsSortBy = 'time'}
          >
            Time
          </button>
        </div>
      </div>

      <div class="panel-info">
        Showing {Math.min(bigramsShowCount, sortedBigrams.length)} of {sortedBigrams.length} items
        {#if sortedBigrams.length > bigramsShowCount}
          <button class="show-more" onclick={() => bigramsShowCount += 6}>
            Show More ({sortedBigrams.length - bigramsShowCount} more)
          </button>
        {/if}
      </div>

      <div class="ngram-list">
        {#each sortedBigrams.slice(0, bigramsShowCount) as bigram}
          <div class="ngram-item">
            <div class="ngram-chars">
              <span class="char-box">{formatChar(bigram.chars[0])}</span>
              <span class="arrow">→</span>
              <span class="char-box">{formatChar(bigram.chars[1])}</span>
            </div>
            <div class="ngram-bar-container">
              <div
                class="ngram-bar"
                style="width: {(bigram.avgTime / getMaxBigramTime()) * 100}%"
              ></div>
            </div>
            <span class="ngram-time">{bigram.avgTime}ms</span>
          </div>
        {/each}
      </div>
    </div>

    <!-- Trigrams Panel -->
    <div class="panel">
      <div class="panel-header">
        <h3 class="panel-title">Trigrams</h3>
        <div class="sort-label">
          Sort by:
          <button
            class="sort-btn"
            class:active={trigramsSortBy === 'count'}
            onclick={() => trigramsSortBy = 'count'}
          >
            Count
          </button>
          <button
            class="sort-btn"
            class:active={trigramsSortBy === 'time'}
            onclick={() => trigramsSortBy = 'time'}
          >
            Time
          </button>
        </div>
      </div>

      <div class="panel-info">
        Showing {Math.min(trigramsShowCount, sortedTrigrams.length)} of {sortedTrigrams.length} items
        {#if sortedTrigrams.length > trigramsShowCount}
          <button class="show-more" onclick={() => trigramsShowCount += 6}>
            Show More ({sortedTrigrams.length - trigramsShowCount} more)
          </button>
        {/if}
      </div>

      <div class="ngram-list">
        {#each sortedTrigrams.slice(0, trigramsShowCount) as trigram}
          <div class="ngram-item">
            <div class="ngram-chars">
              <span class="char-box">{formatChar(trigram.chars[0])}</span>
              <span class="arrow">→</span>
              <span class="char-box">{formatChar(trigram.chars[1])}</span>
              <span class="arrow">→</span>
              <span class="char-box">{formatChar(trigram.chars[2])}</span>
            </div>
            <div class="ngram-bar-container">
              <div
                class="ngram-bar"
                style="width: {(trigram.avgTime / getMaxTrigramTime()) * 100}%"
              ></div>
            </div>
            <span class="ngram-time">{trigram.avgTime}ms</span>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- WPM Over Time Chart -->
  <div class="chart-section">
    <WpmOverTime {keystrokes} />
  </div>

  <!-- Hands, Characters, Distribution Row -->
  <div class="analytics-row">
    <div class="row-half">
      <HandsAndFingers fingers={analytics.fingers} hands={analytics.hands} />
    </div>
    <div class="row-half">
      <CharacterDistribution characterTypes={analytics.characterTypes} totalChars={analytics.totalChars} />
    </div>
  </div>

  <!-- Characters Panel (full width) -->
  <div class="characters-section">
    <CharactersPanel characters={analytics.characters} />
  </div>
</div>

<style>
  .analytics-container {
    @apply mt-8 p-6 bg-slate-800/60 rounded-2xl;
  }

  .analytics-title {
    @apply text-xl font-bold text-white mb-6;
  }

  .analytics-grid {
    @apply grid grid-cols-1 lg:grid-cols-3 gap-6;
  }

  .panel {
    @apply bg-slate-900/50 rounded-xl p-4 border border-slate-700/50;
    min-width: 0;
    overflow: hidden;
  }

  .panel-header {
    @apply flex flex-wrap items-center justify-between gap-2 mb-3;
  }

  .panel-title {
    @apply text-base font-semibold text-white;
  }

  .toggle-group {
    @apply flex bg-slate-700/50 rounded-lg p-0.5;
  }

  .toggle-btn {
    @apply px-2 py-1 text-[11px] font-medium rounded-md transition-colors;
    @apply text-slate-400 hover:text-white;
  }

  .toggle-btn.active {
    @apply bg-blue-600 text-white;
  }

  .sort-label {
    @apply flex flex-wrap items-center gap-1 text-[11px] text-slate-400;
  }

  .sort-btn {
    @apply px-1.5 py-0.5 rounded text-slate-400 hover:text-white transition-colors text-[11px];
  }

  .sort-btn.active {
    @apply text-blue-400 font-medium;
  }

  .panel-info {
    @apply text-[10px] text-slate-500 mb-2 flex flex-wrap items-center justify-between gap-1;
  }

  .show-more {
    @apply text-blue-400 hover:text-blue-300 transition-colors;
  }

  /* Words Table */
  .words-table {
    @apply flex flex-col;
  }

  .table-header {
    @apply flex items-center py-1.5 text-[10px] font-medium text-slate-500 border-b border-slate-700/50;
  }

  .table-row {
    @apply flex items-center py-2 text-sm border-b border-slate-800/50;
    @apply hover:bg-slate-800/30 transition-colors;
  }

  .col-word {
    @apply flex-1;
  }

  .word-text {
    @apply font-mono text-slate-300;
  }

  .col-count {
    @apply w-10 text-center text-slate-500;
  }

  .col-wpm {
    @apply w-12 text-right font-mono text-slate-300;
  }

  .col-wpm.slow {
    @apply text-orange-400;
  }

  .col-wpm.fast {
    @apply text-green-400;
  }

  /* Ngram List */
  .ngram-list {
    @apply flex flex-col gap-2;
  }

  .ngram-item {
    @apply flex flex-wrap items-center gap-1;
  }

  .ngram-chars {
    @apply flex items-center gap-0.5 shrink-0;
  }

  .char-box {
    @apply w-5 h-5 flex items-center justify-center;
    @apply bg-slate-700/50 rounded border border-slate-600/50;
    @apply text-[10px] font-mono text-slate-200;
  }

  .arrow {
    @apply text-slate-600 text-[9px];
  }

  .ngram-bar-container {
    @apply h-3 bg-slate-800 rounded overflow-hidden;
    flex: 1 1 30px;
    min-width: 20px;
  }

  .ngram-bar {
    @apply h-full bg-gradient-to-r from-blue-500 to-blue-400;
    @apply transition-all duration-300;
    border-radius: 0 3px 3px 0;
  }

  .ngram-time {
    @apply text-right text-[10px] font-mono text-slate-400 shrink-0;
  }

  /* New sections */
  .chart-section {
    @apply mt-6;
  }

  .analytics-row {
    @apply grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6;
  }

  .row-half {
    @apply min-w-0;
  }

  .characters-section {
    @apply mt-6;
  }
</style>
