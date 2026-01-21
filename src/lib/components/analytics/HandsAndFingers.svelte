<script lang="ts">
  import type { FingerAnalysis, HandAnalysis } from '../../types';

  interface Props {
    fingers: FingerAnalysis[];
    hands: HandAnalysis;
  }

  let { fingers, hands }: Props = $props();

  let sortBy = $state<'speed' | 'accuracy'>('speed');

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
    if (sortBy === 'speed') {
      return `${data.wpm}`;
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
      <svg class="hand-svg" viewBox="0 0 120 150" fill="none">
        <!-- Hand outline - single connected path -->
        <path
          d="M25 95
             L25 75 Q25 65 30 60 L30 45 Q30 35 35 32 Q40 29 45 32 Q50 35 50 45 L50 55
             L50 40 Q50 28 55 24 Q60 20 65 24 Q70 28 70 40 L70 50
             L70 35 Q70 22 75 18 Q80 14 85 18 Q90 22 90 35 L90 50
             L90 40 Q90 28 95 24 Q100 20 105 24 Q110 28 110 40 L110 60
             Q115 65 115 75 L115 85
             Q120 90 118 100 Q115 110 105 115
             L105 105 Q100 100 95 105 L95 95
             Q90 130 60 140 Q30 140 25 110
             Z"
          class="hand-outline"
        />

        <!-- Finger highlights when active -->
        <!-- Pinky (1) -->
        <rect x="28" y="32" width="20" height="35" rx="10" class="finger-zone" class:active={isFingerActive(1)} />
        <!-- Ring (2) -->
        <rect x="48" y="22" width="20" height="40" rx="10" class="finger-zone" class:active={isFingerActive(2)} />
        <!-- Middle (3) -->
        <rect x="68" y="16" width="20" height="45" rx="10" class="finger-zone" class:active={isFingerActive(3)} />
        <!-- Index (4) -->
        <rect x="88" y="22" width="20" height="45" rx="10" class="finger-zone" class:active={isFingerActive(4)} />
        <!-- Thumb (5) -->
        <ellipse cx="108" cy="100" rx="14" ry="20" transform="rotate(-20 108 100)" class="finger-zone" class:active={isFingerActive(5)} />
      </svg>
      <div class="hand-info">
        <span class="hand-label">LEFT HAND</span>
        <span class="hand-wpm">{hands.left.wpm} <small>wpm</small></span>
        <span class="hand-chars">{hands.left.count} characters</span>
      </div>
    </div>

    <!-- Right Hand (mirrored) -->
    <div class="hand-section">
      <svg class="hand-svg" viewBox="0 0 120 150" fill="none">
        <!-- Hand outline - mirrored -->
        <path
          d="M95 95
             L95 75 Q95 65 90 60 L90 45 Q90 35 85 32 Q80 29 75 32 Q70 35 70 45 L70 55
             L70 40 Q70 28 65 24 Q60 20 55 24 Q50 28 50 40 L50 50
             L50 35 Q50 22 45 18 Q40 14 35 18 Q30 22 30 35 L30 50
             L30 40 Q30 28 25 24 Q20 20 15 24 Q10 28 10 40 L10 60
             Q5 65 5 75 L5 85
             Q0 90 2 100 Q5 110 15 115
             L15 105 Q20 100 25 105 L25 95
             Q30 130 60 140 Q90 140 95 110
             Z"
          class="hand-outline"
        />

        <!-- Finger highlights when active (mirrored positions) -->
        <!-- Pinky (10) -->
        <rect x="72" y="32" width="20" height="35" rx="10" class="finger-zone" class:active={isFingerActive(10)} />
        <!-- Ring (9) -->
        <rect x="52" y="22" width="20" height="40" rx="10" class="finger-zone" class:active={isFingerActive(9)} />
        <!-- Middle (8) -->
        <rect x="32" y="16" width="20" height="45" rx="10" class="finger-zone" class:active={isFingerActive(8)} />
        <!-- Index (7) -->
        <rect x="12" y="22" width="20" height="45" rx="10" class="finger-zone" class:active={isFingerActive(7)} />
        <!-- Thumb (6) -->
        <ellipse cx="12" cy="100" rx="14" ry="20" transform="rotate(20 12 100)" class="finger-zone" class:active={isFingerActive(6)} />
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
    background-color: var(--bg-secondary);
    border: 1px solid var(--bg-tertiary);
    border-radius: 12px;
    padding: 1rem;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .panel-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .toggle-group {
    display: flex;
    background-color: var(--bg-tertiary);
    border-radius: 8px;
    padding: 2px;
  }

  .toggle-btn {
    padding: 0.35rem 0.6rem;
    font-size: 11px;
    font-weight: 500;
    border-radius: 6px;
    transition: all 0.2s ease;
    color: var(--text-secondary);
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .toggle-btn:hover {
    color: var(--text-primary);
  }

  .toggle-btn.active {
    background-color: var(--accent);
    color: white;
  }

  .finger-stats-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.25rem 0.5rem;
    margin-bottom: 1rem;
  }

  @media (min-width: 400px) {
    .finger-stats-row {
      grid-template-columns: repeat(8, 1fr);
    }
  }

  .finger-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-width: 0;
  }

  @media (min-width: 400px) {
    .finger-stat:nth-child(4) {
      border-right: 1px solid var(--bg-tertiary);
      padding-right: 0.25rem;
    }

    .finger-stat:nth-child(5) {
      padding-left: 0.25rem;
    }
  }

  .finger-label {
    font-size: 8px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.02em;
  }

  .finger-value {
    font-size: 11px;
    font-weight: 600;
    color: var(--accent);
  }

  .finger-value.inactive {
    color: var(--text-muted);
  }

  .hands-display {
    display: flex;
    justify-content: center;
    gap: 1rem;
  }

  .hand-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    max-width: 160px;
  }

  .hand-svg {
    width: 100%;
    height: auto;
    max-width: 120px;
  }

  .hand-outline {
    fill: var(--bg-tertiary);
    stroke: var(--text-muted);
    stroke-width: 1.5;
  }

  .finger-zone {
    fill: transparent;
    stroke: none;
    transition: all 0.3s ease;
  }

  .finger-zone.active {
    fill: var(--accent);
    opacity: 0.85;
  }

  .hand-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 0.75rem;
  }

  .hand-label {
    font-size: 9px;
    color: var(--text-muted);
    letter-spacing: 0.15em;
    margin-bottom: 0.25rem;
  }

  .hand-wpm {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .hand-wpm small {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--text-secondary);
  }

  .hand-chars {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }
</style>
