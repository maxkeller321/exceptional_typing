<script lang="ts">
  import { onMount } from 'svelte';
  import { courseStore, allCourseProgress } from '../stores/course';
  import { lessonProgress } from '../stores/app';
  import { allCourses } from '../data/courses';
  import type { Course, CourseProgress, LessonProgress } from '../types';

  let { onSelectCourse }: { onSelectCourse: (courseId: string) => void } = $props();

  let courseProgressMap = $state<Map<string, CourseProgress>>(new Map());
  let progressMap = $state<Map<string, LessonProgress>>(new Map());
  let focusedIndex = $state(-1);
  let usingKeyboard = $state(false);

  onMount(() => {
    const unsubCourseProgress = allCourseProgress.subscribe((p) => {
      courseProgressMap = new Map(p);
    });
    const unsubLessonProgress = lessonProgress.subscribe((p) => {
      progressMap = p;
    });

    return () => {
      unsubCourseProgress();
      unsubLessonProgress();
    };
  });

  function handleSelectCourse(course: Course) {
    // Clear keyboard focus when selecting via mouse
    focusedIndex = -1;
    usingKeyboard = false;
    courseStore.selectCourse(course.id);
    onSelectCourse(course.id);
  }

  function handleKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      usingKeyboard = true;
      focusedIndex = focusedIndex < allCourses.length - 1 ? focusedIndex + 1 : 0;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      usingKeyboard = true;
      focusedIndex = focusedIndex > 0 ? focusedIndex - 1 : allCourses.length - 1;
    } else if (event.key === 'Enter' && focusedIndex >= 0) {
      event.preventDefault();
      handleSelectCourse(allCourses[focusedIndex]);
    }
  }

  function getCourseIcon(courseId: string): string {
    switch (courseId) {
      case 'ten-finger': return '⌨️';
      case 'cli-mastery': return '🖥️';
      case 'claude-code': return '🤖';
      case 'sql-mastery': return '🗄️';
      default: return '📚';
    }
  }

  function getCourseStats(course: Course): { stages: number; lessons: number; exercises: number } {
    const stages = course.stages.length;
    const lessons = course.stages.reduce((sum, s) => sum + s.lessons.length, 0);
    const exercises = course.stages.reduce((sum, s) => sum + s.lessons.length * 4, 0);
    return { stages, lessons, exercises };
  }

  function getProgressInfo(course: Course): {
    enrolled: boolean;
    percent: number;
    completedStages: number;
    currentStageName: string | null;
  } {
    const progress = courseProgressMap.get(course.id);
    if (!progress) {
      return { enrolled: false, percent: 0, completedStages: 0, currentStageName: null };
    }

    const totalStages = course.stages.length;
    const completedStages = progress.completedStages.length;
    const percent = Math.round((completedStages / totalStages) * 100);
    const currentStage = progress.currentStageId
      ? course.stages.find(s => s.id === progress.currentStageId)
      : null;

    return {
      enrolled: true,
      percent,
      completedStages,
      currentStageName: currentStage?.name ?? null,
    };
  }

  function getStageStatus(course: Course, stageId: string): 'completed' | 'current' | 'skipped' | 'locked' {
    const progress = courseProgressMap.get(course.id);
    if (!progress) return 'locked';
    if (progress.completedStages.includes(stageId)) return 'completed';
    if (progress.skippedStages?.includes(stageId)) return 'skipped';
    if (progress.currentStageId === stageId) return 'current';
    return 'locked';
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="course-overview">
  <div class="courses-list">
    {#each allCourses as course, i}
      {@const stats = getCourseStats(course)}
      {@const info = getProgressInfo(course)}
      <button
        class="course-card"
        class:enrolled={info.enrolled}
        class:focused={usingKeyboard && focusedIndex === i}
        class:no-hover={usingKeyboard}
        onclick={() => handleSelectCourse(course)}
        onmouseenter={() => { usingKeyboard = false; focusedIndex = -1; }}
      >
        <div class="card-main">
          <div class="card-left">
            <div class="course-icon">{getCourseIcon(course.id)}</div>
          </div>

          <div class="card-content">
            <div class="card-top-row">
              <h2 class="course-name">{course.name}</h2>
              {#if info.enrolled}
                {#if info.percent === 100}
                  <span class="status-badge completed">Completed</span>
                {:else}
                  <span class="status-badge started">In Progress</span>
                {/if}
              {:else}
                <span class="status-badge new">Not Started</span>
              {/if}
            </div>

            <p class="course-description">{course.description}</p>

            <div class="course-meta">
              <span class="meta-item">{stats.stages} stages</span>
              <span class="meta-dot"></span>
              <span class="meta-item">{stats.lessons} lessons</span>
              <span class="meta-dot"></span>
              <span class="meta-item">{stats.exercises}+ exercises</span>
            </div>

            {#if info.enrolled}
              <div class="progress-section">
                <div class="progress-row">
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      class:complete={info.percent === 100}
                      style="width: {info.percent}%"
                    ></div>
                  </div>
                  <span class="progress-text">{info.percent}%</span>
                </div>
                <div class="progress-detail">
                  <span>{info.completedStages} of {stats.stages} stages completed</span>
                  {#if info.currentStageName && info.percent < 100}
                    <span class="current-stage">Next: {info.currentStageName}</span>
                  {/if}
                </div>
              </div>
            {/if}

            <!-- Stage roadmap dots -->
            <div class="stage-roadmap">
              {#each course.stages as stage, j}
                {@const status = getStageStatus(course, stage.id)}
                <div
                  class="roadmap-dot"
                  class:completed={status === 'completed'}
                  class:current={status === 'current'}
                  class:skipped={status === 'skipped'}
                  title="{stage.name}{status === 'completed' ? ' (completed)' : status === 'current' ? ' (current)' : status === 'skipped' ? ' (skipped)' : ''}"
                ></div>
                {#if j < course.stages.length - 1}
                  <div
                    class="roadmap-line"
                    class:completed={status === 'completed'}
                  ></div>
                {/if}
              {/each}
            </div>
          </div>

          <div class="card-action">
            {#if info.enrolled && info.percent < 100}
              <span class="action-label">Continue</span>
            {:else if info.enrolled && info.percent === 100}
              <span class="action-label">Review</span>
            {:else}
              <span class="action-label">Start</span>
            {/if}
            <span class="action-arrow">→</span>
          </div>
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .course-overview {
    @apply max-w-4xl;
  }

  .courses-list {
    @apply flex flex-col gap-4;
  }

  .course-card {
    @apply rounded-xl p-5 text-left w-full;
    @apply transition-all duration-200;
    background-color: var(--bg-secondary);
    border: 2px solid transparent;
  }

  .course-card:hover:not(.no-hover),
  .course-card.focused {
    border-color: var(--accent);
  }

  .course-card:hover:not(.no-hover) {
    transform: translateY(-1px);
  }

  .card-main {
    @apply flex gap-5 items-start;
  }

  .card-left {
    @apply flex-shrink-0;
  }

  .course-icon {
    @apply text-4xl w-14 h-14 flex items-center justify-center rounded-lg;
    background-color: var(--bg-tertiary);
  }

  .card-content {
    @apply flex-1 min-w-0;
  }

  .card-top-row {
    @apply flex items-center gap-3 mb-1.5;
  }

  .course-name {
    @apply text-lg font-semibold;
    color: var(--text-primary);
  }

  .status-badge {
    @apply px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wide;
  }

  .status-badge.started {
    background-color: rgba(92, 156, 245, 0.15);
    color: var(--accent);
  }

  .status-badge.completed {
    background-color: rgba(126, 198, 153, 0.15);
    color: var(--success);
  }

  .status-badge.new {
    background-color: var(--bg-tertiary);
    color: var(--text-muted);
  }

  .course-description {
    @apply text-sm mb-3 leading-relaxed;
    color: var(--text-secondary);
  }

  .course-meta {
    @apply flex items-center gap-2 text-xs mb-3;
    color: var(--text-muted);
  }

  .meta-dot {
    @apply w-1 h-1 rounded-full;
    background-color: var(--text-muted);
  }

  .progress-section {
    @apply mb-3;
  }

  .progress-row {
    @apply flex items-center gap-3 mb-1;
  }

  .progress-bar {
    @apply flex-1 h-1.5 rounded-full overflow-hidden;
    background-color: var(--bg-tertiary);
  }

  .progress-fill {
    @apply h-full rounded-full transition-all duration-300;
    background-color: var(--accent);
  }

  .progress-fill.complete {
    background-color: var(--success);
  }

  .progress-text {
    @apply text-xs font-medium tabular-nums;
    color: var(--text-muted);
    min-width: 32px;
    text-align: right;
  }

  .progress-detail {
    @apply flex items-center justify-between text-xs;
    color: var(--text-muted);
  }

  .current-stage {
    color: var(--accent);
  }

  /* Stage roadmap dots */
  .stage-roadmap {
    @apply flex items-center;
  }

  .roadmap-dot {
    @apply w-2 h-2 rounded-full flex-shrink-0;
    background-color: var(--bg-tertiary);
  }

  .roadmap-dot.completed {
    background-color: var(--success);
  }

  .roadmap-dot.current {
    background-color: var(--accent);
    box-shadow: 0 0 0 2px var(--bg-secondary), 0 0 0 3px var(--accent);
  }

  .roadmap-dot.skipped {
    background-color: var(--text-muted);
  }

  .roadmap-line {
    @apply h-px flex-1;
    min-width: 4px;
    max-width: 16px;
    background-color: var(--bg-tertiary);
  }

  .roadmap-line.completed {
    background-color: var(--success);
  }

  /* Action button */
  .card-action {
    @apply flex flex-col items-center gap-1 flex-shrink-0 self-center;
    @apply pl-4;
  }

  .action-label {
    @apply text-xs font-medium;
    color: var(--accent);
  }

  .action-arrow {
    @apply text-lg;
    color: var(--accent);
    transition: transform 0.2s;
  }

  .course-card:hover .action-arrow {
    transform: translateX(4px);
  }
</style>
