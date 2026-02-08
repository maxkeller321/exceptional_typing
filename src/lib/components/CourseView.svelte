<script lang="ts">
  import { onMount } from 'svelte';
  import LessonView from './LessonView.svelte';
  import { courseStore, isEnrolled, courseProgressPercent, currentStageId, currentSkippableStageId, allCourseProgress } from '../stores/course';
  import { selectLesson, currentView, navigateTo, lessonProgress } from '../stores/app';
  import { allCourses, getCourseLesson, getCourseStage } from '../data/courses';
  import type { Course, CourseStage, CourseProgress, Lesson, LessonProgress } from '../types';

  // State
  let selectedCourse = $state<Course>(allCourses[0]);
  let enrolled = $state(false);
  let progress = $state(0);
  let currentStage = $state<string | null>(null);
  let selectedStageId = $state<string | null>(null);
  let selectedLessonId = $state<string | null>(null);
  let isInLesson = $state(false);
  let progressMap = $state<Map<string, LessonProgress>>(new Map());
  let courseProgressMap = $state<Map<string, CourseProgress>>(new Map());

  onMount(() => {
    // Subscribe to the selected course from the store
    const unsubSelectedCourse = courseStore.selectedCourse.subscribe((c) => {
      selectedCourse = c;
      // Reset selected stage when course changes
      selectedStageId = null;
    });
    const unsubEnrolled = isEnrolled.subscribe((e) => {
      enrolled = e;
    });
    const unsubProgress = courseProgressPercent.subscribe((p) => {
      progress = p;
    });
    const unsubStage = currentStageId.subscribe((s) => {
      currentStage = s;
      if (!selectedStageId && s) {
        selectedStageId = s;
      }
    });
    const unsubLessonProgress = lessonProgress.subscribe((p) => {
      progressMap = p;
    });
    const unsubSkippable = currentSkippableStageId.subscribe((id) => {
      skippableStageId = id;
    });
    const unsubCourseProgress = allCourseProgress.subscribe((p) => {
      // Create a new Map so Svelte's $state reactivity detects the change
      // (the store mutates the Map in place, so reference stays the same)
      courseProgressMap = new Map(p);
    });

    return () => {
      unsubSelectedCourse();
      unsubEnrolled();
      unsubProgress();
      unsubStage();
      unsubLessonProgress();
      unsubSkippable();
      unsubCourseProgress();
    };
  });

  function handleSelectCourse(courseId: string) {
    courseStore.selectCourse(courseId);
    selectedStageId = null;
  }

  function handleEnroll() {
    courseStore.enroll();
    selectedStageId = selectedCourse.stages[0].id;
  }

  function handleSelectStage(stageId: string) {
    if (isStageUnlockedReactive(stageId)) {
      selectedStageId = stageId;
    }
  }

  function handleSkipToStage(stageId: string, event: MouseEvent) {
    event.stopPropagation();
    courseStore.skipToStage(stageId);
    selectedStageId = stageId;
  }

  function handleSkipCurrentStage(stageId: string, event: MouseEvent) {
    event.stopPropagation();
    // Skip the current stage and move to the next one
    courseStore.skipCurrentStage();
    // Update selected stage to the new current stage
    const progress = courseStore.getProgress();
    if (progress?.currentStageId) {
      selectedStageId = progress.currentStageId;
    }
  }

  function handleStartLesson(lessonId: string) {
    const lesson = getCourseLesson(lessonId);
    if (lesson) {
      selectLesson(lesson, 'course');
    }
  }

  // Reactive stage status computation — reads from $state courseProgressMap
  // so Svelte re-renders when progress changes (e.g. after skip)
  function isStageUnlockedReactive(stageId: string): boolean {
    const progress = courseProgressMap.get(selectedCourse.id);
    if (!progress) return false;

    const stage = selectedCourse.stages.find(s => s.id === stageId);
    if (!stage) return false;

    // First stage is always unlocked if enrolled
    if (!stage.unlockCriteria.previousStageComplete) return true;

    // Check if this stage was skipped to (explicitly unlocked)
    if (progress.skippedStages?.includes(stageId)) return true;

    const stageIndex = selectedCourse.stages.findIndex(s => s.id === stageId);
    if (stageIndex === 0) return true;

    const prevStage = selectedCourse.stages[stageIndex - 1];
    return (
      progress.completedStages.includes(prevStage.id) ||
      progress.skippedStages?.includes(prevStage.id) ||
      progress.currentStageId === prevStage.id
    );
  }

  function getStageStatus(stageId: string): 'locked' | 'current' | 'completed' | 'skipped' {
    const progress = courseProgressMap.get(selectedCourse.id);
    if (!progress) return 'locked';

    if (progress.completedStages.includes(stageId)) return 'completed';
    if (progress.skippedStages?.includes(stageId) && !progress.completedStages.includes(stageId)) {
      return 'skipped';
    }
    if (!isStageUnlockedReactive(stageId)) return 'locked';
    return 'current';
  }

  let selectedStage = $derived.by(() => {
    if (!selectedStageId) return null;
    return getCourseStage(selectedStageId) || null;
  });

  let stageLessons = $derived.by(() => {
    if (!selectedStage) return [];
    return selectedStage.lessons
      .map((id) => getCourseLesson(id))
      .filter((l): l is Lesson => l !== undefined);
  });

  // Check if a lesson is completed (all tasks passed)
  function isLessonCompleted(lessonId: string, totalTasks: number): boolean {
    const progress = progressMap.get(lessonId);
    if (!progress) return false;
    return progress.completedTasks >= totalTasks;
  }

  // Get lesson progress for display
  function getLessonProgress(lessonId: string): { completed: number; total: number } | null {
    const progress = progressMap.get(lessonId);
    if (!progress) return null;
    return { completed: progress.completedTasks, total: progress.totalTasks };
  }

  // Find the current skippable stage (the one the user is working on, to skip it)
  // Use the reactive derived store instead of calling the method directly
  let skippableStageId = $state<string | null>(null);

  // Two-panel keyboard navigation state
  let focusPanel = $state<'stages' | 'lessons'>('stages');
  let focusedStageIndex = $state(0);
  let focusedLessonIndex = $state(0);

  // Find the index of the selected stage
  function getSelectedStageIndex(): number {
    if (!selectedStageId) return 0;
    const idx = selectedCourse.stages.findIndex(s => s.id === selectedStageId);
    return idx >= 0 ? idx : 0;
  }

  function handleKeyDown(event: KeyboardEvent): void {
    // Don't capture if in lesson view
    if (isInLesson) return;

    if (!enrolled) {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleEnroll();
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (focusPanel === 'stages') {
        // Navigate up through stages (skip locked stages)
        let newIndex = focusedStageIndex - 1;
        while (newIndex >= 0) {
          const stage = selectedCourse.stages[newIndex];
          const status = getStageStatus(stage.id);
          if (status !== 'locked') {
            focusedStageIndex = newIndex;
            selectedStageId = stage.id;
            break;
          }
          newIndex--;
        }
      } else {
        // Navigate up through lessons
        if (focusedLessonIndex > 0) {
          focusedLessonIndex--;
        }
      }
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (focusPanel === 'stages') {
        // Navigate down through stages (skip locked stages)
        let newIndex = focusedStageIndex + 1;
        while (newIndex < selectedCourse.stages.length) {
          const stage = selectedCourse.stages[newIndex];
          const status = getStageStatus(stage.id);
          if (status !== 'locked') {
            focusedStageIndex = newIndex;
            selectedStageId = stage.id;
            break;
          }
          newIndex++;
        }
      } else {
        // Navigate down through lessons
        if (focusedLessonIndex < stageLessons.length - 1) {
          focusedLessonIndex++;
        }
      }
    } else if (event.key === 'ArrowRight' || (event.key === 'Enter' && focusPanel === 'stages')) {
      event.preventDefault();
      // Move focus from stages to lessons panel
      if (focusPanel === 'stages' && selectedStageId && stageLessons.length > 0) {
        const status = getStageStatus(selectedCourse.stages[focusedStageIndex].id);
        if (status !== 'locked') {
          focusPanel = 'lessons';
          focusedLessonIndex = 0;
        }
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      if (focusPanel === 'lessons') {
        // Move focus back to stages panel
        focusPanel = 'stages';
      }
    } else if (event.key === 'Enter' && focusPanel === 'lessons') {
      event.preventDefault();
      if (focusedLessonIndex >= 0 && focusedLessonIndex < stageLessons.length) {
        handleStartLesson(stageLessons[focusedLessonIndex].id);
      }
    } else if (event.key === 'Backspace') {
      event.preventDefault();
      navigateTo('home');
    }
  }

  // Sync focusedStageIndex when selectedStageId changes externally
  $effect(() => {
    if (selectedStageId) {
      const idx = selectedCourse.stages.findIndex(s => s.id === selectedStageId);
      if (idx >= 0) {
        focusedStageIndex = idx;
      }
    }
  });

  // Reset focused lesson when stage changes
  $effect(() => {
    if (selectedStageId && focusPanel === 'lessons') {
      focusedLessonIndex = 0;
    }
  });
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="course-view">
  <!-- Course Selector Tabs -->
  <div class="course-tabs">
    {#each allCourses as course}
      {@const isSelected = selectedCourse.id === course.id}
      {@const courseEnrolled = courseProgressMap.has(course.id)}
      <button
        class="course-tab"
        class:selected={isSelected}
        onclick={() => handleSelectCourse(course.id)}
      >
        <span class="tab-icon">{course.id === 'ten-finger' ? '⌨️' : course.id === 'claude-code' ? '🤖' : course.id === 'sql-mastery' ? '🗄️' : '🖥️'}</span>
        <span class="tab-name">{course.name}</span>
        {#if courseEnrolled}
          <span class="tab-badge enrolled">Started</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if !enrolled}
    <!-- Enrollment Screen -->
    <div class="enroll-panel">
      <div class="enroll-content">
        <div class="enroll-icon">{selectedCourse.id === 'ten-finger' ? '⌨️' : selectedCourse.id === 'claude-code' ? '🤖' : selectedCourse.id === 'sql-mastery' ? '🗄️' : '💻'}</div>
        <h2>{selectedCourse.name}</h2>
        <p class="enroll-description">
          {selectedCourse.description}
        </p>

        <div class="course-highlights">
          <div class="highlight">
            <span class="highlight-number">{selectedCourse.stages.length}</span>
            <span class="highlight-label">Stages</span>
          </div>
          <div class="highlight">
            <span class="highlight-number">{selectedCourse.stages.reduce((sum, s) => sum + s.lessons.length, 0)}</span>
            <span class="highlight-label">Lessons</span>
          </div>
          <div class="highlight">
            <span class="highlight-number">{selectedCourse.stages.reduce((sum, s) => sum + s.lessons.length * 4, 0)}+</span>
            <span class="highlight-label">Exercises</span>
          </div>
        </div>

        <button class="enroll-btn" onclick={handleEnroll}>
          Start Learning
        </button>
      </div>
    </div>
  {:else}
    <!-- Course Content -->
    <div class="course-content">
      <!-- Progress Header -->
      <div class="course-header">
        <div class="progress-info">
          <h2>Your Progress</h2>
          <div class="progress-bar-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: {progress}%"></div>
            </div>
            <span class="progress-text">{progress}% Complete</span>
          </div>
        </div>
      </div>

      <div class="course-layout">
        <!-- Stage List -->
        <div class="stages-panel">
          <h3>Stages</h3>
          <div class="stages-list">
            {#each selectedCourse.stages as stage, index}
              {@const status = getStageStatus(stage.id)}
              <div class="stage-row">
                <button
                  class="stage-item"
                  class:locked={status === 'locked'}
                  class:completed={status === 'completed'}
                  class:skipped={status === 'skipped'}
                  class:selected={selectedStageId === stage.id}
                  class:focused={focusPanel === 'stages' && focusedStageIndex === index}
                  onclick={() => handleSelectStage(stage.id)}
                  disabled={status === 'locked'}
                >
                  <div class="stage-number">
                    {#if status === 'completed'}
                      ✓
                    {:else if status === 'skipped'}
                      ⏭
                    {:else if status === 'locked'}
                      🔒
                    {:else}
                      {index + 1}
                    {/if}
                  </div>
                  <div class="stage-info">
                    <span class="stage-name">{stage.name}</span>
                    <span class="stage-lessons">
                      {stage.lessons.length} lessons
                      {#if status === 'skipped'}
                        <span class="skipped-badge">skipped</span>
                      {/if}
                    </span>
                  </div>
                </button>
                {#if stage.id === skippableStageId}
                  <button
                    class="skip-btn"
                    onclick={(e) => handleSkipCurrentStage(stage.id, e)}
                    title="Skip this stage"
                  >
                    Skip
                  </button>
                {/if}
              </div>
            {/each}
          </div>
        </div>

        <!-- Stage Details -->
        <div class="stage-details">
          {#if selectedStage}
            <div class="stage-header">
              <h3>{selectedStage.name}</h3>
              <p class="stage-description">{selectedStage.description}</p>
            </div>

            <div class="lessons-list">
              {#each stageLessons as lesson, index}
                {@const completed = isLessonCompleted(lesson.id, lesson.tasks.length)}
                {@const lessonProg = getLessonProgress(lesson.id)}
                <div class="lesson-card" class:completed class:focused={focusPanel === 'lessons' && focusedLessonIndex === index}>
                  <div class="lesson-number" class:completed>
                    {#if completed}
                      ✓
                    {:else}
                      {index + 1}
                    {/if}
                  </div>
                  <div class="lesson-info">
                    <span class="lesson-name">{lesson.name}</span>
                    <span class="lesson-description">{lesson.description}</span>
                    <span class="lesson-tasks">
                      {lesson.tasks.length} tasks
                      {#if lessonProg && lessonProg.completed > 0}
                        <span class="lesson-progress">({lessonProg.completed}/{lessonProg.total})</span>
                      {/if}
                    </span>
                  </div>
                  <button
                    class="lesson-btn"
                    class:completed
                    onclick={() => handleStartLesson(lesson.id)}
                  >
                    {completed ? 'Review' : 'Start'}
                  </button>
                </div>
              {/each}
            </div>
          {:else}
            <div class="no-stage">
              <p>Select a stage to view lessons</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .course-view {
    @apply h-full;
  }

  /* Course Tabs */
  .course-tabs {
    @apply flex gap-2 mb-5 overflow-x-auto pb-2;
  }

  .course-tab {
    @apply flex items-center gap-2 px-4 py-2.5 rounded-lg;
    @apply text-sm font-medium whitespace-nowrap;
    @apply transition-all duration-200;
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
    border: 2px solid transparent;
  }

  .course-tab:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .course-tab.selected {
    background-color: rgba(226, 183, 20, 0.1);
    border-color: var(--accent);
    color: var(--text-primary);
  }

  .tab-icon {
    @apply text-lg;
  }

  .tab-name {
    @apply hidden sm:inline;
  }

  .tab-badge {
    @apply px-1.5 py-0.5 rounded text-[10px] uppercase font-medium;
  }

  .tab-badge.enrolled {
    background-color: var(--success);
    color: var(--bg-primary);
  }

  /* Enrollment Screen */
  .enroll-panel {
    @apply flex items-center justify-center min-h-[60vh];
  }

  .enroll-content {
    @apply text-center max-w-lg;
  }

  .enroll-icon {
    @apply text-6xl mb-4;
  }

  .enroll-content h2 {
    @apply text-2xl font-medium mb-4;
    color: var(--text-primary);
  }

  .enroll-description {
    @apply mb-8 leading-relaxed text-sm;
    color: var(--text-secondary);
  }

  .course-highlights {
    @apply flex justify-center gap-8 mb-8;
  }

  .highlight {
    @apply flex flex-col items-center;
  }

  .highlight-number {
    @apply text-2xl font-medium;
    color: var(--accent);
  }

  .highlight-label {
    @apply text-xs;
    color: var(--text-muted);
  }

  .enroll-btn {
    @apply px-6 py-3 rounded text-sm;
    @apply transition-colors;
    background-color: var(--accent);
    color: var(--bg-primary);
  }

  .enroll-btn:hover {
    background-color: var(--accent-hover);
  }

  /* Course Content */
  .course-content {
    @apply flex flex-col gap-5;
  }

  .course-header {
    @apply rounded-lg p-5;
    background-color: var(--bg-secondary);
  }

  .progress-info h2 {
    @apply text-sm font-medium mb-3;
    color: var(--text-primary);
  }

  .progress-bar-container {
    @apply flex items-center gap-4;
  }

  .progress-bar {
    @apply flex-1 h-1.5 rounded-full overflow-hidden;
    background-color: var(--bg-tertiary);
  }

  .progress-fill {
    @apply h-full transition-all duration-300;
    background-color: var(--accent);
  }

  .progress-text {
    @apply text-xs tabular-nums;
    color: var(--text-muted);
  }

  .course-layout {
    @apply grid grid-cols-1 lg:grid-cols-3 gap-5;
  }

  /* Stages Panel */
  .stages-panel {
    @apply rounded-lg p-4;
    background-color: var(--bg-secondary);
  }

  .stages-panel h3 {
    @apply text-sm font-medium mb-4 px-2;
    color: var(--text-primary);
  }

  .stages-list {
    @apply flex flex-col gap-1;
  }

  .stage-row {
    @apply flex items-center gap-2;
    min-height: 52px; /* Ensure consistent row height */
  }

  .stage-item {
    @apply flex items-center gap-3 flex-1 px-3 py-2 rounded;
    @apply text-left transition-colors;
    min-height: 44px; /* Match minimum height for consistency */
  }

  .stage-item:hover:not(.locked) {
    background-color: var(--bg-tertiary);
  }

  .stage-item.selected {
    background-color: rgba(226, 183, 20, 0.1);
    border-left: 2px solid var(--accent);
  }

  .stage-item.focused {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }

  .stage-item.locked {
    @apply opacity-50 cursor-not-allowed;
  }

  .stage-item.skipped {
    @apply opacity-75;
  }

  .stage-item.skipped .stage-number {
    background-color: var(--text-muted);
    color: var(--bg-primary);
  }

  .stage-item.completed .stage-number {
    background-color: var(--success);
    color: var(--bg-primary);
  }

  .skipped-badge {
    @apply ml-1 px-1.5 py-0.5 rounded text-[10px] uppercase;
    background-color: var(--text-muted);
    color: var(--bg-primary);
  }

  .skip-btn {
    @apply px-2 py-1 text-xs rounded flex-shrink-0;
    @apply transition-colors;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .skip-btn:hover {
    background-color: var(--accent);
    color: var(--bg-primary);
  }

  .stage-number {
    @apply w-7 h-7 rounded-full flex items-center justify-center;
    @apply text-xs font-medium;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .stage-info {
    @apply flex flex-col;
  }

  .stage-name {
    @apply text-sm;
    color: var(--text-primary);
  }

  .stage-lessons {
    @apply text-xs;
    color: var(--text-muted);
  }

  /* Stage Details */
  .stage-details {
    @apply lg:col-span-2;
    @apply rounded-lg p-5;
    background-color: var(--bg-secondary);
  }

  .stage-header {
    @apply mb-5;
  }

  .stage-header h3 {
    @apply text-lg font-medium mb-2;
    color: var(--text-primary);
  }

  .stage-description {
    @apply text-sm;
    color: var(--text-secondary);
  }

  .lessons-list {
    @apply flex flex-col gap-2;
  }

  .lesson-card {
    @apply flex items-center gap-4 p-4 rounded;
    background-color: var(--bg-tertiary);
  }

  .lesson-number {
    @apply w-7 h-7 rounded-full flex items-center justify-center;
    @apply text-xs font-medium;
    background-color: var(--bg-secondary);
    color: var(--text-secondary);
  }

  .lesson-info {
    @apply flex-1 flex flex-col;
  }

  .lesson-name {
    @apply text-sm;
    color: var(--text-primary);
  }

  .lesson-description {
    @apply text-xs;
    color: var(--text-secondary);
  }

  .lesson-tasks {
    @apply text-xs;
    color: var(--text-muted);
  }

  .lesson-progress {
    @apply ml-1;
    color: var(--accent);
  }

  .lesson-card.focused {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }

  .lesson-card.completed {
    border-left: 2px solid var(--success);
  }

  .lesson-number.completed {
    background-color: var(--success);
    color: var(--bg-primary);
  }

  .lesson-btn.completed {
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .lesson-btn.completed:hover {
    background-color: var(--accent);
    color: var(--bg-primary);
  }

  .lesson-btn {
    @apply px-4 py-1.5 rounded text-sm;
    @apply transition-colors;
    background-color: var(--accent);
    color: var(--bg-primary);
  }

  .lesson-btn:hover {
    background-color: var(--accent-hover);
  }

  .no-stage {
    @apply flex items-center justify-center h-40;
    color: var(--text-muted);
  }
</style>
