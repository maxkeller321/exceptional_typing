<script lang="ts">
  import { onMount } from 'svelte';
  import { typingStore } from '../stores/typing';
  import VirtualKeyboard from './VirtualKeyboard.svelte';
  import type { Task, TypingState, TaskResult } from '../types';
  import { highlightCode, getTokenColor, type HighlightToken, type CodeTheme } from '../utils/highlight';
  import { splitIntoWordUnits, type WordUnit } from '../utils/wordWrapper';

  interface Props {
    task: Task;
    showKeyboard?: boolean;
    codeTheme?: CodeTheme;
    onComplete?: (result: TaskResult) => void;
  }

  let { task, showKeyboard = true, codeTheme = 'vscode-dark', onComplete }: Props = $props();

  let containerRef: HTMLDivElement;
  let isActive = $state(true);

  // Syntax highlighting tokens
  let highlightTokens = $state<HighlightToken[]>([]);

  // Compute highlighted tokens when task changes
  $effect(() => {
    if (task?.language && task.targetText) {
      highlightTokens = highlightCode(task.targetText, task.language);
    } else {
      highlightTokens = [];
    }
  });

  // Get syntax color for a character index
  function getSyntaxColor(index: number): string | null {
    if (!task?.language || highlightTokens.length === 0) return null;
    const token = highlightTokens.find(t => index >= t.start && index < t.end);
    return token ? getTokenColor(token.type, codeTheme) : null;
  }

  // Local state that subscribes to stores
  let targetText = $state('');

  // Word units for proper word wrapping (words don't break mid-word)
  let wordUnits = $derived(splitIntoWordUnits(targetText));

  let typingState = $state<TypingState>({
    currentIndex: 0,
    typed: '',
    errors: [],
    startTime: null,
    endTime: null,
    isComplete: false,
    isPaused: false,
  });
  let progress = $state(0);
  let liveWpm = $state(0);
  let liveAccuracy = $state(100);

  // Get the next key to press
  function getNextKey(): string {
    if (!targetText || typingState.currentIndex >= targetText.length) return '';
    return targetText[typingState.currentIndex];
  }

  // Character status for styling
  type CharStatus = 'correct' | 'error' | 'current' | 'pending';

  function getCharStatus(index: number): CharStatus {
    if (index < typingState.currentIndex) {
      const hasError = typingState.errors.some((e) => e.index === index);
      return hasError ? 'error' : 'correct';
    }
    if (index === typingState.currentIndex) {
      return 'current';
    }
    return 'pending';
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (!isActive || typingState.isComplete || typingState.isPaused) return;

    // Prevent default for most keys to avoid browser shortcuts
    if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
    }

    if (event.key === 'Backspace') {
      typingStore.handleBackspace();
      return;
    }

    if (event.key === 'Escape') {
      typingStore.pause();
      return;
    }

    // Only handle printable characters
    if (event.key.length === 1) {
      typingStore.handleKeyPress(event.key);
    }
  }

  function handleFocus(): void {
    isActive = true;
    if (typingState.isPaused) {
      typingStore.resume();
    }
  }

  function handleBlur(): void {
    isActive = false;
    if (!typingState.isComplete) {
      typingStore.pause();
    }
  }

  // Track previous task to detect changes
  let previousTaskId = $state<string | null>(null);

  // Handle completion
  let wasComplete = $state(false);

  onMount(() => {
    // Subscribe to all stores
    const unsubTargetText = typingStore.targetText.subscribe(t => {
      targetText = t;
    });

    const unsubTypingState = typingStore.subscribe(s => {
      typingState = s;

      // Handle completion
      if (s.isComplete && !wasComplete && onComplete) {
        wasComplete = true;
        const result = typingStore.getResult();
        if (result) {
          onComplete(result);
        }
      }
      if (!s.isComplete) {
        wasComplete = false;
      }
    });

    const unsubProgress = typingStore.progress.subscribe(p => {
      progress = p;
    });

    const unsubWpm = typingStore.liveWpm.subscribe(w => {
      liveWpm = w;
    });

    const unsubAccuracy = typingStore.liveAccuracy.subscribe(a => {
      liveAccuracy = a;
    });

    // Initial task reset
    if (task) {
      typingStore.reset(task);
      previousTaskId = task.id;
    }

    // Delay focus to avoid interfering with button clicks that trigger component mount
    // Using requestAnimationFrame ensures we don't steal focus during the current event cycle
    const focusFrame = requestAnimationFrame(() => {
      containerRef?.focus();
    });

    return () => {
      cancelAnimationFrame(focusFrame);
      unsubTargetText();
      unsubTypingState();
      unsubProgress();
      unsubWpm();
      unsubAccuracy();
    };
  });

  // Watch for task changes using $effect
  $effect(() => {
    if (task && task.id !== previousTaskId) {
      typingStore.reset(task);
      previousTaskId = task.id;
      wasComplete = false;
    }
  });
</script>

<div
  class="typing-area"
  bind:this={containerRef}
  tabindex="0"
  role="textbox"
  aria-label="Typing area"
  onfocus={handleFocus}
  onblur={handleBlur}
  onkeydown={handleKeyDown}
>
  <!-- Task instruction -->
  <div class="instruction">
    <p class="text-slate-400 text-sm mb-4">{task.instruction}</p>
  </div>

  <!-- Live metrics bar -->
  <div class="metrics-bar">
    <div class="metric">
      <span class="label">WPM</span>
      <span class="value">{liveWpm}</span>
    </div>
    <div class="metric">
      <span class="label">Accuracy</span>
      <span class="value">{liveAccuracy}%</span>
    </div>
    <div class="metric">
      <span class="label">Progress</span>
      <span class="value">{Math.round(progress)}%</span>
    </div>
  </div>

  <!-- Progress bar -->
  <div class="progress-bar">
    <div class="progress-fill" style="width: {progress}%"></div>
  </div>

  <!-- Text display - uses word units to prevent mid-word line breaks -->
  <div class="text-display" class:code-mode={task?.language}>{#each wordUnits as unit}{#if unit.isNewline}<br />{:else}<span class="word-unit" class:space-unit={unit.isSpace}>{#each unit.text.split('') as char, charIndex}{@const globalIndex = unit.startIndex + charIndex}{@const status = getCharStatus(globalIndex)}{@const syntaxColor = getSyntaxColor(globalIndex)}<span class="char {status}" class:space={char === ' '} style={status === 'pending' && syntaxColor ? `color: ${syntaxColor}` : ''}>{char === ' ' ? '\u00A0' : char}{#if status === 'current'}<span class="cursor"></span>{/if}</span>{/each}</span>{/if}{/each}</div>

  <!-- Status messages -->
  {#if typingState.isPaused}
    <div class="status-overlay">
      <p>Paused</p>
      <p class="text-sm text-slate-400">Click to resume</p>
    </div>
  {/if}

  {#if typingState.isComplete}
    <div class="completion-message">
      <p class="text-2xl font-bold text-green-400">Complete!</p>
      <div class="final-stats">
        <span>WPM: {liveWpm}</span>
        <span>Accuracy: {liveAccuracy}%</span>
      </div>
    </div>
  {/if}

  {#if !isActive && !typingState.isComplete}
    <div class="focus-hint">
      <p class="focus-hint-title">Paused</p>
      <p class="focus-hint-subtitle">Click here to start typing</p>
    </div>
  {/if}
</div>

<!-- Virtual Keyboard -->
{#if showKeyboard && !typingState.isComplete}
  <VirtualKeyboard nextKey={getNextKey()} showHands={true} />
{/if}

<style>
  .typing-area {
    @apply relative rounded-lg p-6 outline-none;
    @apply min-h-[250px] flex flex-col;
    background-color: transparent;
  }

  .typing-area:focus {
    /* Minimal focus indicator */
  }

  .metrics-bar {
    @apply flex gap-6 mb-3 text-sm;
  }

  .metric {
    @apply flex items-center gap-1.5;
  }

  .metric .label {
    @apply uppercase tracking-wide text-xs;
    color: var(--text-muted);
  }

  .metric .value {
    @apply font-medium text-xl;
    color: var(--accent);
  }

  .progress-bar {
    @apply h-0.5 rounded-full mb-6 overflow-hidden;
    background-color: var(--bg-tertiary);
  }

  .progress-fill {
    @apply h-full transition-all duration-100 ease-out;
    background-color: var(--accent);
  }

  .text-display {
    @apply text-xl leading-loose font-mono;
    letter-spacing: 0.02em;
  }

  .text-display.code-mode {
    @apply leading-relaxed;
    font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
    font-size: 1rem;
  }

  /* Word units prevent mid-word line breaks */
  .word-unit {
    display: inline-block;
    white-space: nowrap;
  }

  /* Space units can break after them (natural wrap points) */
  .word-unit.space-unit {
    white-space: pre;
  }

  .char {
    @apply relative;
  }

  .text-display:not(.code-mode) .char {
    display: inline;
  }

  .text-display.code-mode .char {
    display: inline;
  }

  .char.correct {
    color: var(--accent);
  }

  .char.error {
    color: var(--error);
    background-color: var(--error-bg);
    border-radius: 2px;
  }

  .char.current {
    color: var(--text-primary);
  }

  .char.pending {
    color: var(--text-secondary);
  }

  .char.space.error {
    background-color: rgba(202, 71, 84, 0.3);
  }

  .cursor {
    @apply absolute -left-px top-0 h-full;
    width: 2px;
    background-color: var(--accent);
    animation: blink 1s step-end infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .status-overlay {
    @apply absolute inset-0 flex flex-col items-center justify-center;
    @apply rounded-lg text-lg;
    background-color: rgba(35, 37, 40, 0.9);
    color: var(--text-primary);
  }

  .completion-message {
    @apply mt-6 text-center;
  }

  .completion-message p {
    color: var(--success);
    @apply text-xl font-medium;
  }

  .final-stats {
    @apply flex gap-6 justify-center mt-3;
    color: var(--text-secondary);
    @apply text-sm;
  }

  .focus-hint {
    @apply absolute inset-0 flex flex-col items-center justify-center gap-2;
    @apply rounded-lg cursor-pointer;
    background-color: rgba(35, 37, 40, 0.85);
  }

  .focus-hint-title {
    @apply text-xl font-medium;
    color: var(--text-primary);
  }

  .focus-hint-subtitle {
    @apply text-sm;
    color: var(--text-muted);
  }
</style>
