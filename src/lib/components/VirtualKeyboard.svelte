<script lang="ts">
  import type { ConcreteKeyboardLayoutId } from '../types';
  import { buildKeyboardRows, getCachedFingerMap, getCachedShiftChars, type VirtualKeyDef } from '../utils/layoutKeyboardHelpers';
  import { fingerColors, darkenColor } from '../utils/keyboardHelpers';

  interface Props {
    nextKey: string;
    showHands?: boolean;
    layoutId?: ConcreteKeyboardLayoutId;
  }

  let { nextKey, showHands = true, layoutId = 'qwerty-us' }: Props = $props();

  // Reactively build keyboard data from layout
  let keyboardRows = $derived(buildKeyboardRows(layoutId));
  let fingerMap = $derived(getCachedFingerMap(layoutId));
  let shiftChars = $derived(getCachedShiftChars(layoutId));

  const purpleColor = '#a855f7'; // purple-500

  function isKeyActive(keyData: VirtualKeyDef): boolean {
    if (!nextKey) return false;

    // Direct match for the key
    if (keyData.key === nextKey) return true;

    // Case-insensitive match for letters
    const lowerNext = nextKey.toLowerCase();
    const lowerKey = keyData.key.toLowerCase();
    if (lowerKey === lowerNext && keyData.key.length === 1) return true;

    // Check shift character
    if (keyData.shift && keyData.shift === nextKey) return true;

    return false;
  }

  function needsShift(): boolean {
    if (!nextKey) return false;
    return shiftChars.has(nextKey);
  }

  function getKeyHighlightStyle(keyData: VirtualKeyDef): string {
    if (isKeyActive(keyData)) {
      const finger = fingerMap[nextKey] || fingerMap[nextKey.toLowerCase()];
      if (finger) {
        return `background-color: ${fingerColors[finger]}; color: white; transform: scale(1.05);`;
      }
      return 'background-color: #3b82f6; color: white; transform: scale(1.05);';
    }

    // Highlight shift keys if shift is needed
    if (keyData.key === 'Shift' && needsShift()) {
      // Highlight opposite shift key based on which hand types the character
      const finger = fingerMap[nextKey] || fingerMap[nextKey.toLowerCase()];
      if (finger && finger <= 5 && keyData.side === 'right') {
        return `background-color: ${purpleColor}; color: white;`;
      }
      if (finger && finger > 5 && keyData.side === 'left') {
        return `background-color: ${purpleColor}; color: white;`;
      }
    }

    return '';
  }

  function getFingerForCurrentKey(): number | null {
    if (!nextKey) return null;
    return fingerMap[nextKey] || fingerMap[nextKey.toLowerCase()] || null;
  }

  function getFingerStyle(fingerNum: number): string {
    const currentFinger = getFingerForCurrentKey();
    if (currentFinger === fingerNum) {
      const color = fingerColors[fingerNum];
      const strokeColor = darkenColor(color);
      return `fill: ${color}; stroke: ${strokeColor}; filter: drop-shadow(0 0 6px ${color}80);`;
    }
    return '';
  }
</script>

<div class="keyboard-container">
  <div class="keyboard">
    {#each keyboardRows as row, rowIndex}
      <div class="keyboard-row">
        {#each row as keyData}
          <div
            class="key"
            class:home-key={keyData.home}
            class:active={isKeyActive(keyData)}
            style="flex: {keyData.width}; {getKeyHighlightStyle(keyData)}"
          >
            {#if keyData.shift && keyData.key.length === 1}
              <span class="key-shift">{keyData.shift}</span>
              <span class="key-main">{keyData.key}</span>
            {:else}
              <span class="key-label">{keyData.label || keyData.key}</span>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>

  {#if showHands}
    <div class="hands-container">
      <!-- Left hand -->
      <svg class="hand left-hand" viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Palm -->
        <path d="M40 180 Q20 140 30 100 L50 60 L70 40 L90 35 L110 40 L130 50 L150 80 Q160 120 150 180 Q140 220 100 240 Q60 240 40 180"
              class="hand-palm" stroke-width="2"/>
        <!-- Fingers -->
        <ellipse cx="50" cy="55" rx="12" ry="25" class="finger" style={getFingerStyle(1)}/>
        <ellipse cx="75" cy="35" rx="12" ry="28" class="finger" style={getFingerStyle(2)}/>
        <ellipse cx="100" cy="28" rx="12" ry="30" class="finger" style={getFingerStyle(3)}/>
        <ellipse cx="125" cy="38" rx="12" ry="28" class="finger" style={getFingerStyle(4)}/>
        <ellipse cx="160" cy="95" rx="20" ry="12" transform="rotate(-30 160 95)" class="finger" style={getFingerStyle(5)}/>
      </svg>

      <!-- Right hand -->
      <svg class="hand right-hand" viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Palm (mirrored) -->
        <path d="M160 180 Q180 140 170 100 L150 60 L130 40 L110 35 L90 40 L70 50 L50 80 Q40 120 50 180 Q60 220 100 240 Q140 240 160 180"
              class="hand-palm" stroke-width="2"/>
        <!-- Fingers (mirrored) -->
        <ellipse cx="150" cy="55" rx="12" ry="25" class="finger" style={getFingerStyle(10)}/>
        <ellipse cx="125" cy="35" rx="12" ry="28" class="finger" style={getFingerStyle(9)}/>
        <ellipse cx="100" cy="28" rx="12" ry="30" class="finger" style={getFingerStyle(8)}/>
        <ellipse cx="75" cy="38" rx="12" ry="28" class="finger" style={getFingerStyle(7)}/>
        <ellipse cx="40" cy="95" rx="20" ry="12" transform="rotate(30 40 95)" class="finger" style={getFingerStyle(6)}/>
      </svg>
    </div>
  {/if}

  <!-- Finger legend -->
  <div class="finger-legend">
    <div class="legend-item">
      <span class="legend-dot" style="background-color: #f43f5e;"></span>
      <span>Pinky</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot" style="background-color: #f97316;"></span>
      <span>Ring</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot" style="background-color: #eab308;"></span>
      <span>Middle</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot" style="background-color: #22c55e;"></span>
      <span>Index</span>
    </div>
    <div class="legend-item">
      <span class="legend-dot" style="background-color: #3b82f6;"></span>
      <span>Thumb</span>
    </div>
  </div>
</div>

<style>
  .keyboard-container {
    @apply flex flex-col items-center gap-4 mt-6;
  }

  .keyboard {
    @apply p-3 rounded-lg;
    @apply flex flex-col gap-0.5;
    max-width: 650px;
    width: 100%;
    background-color: var(--bg-secondary);
  }

  .keyboard-row {
    @apply flex gap-0.5;
  }

  .key {
    @apply rounded;
    @apply flex flex-col items-center justify-center;
    @apply text-xs font-normal;
    @apply transition-all duration-100;
    min-height: 36px;
    padding: 3px;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
    border: none;
  }

  .key:hover {
    background-color: #404245;
  }

  .key.home-key {
    border-bottom: 2px solid var(--text-muted);
  }

  .key-shift {
    @apply text-[9px];
    color: var(--text-muted);
  }

  .key-main {
    @apply text-xs;
    color: var(--text-primary);
  }

  .key-label {
    @apply text-[9px] lowercase;
  }

  .hands-container {
    @apply flex justify-center gap-6;
    width: 100%;
    max-width: 450px;
  }

  .hand {
    @apply w-28 h-36;
  }

  .hand-palm {
    fill: var(--bg-tertiary);
    stroke: var(--text-muted);
  }

  .finger {
    fill: var(--bg-secondary);
    stroke: var(--text-muted);
    stroke-width: 1.5;
    transition: all 0.15s ease;
  }

  .finger-legend {
    @apply flex gap-3 text-xs;
    color: var(--text-muted);
  }

  .legend-item {
    @apply flex items-center gap-1;
  }

  .legend-dot {
    @apply w-2.5 h-2.5 rounded-full;
  }
</style>
