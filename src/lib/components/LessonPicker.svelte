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
  import { i18n, type TranslationKey } from '../i18n';
  import type { Lesson, LessonCategory, Difficulty, LessonProgress } from '../types';

  interface Props {
    onSelect?: (lesson: Lesson) => void;
  }

  let { onSelect }: Props = $props();

  let selectedCategory = $state<LessonCategory | 'all'>('home_row');
  let selectedDifficulty = $state<Difficulty | 'all'>('all');
  let progressMap = $state<Map<string, LessonProgress>>(new Map());
  let currentMode = $state<'normal' | 'coder'>('normal');
  let tr = $state<(key: TranslationKey, params?: Record<string, string>) => string>((key) => key);

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
    const unsubI18n = i18n.subscribe((fn) => {
      tr = fn;
    });
    return () => {
      unsubProgress();
      unsubMode();
      unsubCategory();
      unsubDifficulty();
      unsubI18n();
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

  const categoryI18nKeys: Record<LessonCategory | 'all', TranslationKey> = {
    'all': 'lessons.all',
    'home_row': 'lessons.homeRow',
    'top_row': 'lessons.topRow',
    'bottom_row': 'lessons.bottomRow',
    'numbers': 'lessons.numbers',
    'symbols': 'lessons.symbols',
    'words': 'lessons.words',
    'sentences': 'lessons.sentences',
    'code': 'lessons.code',
    'commands': 'lessons.commands',
    'shortcuts': 'lessons.shortcuts',
    'custom': 'lessons.all',
  };

  const allCategoryValues: (LessonCategory | 'all')[] = [
    'all', 'home_row', 'top_row', 'bottom_row', 'numbers', 'symbols', 'words', 'sentences', 'code', 'commands', 'shortcuts',
  ];

  // Filter categories based on typing mode
  const categories = $derived(
    currentMode === 'coder'
      ? allCategoryValues
      : allCategoryValues.filter(cat => cat === 'all' || !normalHiddenCategories.includes(cat as LessonCategory))
  );

  const difficultyI18nKeys: Record<Difficulty | 'all', TranslationKey> = {
    'all': 'lessons.all',
    'beginner': 'lessons.beginner',
    'intermediate': 'lessons.intermediate',
    'advanced': 'lessons.advanced',
    'expert': 'lessons.expert',
  };

  const difficultyColors: Record<Difficulty | 'all', string> = {
    'all': 'bg-slate-600',
    'beginner': 'bg-green-600',
    'intermediate': 'bg-yellow-600',
    'advanced': 'bg-orange-600',
    'expert': 'bg-red-600',
  };

  const difficultyValues: (Difficulty | 'all')[] = ['all', 'beginner', 'intermediate', 'advanced', 'expert'];

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

  // Keyboard navigation state
  let focusedCardIndex = $state(-1);
  let usingKeyboard = $state(false);
  // 'category' or 'difficulty' — which filter row Left/Right controls
  let filterFocus = $state<'category' | 'difficulty'>('category');

  // Grid columns for arrow navigation (matches CSS: 1 on sm, 2 on md, 3 on lg)
  // We approximate with 3 since the grid is the primary layout
  const GRID_COLS = 3;

  function handleKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Left/Right to navigate filter tabs
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;

      if (filterFocus === 'category') {
        const currentIndex = categories.indexOf(selectedCategory);
        const nextIndex = (currentIndex + direction + categories.length) % categories.length;
        setCategory(categories[nextIndex]);
        // Reset card focus since filtered lessons change
        focusedCardIndex = -1;
      } else {
        const currentIndex = difficultyValues.indexOf(selectedDifficulty);
        const nextIndex = (currentIndex + direction + difficultyValues.length) % difficultyValues.length;
        setDifficulty(difficultyValues[nextIndex]);
        focusedCardIndex = -1;
      }
      usingKeyboard = true;
      return;
    }

    // Tab key switches between category and difficulty filter rows
    if (event.key === 'Tab') {
      event.preventDefault();
      filterFocus = filterFocus === 'category' ? 'difficulty' : 'category';
      usingKeyboard = true;
      return;
    }

    // Down arrow moves focus into the lesson card grid
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      usingKeyboard = true;
      if (filteredLessons.length === 0) return;
      if (focusedCardIndex < 0) {
        focusedCardIndex = 0;
      } else {
        const nextIndex = focusedCardIndex + GRID_COLS;
        if (nextIndex < filteredLessons.length) {
          focusedCardIndex = nextIndex;
        }
      }
      return;
    }

    // Up arrow moves focus up in the card grid (or back to filters if at top)
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      usingKeyboard = true;
      if (focusedCardIndex >= GRID_COLS) {
        focusedCardIndex -= GRID_COLS;
      } else {
        // At top row of grid — clear card focus (back to filter area)
        focusedCardIndex = -1;
      }
      return;
    }

    // Enter to select the focused lesson card
    if (event.key === 'Enter' && focusedCardIndex >= 0 && focusedCardIndex < filteredLessons.length) {
      event.preventDefault();
      handleSelect(filteredLessons[focusedCardIndex]);
      return;
    }
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

<svelte:window onkeydown={handleKeyDown} />

<div class="lesson-picker">
  <!-- Filters -->
  <div class="filters">
    <div class="filter-group" class:filter-focused={usingKeyboard && focusedCardIndex < 0 && filterFocus === 'category'}>
      <span class="filter-label">{tr('lessons.all')}</span>
      <div class="filter-buttons">
        {#each categories as cat}
          <button
            class="filter-btn"
            class:active={selectedCategory === cat}
            onclick={() => { setCategory(cat); usingKeyboard = false; focusedCardIndex = -1; }}
          >
            {tr(categoryI18nKeys[cat])}
          </button>
        {/each}
      </div>
    </div>

    <div class="filter-group" class:filter-focused={usingKeyboard && focusedCardIndex < 0 && filterFocus === 'difficulty'}>
      <span class="filter-label">{tr('lessons.all')}</span>
      <div class="filter-buttons">
        {#each difficultyValues as diff}
          <button
            class="filter-btn"
            class:active={selectedDifficulty === diff}
            onclick={() => { setDifficulty(diff); usingKeyboard = false; focusedCardIndex = -1; }}
          >
            <span class="difficulty-dot {difficultyColors[diff]}"></span>
            {tr(difficultyI18nKeys[diff])}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Lesson grid -->
  <div class="lesson-grid" class:no-hover={usingKeyboard}>
    {#each filteredLessons as lesson, i}
      {@const progress = getLessonProgress(lesson.id)}
      <button
        class="lesson-card"
        class:focused={usingKeyboard && focusedCardIndex === i}
        onclick={() => { handleSelect(lesson); usingKeyboard = false; }}
        onmouseenter={() => { usingKeyboard = false; focusedCardIndex = -1; }}
      >
        <div class="card-header">
          <span class="category-icon">{getCategoryIcon(lesson.category)}</span>
          <span class="difficulty-badge {getDifficultyColor(lesson.difficulty)}">
            {tr(difficultyI18nKeys[lesson.difficulty])}
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
    @apply pl-2 rounded;
    border-left: 2px solid transparent;
    transition: border-left-color 0.15s ease;
  }

  .filter-group.filter-focused {
    border-left-color: var(--accent);
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

  .lesson-card:hover:not(.no-hover *) {
    background-color: var(--bg-tertiary);
  }

  .lesson-card.focused {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }

  .no-hover .lesson-card:hover:not(.focused) {
    background-color: var(--bg-secondary);
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
