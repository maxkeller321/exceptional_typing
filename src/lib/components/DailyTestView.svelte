<script lang="ts">
  import { onMount } from 'svelte';
  import TypingArea from './TypingArea.svelte';
  import { dailyStore, completedToday, currentStreak, todayResult } from '../stores/daily';
  import { getDailyText, getDateString } from '../utils/dailyTest';
  import type { Task, TaskResult, DailyTestResult } from '../types';

  // State
  let isTesting = $state(false);
  let isCompleted = $state(false);
  let streak = $state(0);
  let result = $state<DailyTestResult | null>(null);
  let bestResult = $state<DailyTestResult | null>(null);

  // Get today's text
  const dailyText = getDailyText();
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  onMount(() => {
    const unsubCompleted = completedToday.subscribe((c) => {
      isCompleted = c;
    });
    const unsubStreak = currentStreak.subscribe((s) => {
      streak = s;
    });
    const unsubResult = todayResult.subscribe((r) => {
      result = r;
    });

    bestResult = dailyStore.getBestResult();

    return () => {
      unsubCompleted();
      unsubStreak();
      unsubResult();
    };
  });

  // Create task for daily test
  const dailyTask: Task = {
    id: `daily-${getDateString()}`,
    instruction: "Type today's passage:",
    targetText: dailyText,
    minAccuracy: 0.9,
  };

  function handleStartTest() {
    if (!isCompleted) {
      isTesting = true;
    }
  }

  function handleComplete(taskResult: TaskResult) {
    isTesting = false;

    // Record the result
    const recorded = dailyStore.recordResult(
      taskResult.wpm,
      taskResult.accuracy,
      taskResult.accuracy, // TODO: true accuracy
      taskResult.duration
    );

    if (recorded) {
      result = recorded;
      isCompleted = true;
      bestResult = dailyStore.getBestResult();
    }
  }

  function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
</script>

<div class="daily-view">
  {#if isTesting}
    <div class="test-session">
      <div class="session-header">
        <button class="back-btn" onclick={() => (isTesting = false)}>
          ← Cancel
        </button>
        <span class="date-badge">{todayDate}</span>
      </div>

      <TypingArea
        task={dailyTask}
        showKeyboard={true}
        onComplete={handleComplete}
      />
    </div>
  {:else}
    <div class="daily-content">
      <!-- Header -->
      <div class="daily-header">
        <div class="date-display">
          <span class="date-label">Today's Challenge</span>
          <h2 class="date-text">{todayDate}</h2>
        </div>

        {#if streak > 0}
          <div class="streak-badge">
            <span class="streak-icon">🔥</span>
            <span class="streak-count">{streak}</span>
            <span class="streak-label">day streak</span>
          </div>
        {/if}
      </div>

      {#if isCompleted && result}
        <!-- Completed State -->
        <div class="completed-panel">
          <div class="completed-header">
            <span class="completed-icon">✓</span>
            <h3>Completed!</h3>
          </div>

          <p class="completed-message">
            You've already completed today's test. Come back tomorrow for a new challenge!
          </p>

          <div class="result-stats">
            <div class="result-stat">
              <span class="stat-value">{result.wpm}</span>
              <span class="stat-label">WPM</span>
            </div>
            <div class="result-stat">
              <span class="stat-value">{Math.round(result.accuracy * 100)}%</span>
              <span class="stat-label">Accuracy</span>
            </div>
            <div class="result-stat">
              <span class="stat-value">{formatTime(result.duration)}</span>
              <span class="stat-label">Time</span>
            </div>
          </div>

          {#if bestResult && bestResult.wpm > result.wpm}
            <div class="best-result">
              <span class="best-label">Personal Best:</span>
              <span class="best-value">{bestResult.wpm} WPM</span>
              <span class="best-date">({bestResult.date})</span>
            </div>
          {:else if bestResult && bestResult.wpm === result.wpm}
            <div class="new-record">
              🎉 New Personal Best!
            </div>
          {/if}
        </div>
      {:else}
        <!-- Ready State -->
        <div class="ready-panel">
          <div class="preview-box">
            <h3>Today's Text Preview</h3>
            <p class="preview-text">
              {dailyText.slice(0, 150)}...
            </p>
            <span class="text-length">{dailyText.length} characters</span>
          </div>

          <div class="rules-box">
            <h4>Rules</h4>
            <ul>
              <li>One attempt per day</li>
              <li>Type the entire passage</li>
              <li>Aim for accuracy over speed</li>
              <li>Your streak continues with daily practice</li>
            </ul>
          </div>

          <button class="start-btn" onclick={handleStartTest}>
            Start Today's Test
          </button>

          {#if bestResult}
            <div class="best-to-beat">
              <span>Best to beat:</span>
              <strong>{bestResult.wpm} WPM</strong>
              <span>at {Math.round(bestResult.accuracy * 100)}% accuracy</span>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Recent History (placeholder) -->
      <div class="history-section">
        <h3>Recent Results</h3>
        <div class="history-placeholder">
          <p>Complete daily tests to see your history here.</p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .daily-view {
    @apply h-full;
  }

  .test-session {
    @apply flex flex-col gap-4;
  }

  .session-header {
    @apply flex items-center gap-4;
  }

  .back-btn {
    @apply px-3 py-1.5 text-sm;
    @apply transition-colors;
    color: var(--text-secondary);
  }

  .back-btn:hover {
    color: var(--text-primary);
  }

  .date-badge {
    @apply px-3 py-1 text-sm rounded;
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
  }

  .daily-content {
    @apply max-w-xl mx-auto;
  }

  .daily-header {
    @apply flex items-center justify-between mb-6;
  }

  .date-display {
    @apply flex flex-col;
  }

  .date-label {
    @apply text-xs uppercase tracking-wider;
    color: var(--text-muted);
  }

  .date-text {
    @apply text-xl font-medium;
    color: var(--text-primary);
  }

  .streak-badge {
    @apply flex items-center gap-1.5 px-3 py-1.5 rounded;
    background-color: rgba(226, 183, 20, 0.15);
  }

  .streak-icon {
    @apply text-base;
  }

  .streak-count {
    @apply text-lg font-medium;
    color: var(--accent);
  }

  .streak-label {
    @apply text-xs;
    color: var(--accent);
    opacity: 0.8;
  }

  .completed-panel {
    @apply rounded-lg p-6;
    @apply text-center mb-6;
    background-color: rgba(126, 198, 153, 0.1);
  }

  .completed-header {
    @apply flex items-center justify-center gap-2 mb-3;
  }

  .completed-icon {
    @apply text-2xl;
    color: var(--success);
  }

  .completed-header h3 {
    @apply text-xl font-medium;
    color: var(--success);
  }

  .completed-message {
    @apply text-sm mb-5;
    color: var(--text-secondary);
  }

  .result-stats {
    @apply flex justify-center gap-6 mb-5;
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

  .best-result {
    @apply flex items-center justify-center gap-2 text-xs;
    color: var(--text-muted);
  }

  .best-value {
    font-weight: 500;
    color: var(--text-primary);
  }

  .new-record {
    @apply text-base font-medium;
    color: var(--accent);
  }

  .ready-panel {
    @apply flex flex-col gap-5;
  }

  .preview-box {
    @apply rounded-lg p-5;
    background-color: var(--bg-secondary);
  }

  .preview-box h3 {
    @apply text-base font-medium mb-3;
    color: var(--text-primary);
  }

  .preview-text {
    @apply font-mono text-sm leading-relaxed mb-2;
    color: var(--text-secondary);
  }

  .text-length {
    @apply text-xs;
    color: var(--text-muted);
  }

  .rules-box {
    @apply rounded-lg p-5;
    background-color: var(--bg-secondary);
  }

  .rules-box h4 {
    @apply text-sm font-medium mb-3;
    color: var(--text-primary);
  }

  .rules-box ul {
    @apply space-y-1.5 text-sm;
    color: var(--text-secondary);
  }

  .rules-box li {
    @apply flex items-center gap-2;
  }

  .rules-box li::before {
    content: '•';
    color: var(--accent);
  }

  .start-btn {
    @apply w-full py-3 rounded text-sm font-medium;
    @apply transition-colors;
    background-color: var(--accent);
    color: var(--bg-primary);
  }

  .start-btn:hover {
    background-color: var(--accent-hover);
  }

  .best-to-beat {
    @apply flex items-center justify-center gap-1.5 text-sm;
    color: var(--text-secondary);
  }

  .best-to-beat strong {
    color: var(--accent);
  }

  .history-section {
    @apply mt-6;
  }

  .history-section h3 {
    @apply text-sm font-medium mb-3 uppercase tracking-wider;
    color: var(--text-secondary);
  }

  .history-placeholder {
    @apply rounded-lg p-6 text-center text-sm;
    background-color: var(--bg-secondary);
    color: var(--text-muted);
  }
</style>
