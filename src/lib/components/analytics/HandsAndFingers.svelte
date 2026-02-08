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
    max-width: 140px;
  }

  .hand-palm {
    fill: var(--bg-tertiary);
    stroke: var(--text-muted);
  }

  .finger {
    fill: var(--bg-secondary);
    stroke: var(--text-muted);
    stroke-width: 1.5;
    transition: all 0.3s ease;
  }

  .finger.active {
    fill: var(--accent);
    stroke: var(--accent);
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
