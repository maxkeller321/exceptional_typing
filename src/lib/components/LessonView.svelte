<script lang="ts">
  import { onMount } from 'svelte';
  import TypingArea from './TypingArea.svelte';
  import TypingAnalytics from './TypingAnalytics.svelte';
  import CodeThemeSelector from './CodeThemeSelector.svelte';
  import AutoFormatToggle from './AutoFormatToggle.svelte';
  import {
    selectedLesson,
    currentTaskIndex,
    currentTask,
    nextTask,
    previousTask,
    recordTaskResult,
    navigateTo,
  } from '../stores/app';
  import { typingStore } from '../stores/typing';
  import type { TaskResult, Lesson, Task, KeystrokeEvent } from '../types';
  import type { CodeTheme } from '../utils/highlight';
  import { formatCode } from '../utils/codeFormatter';

  let showResults = $state(false);
  let lastResult = $state<TaskResult | null>(null);
  let lastKeystrokes = $state<KeystrokeEvent[]>([]);
  let lastTargetText = $state('');
  let codeTheme = $state<CodeTheme>('vscode-dark');
  let autoFormat = $state(true);

  let lesson = $state<Lesson | null>(null);
  let task = $state<Task | null>(null);
  let taskIndex = $state(0);

  // Track previous lesson ID to detect lesson changes
  let previousLessonId = $state<string | null>(null);

  // Compute formatted task when auto-format is enabled
  let formattedTask = $derived.by(() => {
    if (!task) return null;
    if (!autoFormat || !task.language) return task;

    return {
      ...task,
      targetText: formatCode(task.targetText, task.language),
    };
  });

  // Reset results state when lesson changes
  function resetResultsState(): void {
    showResults = false;
    lastResult = null;
    lastKeystrokes = [];
    lastTargetText = '';
  }

  onMount(() => {
    const unsubLesson = selectedLesson.subscribe(l => {
      // Reset results when lesson changes
      if (l && l.id !== previousLessonId) {
        resetResultsState();
        previousLessonId = l.id;
      }
      lesson = l;
    });
    const unsubTask = currentTask.subscribe(t => { task = t; });
    const unsubIndex = currentTaskIndex.subscribe(i => { taskIndex = i; });

    return () => {
      unsubLesson();
      unsubTask();
      unsubIndex();
    };
  });

  function handleComplete(result: TaskResult): void {
    lastResult = result;
    lastKeystrokes = typingStore.getKeystrokes();
    lastTargetText = typingStore.getTargetText();
    showResults = true;
    recordTaskResult(result);
  }

  function handleNextTask(): void {
    resetResultsState();
    if (!nextTask()) {
      // Lesson complete
    }
  }

  function handleRetry(): void {
    resetResultsState();
    // Reset the typing store with the current task to restart
    if (formattedTask) {
      typingStore.reset(formattedTask);
    }
  }

  function handleBack(): void {
    navigateTo('home');
  }
</script>

{#if lesson && task}
  <div class="lesson-view">
    <!-- Header -->
    <div class="lesson-header">
      <button class="back-btn" onclick={handleBack}>
        ← Back
      </button>
      <div class="lesson-info">
        <h1 class="lesson-name">{lesson.name}</h1>
        <span class="task-progress">
          Task {taskIndex + 1} of {lesson.tasks.length}
        </span>
      </div>
      <div class="task-nav">
        <button
          class="nav-btn"
          disabled={taskIndex === 0}
          onclick={() => previousTask()}
        >
          ← Prev
        </button>
        <button
          class="nav-btn"
          disabled={taskIndex === lesson.tasks.length - 1}
          onclick={() => nextTask()}
        >
          Next →
        </button>
      </div>
    </div>

    <!-- Task indicator dots -->
    <div class="task-dots">
      {#each lesson.tasks as t, i}
        <button
          class="dot"
          class:current={i === taskIndex}
          class:completed={i < taskIndex}
          onclick={() => currentTaskIndex.set(i)}
          aria-label="Go to task {i + 1}"
        ></button>
      {/each}
    </div>

    <!-- Code options (only for code lessons) -->
    {#if task?.language}
      <div class="code-options">
        <AutoFormatToggle enabled={autoFormat} onChange={(v) => autoFormat = v} />
        <CodeThemeSelector value={codeTheme} onChange={(t) => codeTheme = t} />
      </div>
    {/if}

    <!-- Main content -->
    {#if showResults && lastResult}
      <div class="results-panel">
        <div class="results-header">
          {#if lastResult.passed}
            <h2 class="result-title success">Great job!</h2>
          {:else}
            <h2 class="result-title retry">Keep practicing!</h2>
          {/if}
        </div>

        <div class="results-stats">
          <div class="result-stat">
            <span class="stat-value">{lastResult.wpm}</span>
            <span class="stat-label">WPM</span>
          </div>
          <div class="result-stat">
            <span class="stat-value">{Math.round(lastResult.accuracy * 100)}%</span>
            <span class="stat-label">Accuracy</span>
          </div>
          <div class="result-stat">
            <span class="stat-value">{lastResult.errors.length}</span>
            <span class="stat-label">Errors</span>
          </div>
          <div class="result-stat">
            <span class="stat-value">{(lastResult.duration / 1000).toFixed(1)}s</span>
            <span class="stat-label">Time</span>
          </div>
        </div>

        {#if lastResult.errors.length > 0}
          <div class="error-summary">
            <h3>Problem Keys</h3>
            <div class="error-keys">
              {#each [...new Set(lastResult.errors.map(e => e.expected))] as key}
                <span class="error-key">{key === ' ' ? '␣' : key}</span>
              {/each}
            </div>
          </div>
        {/if}

        <div class="result-actions">
          <button class="action-btn secondary" onclick={handleRetry}>
            Try Again
          </button>
          {#if lastResult.passed && taskIndex < lesson.tasks.length - 1}
            <button class="action-btn primary" onclick={handleNextTask}>
              Next Task →
            </button>
          {:else if taskIndex === lesson.tasks.length - 1 && lastResult.passed}
            <button class="action-btn primary" onclick={handleBack}>
              Finish Lesson ✓
            </button>
          {/if}
        </div>

        <!-- Detailed Analytics -->
        {#if lastKeystrokes.length > 0}
          <TypingAnalytics keystrokes={lastKeystrokes} targetText={lastTargetText} />
        {/if}
      </div>
    {:else if formattedTask}
      <TypingArea task={formattedTask} {codeTheme} onComplete={handleComplete} />
    {/if}

    <!-- Keyboard hints (optional feature) -->
    <div class="hints">
      <span class="hint"><kbd>Esc</kbd> Pause</span>
      <span class="hint"><kbd>Backspace</kbd> Fix errors</span>
    </div>
  </div>
{:else}
  <div class="no-lesson">
    <p>No lesson selected</p>
    <button class="back-btn" onclick={handleBack}>Go back</button>
  </div>
{/if}

<style>
  .lesson-view {
    @apply flex flex-col h-full max-w-3xl mx-auto px-4;
  }

  .lesson-header {
    @apply flex items-center justify-between py-3 mb-3;
  }

  .back-btn {
    @apply px-3 py-1.5 text-sm;
    @apply transition-colors;
    color: var(--text-secondary);
  }

  .back-btn:hover {
    color: var(--text-primary);
  }

  .lesson-info {
    @apply text-center;
  }

  .lesson-name {
    @apply text-lg font-medium;
    color: var(--text-primary);
  }

  .task-progress {
    @apply text-xs;
    color: var(--text-muted);
  }

  .task-nav {
    @apply flex gap-1.5;
  }

  .nav-btn {
    @apply px-3 py-1.5 text-sm rounded;
    @apply transition-colors;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .nav-btn:hover:not(:disabled) {
    background-color: #404245;
    color: var(--text-primary);
  }

  .task-dots {
    @apply flex justify-center gap-1.5 mb-5;
  }

  .dot {
    @apply w-2 h-2 rounded-full;
    @apply transition-all duration-200;
    background-color: var(--bg-tertiary);
  }

  .dot.current {
    background-color: var(--accent);
    transform: scale(1.25);
  }

  .dot.completed {
    background-color: var(--success);
  }

  .code-options {
    @apply flex justify-end items-center gap-2 mb-3;
  }

  .results-panel {
    @apply rounded-lg p-6 text-center;
    background-color: var(--bg-secondary);
  }

  .result-title {
    @apply text-xl font-medium mb-5;
  }

  .result-title.success {
    color: var(--success);
  }

  .result-title.retry {
    color: var(--accent);
  }

  .results-stats {
    @apply flex justify-center gap-6 mb-6;
  }

  .result-stat {
    @apply flex flex-col;
  }

  .result-stat .stat-value {
    @apply text-2xl font-medium;
    color: var(--accent);
  }

  .result-stat .stat-label {
    @apply text-xs;
    color: var(--text-muted);
  }

  .error-summary {
    @apply mb-6;
  }

  .error-summary h3 {
    @apply text-xs mb-2;
    color: var(--text-muted);
  }

  .error-keys {
    @apply flex justify-center gap-1.5;
  }

  .error-key {
    @apply px-2 py-1 rounded;
    @apply font-mono text-sm;
    background-color: rgba(202, 71, 84, 0.15);
    color: var(--error);
  }

  .result-actions {
    @apply flex justify-center gap-3;
  }

  .action-btn {
    @apply px-5 py-2 rounded text-sm;
    @apply transition-all duration-200;
  }

  .action-btn.primary {
    background-color: var(--accent);
    color: var(--bg-primary);
  }

  .action-btn.primary:hover {
    background-color: var(--accent-hover);
  }

  .action-btn.secondary {
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .action-btn.secondary:hover {
    background-color: #404245;
    color: var(--text-primary);
  }

  .hints {
    @apply flex justify-center gap-5 mt-auto py-3;
    @apply text-xs;
    color: var(--text-muted);
  }

  .hint {
    @apply flex items-center gap-1.5;
  }

  .hint kbd {
    @apply px-1.5 py-0.5 rounded text-xs;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .no-lesson {
    @apply flex flex-col items-center justify-center h-full gap-3;
    color: var(--text-secondary);
  }
</style>
