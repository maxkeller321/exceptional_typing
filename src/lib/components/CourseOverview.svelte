<script lang="ts">
  import { onMount } from 'svelte';
  import { courseStore } from '../stores/course';
  import { navigateTo } from '../stores/app';
  import { allCourses } from '../data/courses';
  import type { Course } from '../types';

  // Track enrollment status for each course
  let enrollmentStatus = $state<Map<string, boolean>>(new Map());

  onMount(() => {
    // Initialize enrollment status for all courses
    const status = new Map<string, boolean>();
    for (const course of allCourses) {
      status.set(course.id, courseStore.isEnrolled(course.id));
    }
    enrollmentStatus = status;

    // Subscribe to course store changes
    const unsubCourse = courseStore.subscribe(() => {
      const newStatus = new Map<string, boolean>();
      for (const course of allCourses) {
        newStatus.set(course.id, courseStore.isEnrolled(course.id));
      }
      enrollmentStatus = newStatus;
    });

    return () => {
      unsubCourse();
    };
  });

  let focusedIndex = $state(-1);
  let gridRef: HTMLDivElement;

  $effect(() => {
    if (focusedIndex >= 0 && gridRef) {
      const el = gridRef.children[focusedIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  });

  function handleSelectCourse(course: Course) {
    courseStore.selectCourse(course.id);
    navigateTo('course');
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      focusedIndex = focusedIndex < allCourses.length - 1 ? focusedIndex + 1 : 0;
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      focusedIndex = focusedIndex > 0 ? focusedIndex - 1 : allCourses.length - 1;
    } else if (event.key === 'Enter' && focusedIndex >= 0) {
      event.preventDefault();
      handleSelectCourse(allCourses[focusedIndex]);
    }
  }

  function getCourseIcon(courseId: string): string {
    switch (courseId) {
      case 'ten-finger':
        return '⌨️';
      case 'cli':
        return '🖥️';
      case 'keyboard-shortcuts':
        return '⚡';
      case 'claude-code':
        return '🤖';
      case 'sql-mastery':
        return '🗄️';
      default:
        return '📚';
    }
  }

  function getCourseStats(course: Course): { stages: number; lessons: number; exercises: number } {
    const stages = course.stages.length;
    const lessons = course.stages.reduce((sum, s) => sum + s.lessons.length, 0);
    const exercises = course.stages.reduce((sum, s) => sum + s.lessons.length * 4, 0);
    return { stages, lessons, exercises };
  }

  function getProgressPercent(courseId: string): number {
    return courseStore.getCourseProgressPercent(courseId);
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="course-overview">
  <div class="courses-grid" bind:this={gridRef}>
    {#each allCourses as course, i}
      {@const isEnrolled = enrollmentStatus.get(course.id) || false}
      {@const stats = getCourseStats(course)}
      {@const progress = getProgressPercent(course.id)}
      <button
        class="course-card"
        class:enrolled={isEnrolled}
        class:focused={focusedIndex === i}
        onclick={() => handleSelectCourse(course)}
      >
        <div class="card-header">
          <span class="course-icon">{getCourseIcon(course.id)}</span>
          {#if isEnrolled}
            <span class="status-badge">Started</span>
          {/if}
        </div>

        <h2 class="course-name">{course.name}</h2>
        <p class="course-description">{course.description}</p>

        <div class="course-stats">
          <div class="stat">
            <span class="stat-value">{stats.stages}</span>
            <span class="stat-label">Stages</span>
          </div>
          <div class="stat">
            <span class="stat-value">{stats.lessons}</span>
            <span class="stat-label">Lessons</span>
          </div>
          <div class="stat">
            <span class="stat-value">{stats.exercises}+</span>
            <span class="stat-label">Exercises</span>
          </div>
        </div>

        {#if isEnrolled}
          <div class="progress-section">
            <div class="progress-bar">
              <div class="progress-fill" style="width: {progress}%"></div>
            </div>
            <span class="progress-text">{progress}% Complete</span>
          </div>
        {/if}

        <div class="card-action">
          {#if isEnrolled}
            <span class="action-text">Continue Learning</span>
          {:else}
            <span class="action-text">Start Course</span>
          {/if}
          <span class="action-arrow">→</span>
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .course-overview {
    @apply max-w-5xl mx-auto;
  }

  .courses-grid {
    @apply grid gap-6;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }

  .course-card {
    @apply rounded-xl p-6 text-left;
    @apply transition-all duration-200;
    @apply flex flex-col;
    background-color: var(--bg-secondary);
    border: 2px solid transparent;
  }

  .course-card:hover,
  .course-card.focused {
    border-color: var(--accent);
    transform: translateY(-2px);
  }


  .card-header {
    @apply flex justify-between items-start mb-4;
  }

  .course-icon {
    @apply text-4xl;
  }

  .status-badge {
    @apply px-2 py-1 rounded text-xs font-medium;
    background-color: var(--success);
    color: var(--bg-primary);
  }

  .course-name {
    @apply text-xl font-semibold mb-2;
    color: var(--text-primary);
  }

  .course-description {
    @apply text-sm mb-4 flex-grow;
    color: var(--text-secondary);
  }

  .course-stats {
    @apply flex gap-6 mb-4 py-4;
    border-top: 1px solid var(--bg-tertiary);
    border-bottom: 1px solid var(--bg-tertiary);
  }

  .stat {
    @apply flex flex-col;
  }

  .stat-value {
    @apply text-lg font-semibold;
    color: var(--accent);
  }

  .stat-label {
    @apply text-xs;
    color: var(--text-muted);
  }

  .progress-section {
    @apply mb-4;
  }

  .progress-bar {
    @apply h-2 rounded-full mb-2 overflow-hidden;
    background-color: var(--bg-tertiary);
  }

  .progress-fill {
    @apply h-full rounded-full transition-all duration-300;
    background-color: var(--success);
  }

  .progress-text {
    @apply text-xs;
    color: var(--text-muted);
  }

  .card-action {
    @apply flex justify-between items-center mt-auto pt-4;
    border-top: 1px solid var(--bg-tertiary);
  }

  .action-text {
    @apply font-medium;
    color: var(--accent);
  }

  .action-arrow {
    @apply text-lg;
    color: var(--accent);
  }

  .course-card:hover .action-arrow {
    transform: translateX(4px);
    transition: transform 0.2s;
  }
</style>
