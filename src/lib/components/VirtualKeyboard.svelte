<script lang="ts">
  interface Props {
    nextKey: string;
    showHands?: boolean;
  }

  let { nextKey, showHands = true }: Props = $props();

  // Keyboard layout - US QWERTY
  const keyboardRows = [
    [
      { key: '`', shift: '~', width: 1 },
      { key: '1', shift: '!', width: 1 },
      { key: '2', shift: '@', width: 1 },
      { key: '3', shift: '#', width: 1 },
      { key: '4', shift: '$', width: 1 },
      { key: '5', shift: '%', width: 1 },
      { key: '6', shift: '^', width: 1 },
      { key: '7', shift: '&', width: 1 },
      { key: '8', shift: '*', width: 1 },
      { key: '9', shift: '(', width: 1 },
      { key: '0', shift: ')', width: 1 },
      { key: '-', shift: '_', width: 1 },
      { key: '=', shift: '+', width: 1 },
      { key: 'Backspace', label: 'delete', width: 1.5 },
    ],
    [
      { key: 'Tab', label: 'tab', width: 1.5 },
      { key: 'q', shift: 'Q', width: 1 },
      { key: 'w', shift: 'W', width: 1 },
      { key: 'e', shift: 'E', width: 1 },
      { key: 'r', shift: 'R', width: 1 },
      { key: 't', shift: 'T', width: 1 },
      { key: 'y', shift: 'Y', width: 1 },
      { key: 'u', shift: 'U', width: 1 },
      { key: 'i', shift: 'I', width: 1 },
      { key: 'o', shift: 'O', width: 1 },
      { key: 'p', shift: 'P', width: 1 },
      { key: '[', shift: '{', width: 1 },
      { key: ']', shift: '}', width: 1 },
      { key: '\\', shift: '|', width: 1 },
    ],
    [
      { key: 'CapsLock', label: 'caps lock', width: 1.75 },
      { key: 'a', shift: 'A', width: 1 },
      { key: 's', shift: 'S', width: 1 },
      { key: 'd', shift: 'D', width: 1 },
      { key: 'f', shift: 'F', width: 1, home: true },
      { key: 'g', shift: 'G', width: 1 },
      { key: 'h', shift: 'H', width: 1 },
      { key: 'j', shift: 'J', width: 1, home: true },
      { key: 'k', shift: 'K', width: 1 },
      { key: 'l', shift: 'L', width: 1 },
      { key: ';', shift: ':', width: 1 },
      { key: "'", shift: '"', width: 1 },
      { key: 'Enter', label: 'return', width: 1.75 },
    ],
    [
      { key: 'Shift', label: 'shift', width: 2.25, side: 'left' },
      { key: 'z', shift: 'Z', width: 1 },
      { key: 'x', shift: 'X', width: 1 },
      { key: 'c', shift: 'C', width: 1 },
      { key: 'v', shift: 'V', width: 1 },
      { key: 'b', shift: 'B', width: 1 },
      { key: 'n', shift: 'N', width: 1 },
      { key: 'm', shift: 'M', width: 1 },
      { key: ',', shift: '<', width: 1 },
      { key: '.', shift: '>', width: 1 },
      { key: '/', shift: '?', width: 1 },
      { key: 'Shift', label: 'shift', width: 2.25, side: 'right' },
    ],
    [
      { key: 'fn', label: 'fn', width: 1 },
      { key: 'Control', label: 'control', width: 1 },
      { key: 'Alt', label: 'option', width: 1 },
      { key: 'Meta', label: 'command', width: 1.25 },
      { key: ' ', label: '', width: 5 },
      { key: 'Meta', label: 'command', width: 1.25, side: 'right' },
      { key: 'Alt', label: 'option', width: 1, side: 'right' },
      { key: 'ArrowLeft', label: '\u25C0', width: 1 },
      { key: 'ArrowUp', label: '\u25B2', width: 0.5, half: 'top' },
      { key: 'ArrowDown', label: '\u25BC', width: 0.5, half: 'bottom' },
      { key: 'ArrowRight', label: '\u25B6', width: 1 },
    ],
  ];

  // Finger assignments for each key (left hand: 1-5, right hand: 6-10)
  // 1=left pinky, 2=left ring, 3=left middle, 4=left index, 5=left thumb
  // 6=right thumb, 7=right index, 8=right middle, 9=right ring, 10=right pinky
  const fingerMap: Record<string, number> = {
    // Row 1 - Numbers
    '`': 1, '~': 1,
    '1': 1, '!': 1,
    '2': 2, '@': 2,
    '3': 3, '#': 3,
    '4': 4, '$': 4,
    '5': 4, '%': 4,
    '6': 7, '^': 7,
    '7': 7, '&': 7,
    '8': 8, '*': 8,
    '9': 9, '(': 9,
    '0': 10, ')': 10,
    '-': 10, '_': 10,
    '=': 10, '+': 10,

    // Row 2 - QWERTY
    'q': 1, 'Q': 1,
    'w': 2, 'W': 2,
    'e': 3, 'E': 3,
    'r': 4, 'R': 4,
    't': 4, 'T': 4,
    'y': 7, 'Y': 7,
    'u': 7, 'U': 7,
    'i': 8, 'I': 8,
    'o': 9, 'O': 9,
    'p': 10, 'P': 10,
    '[': 10, '{': 10,
    ']': 10, '}': 10,
    '\\': 10, '|': 10,

    // Row 3 - Home row
    'a': 1, 'A': 1,
    's': 2, 'S': 2,
    'd': 3, 'D': 3,
    'f': 4, 'F': 4,
    'g': 4, 'G': 4,
    'h': 7, 'H': 7,
    'j': 7, 'J': 7,
    'k': 8, 'K': 8,
    'l': 9, 'L': 9,
    ';': 10, ':': 10,
    "'": 10, '"': 10,

    // Row 4 - Bottom
    'z': 1, 'Z': 1,
    'x': 2, 'X': 2,
    'c': 3, 'C': 3,
    'v': 4, 'V': 4,
    'b': 4, 'B': 4,
    'n': 7, 'N': 7,
    'm': 7, 'M': 7,
    ',': 8, '<': 8,
    '.': 9, '>': 9,
    '/': 10, '?': 10,

    // Space bar - both thumbs
    ' ': 6,
  };

  // Finger colors - using hex values for inline styles (Tailwind purges dynamic classes)
  const fingerColors: Record<number, string> = {
    1: '#f43f5e',      // Left pinky - rose-500
    2: '#f97316',      // Left ring - orange-500
    3: '#eab308',      // Left middle - yellow-500
    4: '#22c55e',      // Left index - green-500
    5: '#3b82f6',      // Left thumb - blue-500
    6: '#3b82f6',      // Right thumb - blue-500
    7: '#22c55e',      // Right index - green-500
    8: '#eab308',      // Right middle - yellow-500
    9: '#f97316',      // Right ring - orange-500
    10: '#f43f5e',     // Right pinky - rose-500
  };

  const purpleColor = '#a855f7'; // purple-500

  function isKeyActive(keyData: { key: string; shift?: string }): boolean {
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
    // Check if the character requires shift
    const shiftChars = '~!@#$%^&*()_+{}|:"<>?QWERTYUIOPASDFGHJKLZXCVBNM';
    return shiftChars.includes(nextKey);
  }

  function getKeyHighlightStyle(keyData: { key: string; shift?: string; side?: string }): string {
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
      // Derive darker stroke color by reducing brightness
      const strokeColor = darkenColor(color);
      return `fill: ${color}; stroke: ${strokeColor}; filter: drop-shadow(0 0 6px ${color}80);`;
    }
    return '';
  }

  // Helper to darken a hex color for stroke
  function darkenColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const factor = 0.7;
    return `#${Math.round(r * factor).toString(16).padStart(2, '0')}${Math.round(g * factor).toString(16).padStart(2, '0')}${Math.round(b * factor).toString(16).padStart(2, '0')}`;
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
