<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { allLessons } from '../data/lessons';
  import { selectLesson, lessonProgress } from '../stores/app';
  import {
    typingMode,
    lessonPickerCategory,
    lessonPickerDifficulty,
    settingsStore,
  } from '../stores/settings';
  import type { Lesson, LessonCategory, Difficulty, LessonProgress } from '../types';

  interface Props {
    onSelect?: (lesson: Lesson) => void;
  }

  let { onSelect }: Props = $props();

  let selectedCategory = $state<LessonCategory | 'all'>('home_row');
  let selectedDifficulty = $state<Difficulty | 'all'>('all');
  let progressMap = $state<Map<string, LessonProgress>>(new Map());
  let currentMode = $state<'normal' | 'coder'>('normal');

  onMount(() => {
    const unsubProgress = lessonProgress.subscribe(p => {
      progressMap = p;
    });
    const unsubMode = typingMode.subscribe(m => {
      currentMode = m;
    });
    // Load persisted filter state
    const unsubCategory = lessonPickerCategory.subscribe(c => {
      selectedCategory = c;
    });
    const unsubDifficulty = lessonPickerDifficulty.subscribe(d => {
      selectedDifficulty = d;
    });
    return () => {
      unsubProgress();
      unsubMode();
      unsubCategory();
      unsubDifficulty();
    };
  });

  // Save filter state when changed
  function setCategory(cat: LessonCategory | 'all'): void {
    selectedCategory = cat;
    settingsStore.setLessonPickerCategory(cat);
  }

  function setDifficulty(diff: Difficulty | 'all'): void {
    selectedDifficulty = diff;
    settingsStore.setLessonPickerDifficulty(diff);
  }

  // Categories available based on typing mode
  // Coder mode shows code, commands, and shortcuts categories
  // Normal mode hides code-specific categories
  const coderCategories: LessonCategory[] = ['code', 'commands', 'shortcuts'];
  const normalHiddenCategories: LessonCategory[] = ['code', 'commands', 'shortcuts'];

  const allCategories: { value: LessonCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'home_row', label: 'Home Row' },
    { value: 'top_row', label: 'Top Row' },
    { value: 'bottom_row', label: 'Bottom Row' },
    { value: 'numbers', label: 'Numbers' },
    { value: 'symbols', label: 'Symbols' },
    { value: 'words', label: 'Words' },
    { value: 'sentences', label: 'Sentences' },
    { value: 'code', label: 'Code' },
    { value: 'commands', label: 'Commands' },
    { value: 'shortcuts', label: 'IDE Shortcuts' },
  ];

  // Filter categories based on typing mode
  const categories = $derived(
    currentMode === 'coder'
      ? allCategories
      : allCategories.filter(cat => cat.value === 'all' || !normalHiddenCategories.includes(cat.value as LessonCategory))
  );

  const difficulties: { value: Difficulty | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'All', color: 'bg-slate-600' },
    { value: 'beginner', label: 'Beginner', color: 'bg-green-600' },
    { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-600' },
    { value: 'advanced', label: 'Advanced', color: 'bg-orange-600' },
    { value: 'expert', label: 'Expert', color: 'bg-red-600' },
  ];

  const filteredLessons = $derived(
    allLessons.filter((lesson) => {
      // Filter by mode: hide code/commands in normal mode
      if (currentMode === 'normal' && normalHiddenCategories.includes(lesson.category)) {
        return false;
      }
      const categoryMatch = selectedCategory === 'all' || lesson.category === selectedCategory;
      const difficultyMatch = selectedDifficulty === 'all' || lesson.difficulty === selectedDifficulty;
      return categoryMatch && difficultyMatch;
    })
  );

  function handleSelect(lesson: Lesson): void {
    selectLesson(lesson);
    onSelect?.(lesson);
  }

  function getLessonProgress(lessonId: string): { completed: number; total: number } | null {
    const progress = progressMap.get(lessonId);
    if (!progress) return null;
    return { completed: progress.completedTasks, total: progress.totalTasks };
  }

  function getDifficultyColor(difficulty: Difficulty): string {
    const colors: Record<Difficulty, string> = {
      beginner: 'bg-green-600',
      intermediate: 'bg-yellow-600',
      advanced: 'bg-orange-600',
      expert: 'bg-red-600',
    };
    return colors[difficulty];
  }

  function getCategoryIcon(category: LessonCategory): string {
    const icons: Record<LessonCategory, string> = {
      home_row: '⌨️',
      top_row: '⬆️',
      bottom_row: '⬇️',
      numbers: '🔢',
      symbols: '🔣',
      words: '📝',
      sentences: '📄',
      code: '💻',
      commands: '🐧',
      shortcuts: '⚡',
      custom: '✨',
    };
    return icons[category];
  }
</script>

<div class="lesson-picker">
  <!-- Filters -->
  <div class="filters">
    <div class="filter-group">
      <span class="filter-label">Category</span>
      <div class="filter-buttons">
        {#each categories as cat}
          <button
            class="filter-btn"
            class:active={selectedCategory === cat.value}
            onclick={() => setCategory(cat.value)}
          >
            {cat.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="filter-group">
      <span class="filter-label">Difficulty</span>
      <div class="filter-buttons">
        {#each difficulties as diff}
          <button
            class="filter-btn"
            class:active={selectedDifficulty === diff.value}
            onclick={() => setDifficulty(diff.value)}
          >
            <span class="difficulty-dot {diff.color}"></span>
            {diff.label}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Lesson grid -->
  <div class="lesson-grid">
    {#each filteredLessons as lesson}
      {@const progress = getLessonProgress(lesson.id)}
      <button class="lesson-card" onclick={() => handleSelect(lesson)}>
        <div class="card-header">
          <span class="category-icon">{getCategoryIcon(lesson.category)}</span>
          <span class="difficulty-badge {getDifficultyColor(lesson.difficulty)}">
            {lesson.difficulty}
          </span>
        </div>

        <h3 class="lesson-title">{lesson.name}</h3>
        <p class="lesson-description">{lesson.description}</p>

        <div class="card-footer">
          <span class="task-count">{lesson.tasks.length} tasks</span>
          {#if progress}
            <div class="progress-indicator">
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  style="width: {(progress.completed / progress.total) * 100}%"
                ></div>
              </div>
              <span class="progress-text">{progress.completed}/{progress.total}</span>
            </div>
          {/if}
        </div>
      </button>
    {/each}
  </div>

  {#if filteredLessons.length === 0}
    <div class="empty-state">
      <p>No lessons match your filters</p>
      <button
        class="reset-btn"
        onclick={() => {
          setCategory('all');
          setDifficulty('all');
        }}
      >
        Reset filters
      </button>
    </div>
  {/if}
</div>

<style>
  .lesson-picker {
    @apply w-full;
  }

  .filters {
    @apply mb-6 space-y-3;
  }

  .filter-group {
    @apply flex flex-col gap-1.5;
  }

  .filter-label {
    @apply text-xs uppercase tracking-wider;
    color: var(--text-muted);
  }

  .filter-buttons {
    @apply flex flex-wrap gap-1.5;
  }

  .filter-btn {
    @apply px-3 py-1.5 text-sm rounded;
    @apply transition-colors duration-150;
    @apply flex items-center gap-1.5;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .filter-btn:hover {
    color: var(--text-primary);
  }

  .filter-btn.active {
    background-color: var(--accent);
    color: var(--bg-primary);
  }

  .difficulty-dot {
    @apply w-1.5 h-1.5 rounded-full;
  }

  .lesson-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3;
  }

  .lesson-card {
    @apply rounded-lg p-4 text-left;
    @apply transition-all duration-200;
    @apply flex flex-col;
    background-color: var(--bg-secondary);
  }

  .lesson-card:hover {
    background-color: var(--bg-tertiary);
  }

  .card-header {
    @apply flex justify-between items-center mb-2;
  }

  .category-icon {
    @apply text-xl opacity-70;
  }

  .difficulty-badge {
    @apply px-2 py-0.5 text-xs rounded capitalize;
    opacity: 0.9;
  }

  .lesson-title {
    @apply text-base font-medium mb-1;
    color: var(--text-primary);
  }

  .lesson-description {
    @apply text-sm flex-1;
    color: var(--text-secondary);
  }

  .card-footer {
    @apply mt-3 pt-3 flex items-center justify-between;
    border-top: 1px solid var(--bg-tertiary);
  }

  .task-count {
    @apply text-xs;
    color: var(--text-muted);
  }

  .progress-indicator {
    @apply flex items-center gap-2;
  }

  .progress-bar {
    @apply w-14 h-1 rounded-full overflow-hidden;
    background-color: var(--bg-tertiary);
  }

  .progress-fill {
    @apply h-full transition-all duration-300;
    background-color: var(--success);
  }

  .progress-text {
    @apply text-xs;
    color: var(--text-muted);
  }

  .empty-state {
    @apply text-center py-12;
    color: var(--text-secondary);
  }

  .reset-btn {
    @apply mt-4 px-4 py-2 rounded;
    @apply transition-colors text-sm;
    background-color: var(--accent);
    color: var(--bg-primary);
  }

  .reset-btn:hover {
    background-color: var(--accent-hover);
  }
</style>
