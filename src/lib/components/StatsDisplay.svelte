<script lang="ts">
  import { userStats, lessonProgress } from '../stores/app';
  import { lessons } from '../data/lessons';
  import { activityData } from '../stores/activity';
  import ActivityHeatmap from './analytics/ActivityHeatmap.svelte';

  // Format time from milliseconds
  function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  // Get top problem keys
  function getTopProblemKeys(stats: typeof $userStats, limit = 5): [string, number][] {
    return [...stats.problemKeys.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }

  // Calculate overall progress
  function getOverallProgress(): { completed: number; total: number } {
    let completed = 0;
    let total = 0;

    lessons.forEach((lesson) => {
      total += lesson.tasks.length;
      const progress = $lessonProgress.get(lesson.id);
      if (progress) {
        completed += progress.completedTasks;
      }
    });

    return { completed, total };
  }

  const stats = $derived($userStats);
  const progress = $derived(getOverallProgress());
  const problemKeys = $derived(getTopProblemKeys(stats));
</script>

<div class="stats-display">
  <h2 class="stats-title">Your Statistics</h2>

  <!-- Main stats grid -->
  <div class="stats-grid">
    <div class="stat-card primary">
      <div class="stat-icon">⚡</div>
      <div class="stat-content">
        <span class="stat-value">{Math.round(stats.averageWpm)}</span>
        <span class="stat-label">Average WPM</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🎯</div>
      <div class="stat-content">
        <span class="stat-value">{Math.round(stats.averageAccuracy * 100)}%</span>
        <span class="stat-label">Accuracy</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🔬</div>
      <div class="stat-content">
        <span class="stat-value">{Math.round(stats.averageTrueAccuracy * 100)}%</span>
        <span class="stat-label">True Accuracy</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">⏱️</div>
      <div class="stat-content">
        <span class="stat-value">{formatTime(stats.totalPracticeTime)}</span>
        <span class="stat-label">Practice Time</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">📝</div>
      <div class="stat-content">
        <span class="stat-value">{stats.totalWordsTyped.toLocaleString()}</span>
        <span class="stat-label">Words Typed</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">⌨️</div>
      <div class="stat-content">
        <span class="stat-value">{stats.totalKeystrokes.toLocaleString()}</span>
        <span class="stat-label">Total Keystrokes</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">⬅️</div>
      <div class="stat-content">
        <span class="stat-value">{stats.totalBackspaces.toLocaleString()}</span>
        <span class="stat-label">Backspaces</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🔥</div>
      <div class="stat-content">
        <span class="stat-value">{stats.currentStreak}</span>
        <span class="stat-label">Day Streak</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">🏆</div>
      <div class="stat-content">
        <span class="stat-value">{stats.lessonsCompleted}</span>
        <span class="stat-label">Lessons Done</span>
      </div>
    </div>
  </div>

  <!-- Overall progress -->
  <div class="progress-section">
    <h3 class="section-title">Overall Progress</h3>
    <div class="overall-progress">
      <div class="progress-bar">
        <div
          class="progress-fill"
          style="width: {progress.total > 0 ? (progress.completed / progress.total) * 100 : 0}%"
        ></div>
      </div>
      <span class="progress-text">
        {progress.completed} / {progress.total} tasks completed
      </span>
    </div>
  </div>

  <!-- Problem keys -->
  {#if problemKeys.length > 0}
    <div class="problem-keys-section">
      <h3 class="section-title">Keys to Practice</h3>
      <p class="section-subtitle">These keys need more attention</p>
      <div class="problem-keys">
        {#each problemKeys as [key, count]}
          <div class="problem-key">
            <span class="key-char">{key === ' ' ? 'Space' : key}</span>
            <span class="error-count">{count} errors</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Activity heatmap -->
  <div class="recent-section">
    <h3 class="section-title">Recent Sessions</h3>
    {#if $activityData.length > 0}
      <ActivityHeatmap data={$activityData} />
    {:else}
      <p class="empty-message">Start practicing to see your history!</p>
    {/if}
  </div>
</div>

<style>
  .stats-display {
    @apply w-full mx-auto;
    max-width: 1400px;
  }

  .stats-title {
    @apply text-xl font-medium mb-5;
    color: var(--text-primary);
  }

  .stats-grid {
    @apply grid gap-3 mb-6;
    /* Use auto-fill to wrap cards and ensure all are visible */
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  /* On medium screens, show 4-5 cards per row */
  @media (min-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    }
  }

  /* On larger screens, show all 9 cards in a row */
  @media (min-width: 1400px) {
    .stats-grid {
      grid-template-columns: repeat(9, 1fr);
    }
  }

  .stat-card {
    @apply rounded-lg p-4;
    @apply flex items-center gap-3;
    background-color: var(--bg-secondary);
  }

  .stat-card.primary {
    background-color: rgba(99, 102, 241, 0.1);
  }

  .stat-icon {
    @apply text-2xl opacity-70;
  }

  .stat-content {
    @apply flex flex-col;
  }

  .stat-value {
    @apply text-xl font-medium;
    color: #6366f1;
  }

  .stat-label {
    @apply text-xs;
    color: var(--text-muted);
  }

  .section-title {
    @apply text-sm font-medium mb-2 uppercase tracking-wider;
    color: var(--text-secondary);
  }

  .section-subtitle {
    @apply text-xs mb-3;
    color: var(--text-muted);
  }

  .progress-section {
    @apply mb-6;
  }

  .overall-progress {
    @apply flex items-center gap-3;
  }

  .progress-bar {
    @apply flex-1 h-1.5 rounded-full overflow-hidden;
    background-color: var(--bg-tertiary);
  }

  .progress-fill {
    @apply h-full;
    @apply transition-all duration-500;
    background-color: #6366f1;
  }

  .progress-text {
    @apply text-xs whitespace-nowrap;
    color: var(--text-muted);
  }

  .problem-keys-section {
    @apply mb-6;
  }

  .problem-keys {
    @apply flex flex-wrap gap-2;
  }

  .problem-key {
    @apply flex items-center gap-1.5 px-3 py-1.5;
    @apply rounded;
    background-color: rgba(202, 71, 84, 0.15);
  }

  .key-char {
    @apply text-sm font-mono font-medium;
    color: var(--error);
  }

  .error-count {
    @apply text-xs;
    color: var(--error);
    opacity: 0.7;
  }

  .recent-section {
    @apply rounded-lg p-5;
    background-color: var(--bg-secondary);
  }

  .last-practice {
    @apply text-sm;
    color: var(--text-secondary);
  }

  .empty-message {
    @apply text-sm italic;
    color: var(--text-muted);
  }
</style>
