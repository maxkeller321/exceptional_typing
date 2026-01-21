<script lang="ts">
  import { onMount } from 'svelte';
  import LessonView from './LessonView.svelte';
  import { courseStore, isEnrolled, courseProgressPercent, currentStageId } from '../stores/course';
  import { selectLesson, currentView, navigateTo } from '../stores/app';
  import { tenFingerCourse, getCourseLesson, getCourseStage } from '../data/courses';
  import type { CourseStage, CourseProgress, Lesson } from '../types';

  // State
  let enrolled = $state(false);
  let progress = $state(0);
  let currentStage = $state<string | null>(null);
  let selectedStageId = $state<string | null>(null);
  let selectedLessonId = $state<string | null>(null);
  let isInLesson = $state(false);

  onMount(() => {
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

    return () => {
      unsubEnrolled();
      unsubProgress();
      unsubStage();
    };
  });

  function handleEnroll() {
    courseStore.enroll();
    selectedStageId = tenFingerCourse.stages[0].id;
  }

  function handleSelectStage(stageId: string) {
    if (courseStore.isStageUnlocked(stageId)) {
      selectedStageId = stageId;
    }
  }

  function handleSkipToStage(stageId: string, event: MouseEvent) {
    event.stopPropagation();
    courseStore.skipToStage(stageId);
    selectedStageId = stageId;
  }

  function handleStartLesson(lessonId: string) {
    const lesson = getCourseLesson(lessonId);
    if (lesson) {
      selectLesson(lesson);
    }
  }

  function getStageStatus(stageId: string): 'locked' | 'current' | 'completed' | 'skipped' {
    if (courseStore.isStageCompleted(stageId)) return 'completed';
    // Check if stage is skipped (unlocked but not completed, with skipped stages before it)
    if (courseStore.isStageSkipped(stageId) && !courseStore.isStageCompleted(stageId)) {
      return 'skipped';
    }
    if (!courseStore.isStageUnlocked(stageId)) return 'locked';
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
</script>

<div class="course-view">
  {#if !enrolled}
    <!-- Enrollment Screen -->
    <div class="enroll-panel">
      <div class="enroll-content">
        <div class="enroll-icon">🎓</div>
        <h2>10 Fingers (touch typing)</h2>
        <p class="enroll-description">
          Master touch typing from the ground up. This comprehensive course will teach you proper finger placement and build your speed step by step.
        </p>

        <div class="course-highlights">
          <div class="highlight">
            <span class="highlight-number">14</span>
            <span class="highlight-label">Stages</span>
          </div>
          <div class="highlight">
            <span class="highlight-number">50+</span>
            <span class="highlight-label">Lessons</span>
          </div>
          <div class="highlight">
            <span class="highlight-number">200+</span>
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
            {#each tenFingerCourse.stages as stage, index}
              {@const status = getStageStatus(stage.id)}
              <div class="stage-row">
                <button
                  class="stage-item"
                  class:locked={status === 'locked'}
                  class:completed={status === 'completed'}
                  class:skipped={status === 'skipped'}
                  class:selected={selectedStageId === stage.id}
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
                {#if status === 'locked'}
                  <button
                    class="skip-btn"
                    onclick={(e) => handleSkipToStage(stage.id, e)}
                    title="Skip to this stage"
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
                <div class="lesson-card">
                  <div class="lesson-number">{index + 1}</div>
                  <div class="lesson-info">
                    <span class="lesson-name">{lesson.name}</span>
                    <span class="lesson-description">{lesson.description}</span>
                    <span class="lesson-tasks">{lesson.tasks.length} tasks</span>
                  </div>
                  <button
                    class="lesson-btn"
                    onclick={() => handleStartLesson(lesson.id)}
                  >
                    Start
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
  }

  .stage-item {
    @apply flex items-center gap-3 flex-1 px-3 py-2 rounded;
    @apply text-left transition-colors;
  }

  .stage-item:hover:not(.locked) {
    background-color: var(--bg-tertiary);
  }

  .stage-item.selected {
    background-color: rgba(226, 183, 20, 0.1);
    border-left: 2px solid var(--accent);
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
    @apply px-2 py-1 text-xs rounded;
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
