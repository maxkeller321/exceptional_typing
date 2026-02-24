<script lang="ts">
  import type { FingerAnalysis, HandAnalysis } from '../../types';

  interface Props {
    fingers: FingerAnalysis[];
    hands: HandAnalysis;
  }

  let { fingers, hands }: Props = $props();

  let sortBy = $state<'counts' | 'accuracy'>('counts');

  // Get finger data organized by position
  const fingerOrder = ['leftPinky', 'leftRing', 'leftMiddle', 'leftIndex', 'rightIndex', 'rightMiddle', 'rightRing', 'rightPinky'] as const;
  const fingerLabels: Record<string, string> = {
    leftPinky: 'Pinky',
    leftRing: 'Ring',
    leftMiddle: 'Middle',
    leftIndex: 'Index',
    rightIndex: 'Index',
    rightMiddle: 'Middle',
    rightRing: 'Ring',
    rightPinky: 'Pinky',
  };

  function getFingerData(fingerName: string): FingerAnalysis | undefined {
    return fingers.find(f => f.finger === fingerName);
  }

  function getFingerValue(fingerName: string): string {
    const data = getFingerData(fingerName);
    if (!data || data.count === 0) return '—';
    if (sortBy === 'counts') {
      return `${data.count}`;
    }
    return `${Math.round(data.accuracy * 100)}%`;
  }

  function isFingerActive(fingerNum: number): boolean {
    const data = fingers.find(f => f.fingerNum === fingerNum);
    return data ? data.count > 0 : false;
  }
</script>

<div class="hands-panel">
  <div class="panel-header">
    <h3 class="panel-title">Hands & Fingers</h3>
    <div class="toggle-group">
      <button
        class="toggle-btn"
        class:active={sortBy === 'counts'}
        onclick={() => sortBy = 'counts'}
      >
        Counts
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

  <!-- Finger stats row -->
  <div class="finger-stats-row">
    {#each fingerOrder as finger, i}
      <div class="finger-stat" class:left-hand={i < 4}>
        <span class="finger-label">{fingerLabels[finger]}</span>
        <span class="finger-value" class:inactive={getFingerValue(finger) === '—'}>
          {getFingerValue(finger)}
        </span>
      </div>
    {/each}
  </div>

  <!-- Hand diagrams -->
  <div class="hands-display">
    <!-- Left Hand -->
    <div class="hand-section">
      <svg class="hand-svg" viewBox="0 0 200 250" fill="none">
        <!-- Palm -->
        <path d="M40 180 Q20 140 30 100 L50 60 L70 40 L90 35 L110 40 L130 50 L150 80 Q160 120 150 180 Q140 220 100 240 Q60 240 40 180"
              class="hand-palm" stroke-width="2"/>
        <!-- Fingers -->
        <ellipse cx="50" cy="55" rx="12" ry="25" class="finger" class:active={isFingerActive(1)}/>
        <ellipse cx="75" cy="35" rx="12" ry="28" class="finger" class:active={isFingerActive(2)}/>
        <ellipse cx="100" cy="28" rx="12" ry="30" class="finger" class:active={isFingerActive(3)}/>
        <ellipse cx="125" cy="38" rx="12" ry="28" class="finger" class:active={isFingerActive(4)}/>
        <ellipse cx="160" cy="95" rx="20" ry="12" transform="rotate(-30 160 95)" class="finger" class:active={isFingerActive(5)}/>
      </svg>
      <div class="hand-info">
        <span class="hand-label">LEFT HAND</span>
        <span class="hand-wpm">{hands.left.wpm} <small>wpm</small></span>
        <span class="hand-chars">{hands.left.count} characters</span>
      </div>
    </div>

    <!-- Right Hand (mirrored) -->
    <div class="hand-section">
      <svg class="hand-svg" viewBox="0 0 200 250" fill="none">
        <!-- Palm (mirrored) -->
        <path d="M160 180 Q180 140 170 100 L150 60 L130 40 L110 35 L90 40 L70 50 L50 80 Q40 120 50 180 Q60 220 100 240 Q140 240 160 180"
              class="hand-palm" stroke-width="2"/>
        <!-- Fingers (mirrored) -->
        <ellipse cx="150" cy="55" rx="12" ry="25" class="finger" class:active={isFingerActive(10)}/>
        <ellipse cx="125" cy="35" rx="12" ry="28" class="finger" class:active={isFingerActive(9)}/>
        <ellipse cx="100" cy="28" rx="12" ry="30" class="finger" class:active={isFingerActive(8)}/>
        <ellipse cx="75" cy="38" rx="12" ry="28" class="finger" class:active={isFingerActive(7)}/>
        <ellipse cx="40" cy="95" rx="20" ry="12" transform="rotate(30 40 95)" class="finger" class:active={isFingerActive(6)}/>
      </svg>
      <div class="hand-info">
        <span class="hand-label">RIGHT HAND</span>
        <span class="hand-wpm">{hands.right.wpm} <small>wpm</small></span>
        <span class="hand-chars">{hands.right.count} characters</span>
      </div>
    </div>
  </div>
</div>

<style>
  .hands-panel {
    @apply bg-slate-900/50 rounded-xl p-4 border border-slate-700/50;
    overflow: hidden;
  }

  .panel-header {
    @apply flex flex-wrap items-center justify-between gap-2 mb-4;
  }

  .panel-title {
    @apply text-base font-semibold text-white;
    margin: 0;
  }

  .toggle-group {
    @apply flex bg-slate-700/50 rounded-lg p-0.5;
  }

  .toggle-btn {
    @apply px-2 py-1 text-[11px] font-medium rounded-md transition-colors;
    @apply text-slate-400 hover:text-white;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .toggle-btn.active {
    @apply bg-blue-600 text-white;
  }

  .finger-stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    @apply gap-1 mb-4;
  }

  @media (min-width: 400px) {
    .finger-stats-row {
      grid-template-columns: repeat(8, 1fr);
    }
  }

  .finger-stat {
    @apply flex flex-col items-center text-center min-w-0;
  }

  @media (min-width: 400px) {
    .finger-stat:nth-child(4) {
      @apply border-r border-slate-700/50 pr-1;
    }

    .finger-stat:nth-child(5) {
      @apply pl-1;
    }
  }

  .finger-label {
    @apply text-[8px] text-slate-500 uppercase tracking-tight;
  }

  .finger-value {
    @apply text-[11px] font-semibold text-blue-400;
  }

  .finger-value.inactive {
    @apply text-slate-500;
  }

  .hands-display {
    @apply flex justify-center gap-4;
  }

  .hand-section {
    @apply flex flex-col items-center flex-1;
    max-width: 160px;
  }

  .hand-svg {
    @apply w-full h-auto;
    max-width: 140px;
  }

  .hand-palm {
    fill: rgb(51 65 85 / 0.5);
    stroke: #64748b;
  }

  .finger {
    fill: rgb(15 23 42 / 0.5);
    stroke: #64748b;
    stroke-width: 1.5;
    @apply transition-all duration-300;
  }

  .finger.active {
    fill: #3b82f6;
    stroke: #3b82f6;
    opacity: 0.85;
  }

  .hand-info {
    @apply flex flex-col items-center mt-3;
  }

  .hand-label {
    @apply text-[9px] text-slate-500 tracking-widest mb-1;
  }

  .hand-wpm {
    @apply text-xl font-bold text-white;
  }

  .hand-wpm small {
    @apply text-sm font-normal text-slate-400;
  }

  .hand-chars {
    @apply text-xs text-slate-400;
  }
</style>
