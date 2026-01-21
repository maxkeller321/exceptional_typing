import { writable, derived, get } from 'svelte/store';
import type { CourseProgress, CourseStage, Course } from '../types';
import { currentUser } from './user';
import {
  tenFingerCourse,
  cliCourse,
  allCourses,
  getCourseStage,
  getCliCourseStage,
} from '../data/courses';
import { lessonProgress } from './app';

// Internal store for all course progress (keyed by courseId)
const allProgressInternal = writable<Map<string, CourseProgress>>(new Map());

// Currently selected course
const selectedCourseInternal = writable<Course>(tenFingerCourse);

// Track current user ID
let currentUserId: number | null = null;

// Subscribe to user changes
currentUser.subscribe((user) => {
  if (user) {
    currentUserId = user.id;
    loadAllProgress(user.id);
  } else {
    currentUserId = null;
    allProgressInternal.set(new Map());
  }
});

// Load all course progress from localStorage
function loadAllProgress(userId: number): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(`exceptional-typing-all-courses-${userId}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Convert array back to Map
      allProgressInternal.set(new Map(parsed));
    } catch {
      // Try loading legacy single-course data
      loadLegacyProgress(userId);
    }
  } else {
    // Try loading legacy single-course data
    loadLegacyProgress(userId);
  }
}

// Load legacy single-course progress (backwards compatibility)
function loadLegacyProgress(userId: number): void {
  const stored = localStorage.getItem(`exceptional-typing-course-${userId}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const progressMap = new Map<string, CourseProgress>();
      progressMap.set(parsed.courseId, parsed);
      allProgressInternal.set(progressMap);
      // Migrate to new format
      saveAllProgress(progressMap);
    } catch {
      allProgressInternal.set(new Map());
    }
  } else {
    allProgressInternal.set(new Map());
  }
}

// Save all course progress to localStorage
function saveAllProgress(progressMap: Map<string, CourseProgress>): void {
  if (typeof window === 'undefined' || currentUserId === null) return;
  localStorage.setItem(
    `exceptional-typing-all-courses-${currentUserId}`,
    JSON.stringify(Array.from(progressMap.entries()))
  );
}

// Helper to get the correct course by ID
function getCourseById(courseId: string): Course | null {
  return allCourses.find((c) => c.id === courseId) || null;
}

// Helper to get stage from any course
function getStageFromCourse(course: Course, stageId: string): CourseStage | undefined {
  return course.stages.find((s) => s.id === stageId);
}

// Create the course store
function createCourseStore() {
  return {
    // Subscribe to current course's progress
    get progress() {
      return derived(
        [allProgressInternal, selectedCourseInternal],
        ([$allProgress, $course]) => $allProgress.get($course.id) || null
      );
    },

    // Subscribe to selected course
    selectedCourse: { subscribe: selectedCourseInternal.subscribe },

    // Get all available courses
    get courses() {
      return allCourses;
    },

    // Select a course
    selectCourse(courseId: string): void {
      const course = getCourseById(courseId);
      if (course) {
        selectedCourseInternal.set(course);
      }
    },

    // Enroll in a course (or the currently selected one)
    enroll(courseId?: string): void {
      if (currentUserId === null) return;

      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const course = getCourseById(targetCourseId);
      if (!course) return;

      const progress: CourseProgress = {
        courseId: course.id,
        currentStageId: course.stages[0].id,
        completedStages: [],
        skippedStages: [],
        enrolledAt: new Date().toISOString(),
        completedAt: null,
      };

      allProgressInternal.update((map) => {
        map.set(course.id, progress);
        saveAllProgress(map);
        return map;
      });
    },

    // Check if enrolled in a course
    isEnrolled(courseId?: string): boolean {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      return get(allProgressInternal).has(targetCourseId);
    },

    // Get progress for a specific course
    getProgress(courseId?: string): CourseProgress | null {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      return get(allProgressInternal).get(targetCourseId) || null;
    },

    // Get current stage for selected course
    getCurrentStage(): CourseStage | null {
      const course = get(selectedCourseInternal);
      const progress = get(allProgressInternal).get(course.id);
      if (!progress?.currentStageId) return null;
      return getStageFromCourse(course, progress.currentStageId) || null;
    },

    // Check if a stage is unlocked
    isStageUnlocked(stageId: string, courseId?: string): boolean {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const course = getCourseById(targetCourseId);
      if (!course) return false;

      const progress = get(allProgressInternal).get(targetCourseId);
      if (!progress) return false;

      const stage = getStageFromCourse(course, stageId);
      if (!stage) return false;

      // First stage is always unlocked if enrolled
      if (!stage.unlockCriteria.previousStageComplete) return true;

      // Check if this stage was skipped to (explicitly unlocked)
      if (progress.skippedStages?.includes(stageId)) return true;

      // Check if previous stage is complete or skipped
      const stageIndex = course.stages.findIndex((s) => s.id === stageId);
      if (stageIndex === 0) return true;

      const prevStage = course.stages[stageIndex - 1];
      if (
        !progress.completedStages.includes(prevStage.id) &&
        !progress.skippedStages?.includes(prevStage.id)
      ) {
        return false;
      }

      // TODO: Check minWpm and minAccuracy from user stats
      return true;
    },

    // Check if a stage is completed
    isStageCompleted(stageId: string, courseId?: string): boolean {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const progress = get(allProgressInternal).get(targetCourseId);
      return progress?.completedStages.includes(stageId) || false;
    },

    // Check if a stage was skipped
    isStageSkipped(stageId: string, courseId?: string): boolean {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const progress = get(allProgressInternal).get(targetCourseId);
      return progress?.skippedStages?.includes(stageId) || false;
    },

    // Skip to a stage (unlock it and mark previous stages as skipped)
    skipToStage(stageId: string, courseId?: string): void {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const course = getCourseById(targetCourseId);
      if (!course) return;

      const stageIndex = course.stages.findIndex((s) => s.id === stageId);
      if (stageIndex === -1) return;

      allProgressInternal.update((map) => {
        const progress = map.get(targetCourseId);
        if (!progress) return map;

        // Initialize skippedStages if it doesn't exist (for backwards compatibility)
        if (!progress.skippedStages) {
          progress.skippedStages = [];
        }

        // Mark all previous incomplete stages as skipped
        for (let i = 0; i < stageIndex; i++) {
          const prevStageId = course.stages[i].id;
          if (
            !progress.completedStages.includes(prevStageId) &&
            !progress.skippedStages.includes(prevStageId)
          ) {
            progress.skippedStages.push(prevStageId);
          }
        }

        // Add the target stage to skipped list to mark it as unlocked
        if (!progress.skippedStages.includes(stageId)) {
          progress.skippedStages.push(stageId);
        }

        // Set current stage to the skipped-to stage
        progress.currentStageId = stageId;

        map.set(targetCourseId, progress);
        saveAllProgress(map);
        return map;
      });
    },

    // Mark a stage as completed
    completeStage(stageId: string, courseId?: string): void {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const course = getCourseById(targetCourseId);
      if (!course) return;

      allProgressInternal.update((map) => {
        const progress = map.get(targetCourseId);
        if (!progress) return map;

        if (!progress.completedStages.includes(stageId)) {
          progress.completedStages.push(stageId);

          // Move to next stage
          const stageIndex = course.stages.findIndex((s) => s.id === stageId);
          if (stageIndex < course.stages.length - 1) {
            progress.currentStageId = course.stages[stageIndex + 1].id;
          } else {
            // Course completed
            progress.completedAt = new Date().toISOString();
          }

          map.set(targetCourseId, progress);
          saveAllProgress(map);
        }

        return map;
      });
    },

    // Set current stage
    setCurrentStage(stageId: string, courseId?: string): void {
      const targetCourseId = courseId || get(selectedCourseInternal).id;

      allProgressInternal.update((map) => {
        const progress = map.get(targetCourseId);
        if (!progress) return map;

        progress.currentStageId = stageId;
        map.set(targetCourseId, progress);
        saveAllProgress(map);
        return map;
      });
    },

    // Get progress percentage for a course
    getProgressPercentage(courseId?: string): number {
      const targetCourseId = courseId || get(selectedCourseInternal).id;
      const course = getCourseById(targetCourseId);
      if (!course) return 0;

      const progress = get(allProgressInternal).get(targetCourseId);
      if (!progress) return 0;

      const totalStages = course.stages.length;
      const completedStages = progress.completedStages.length;
      return Math.round((completedStages / totalStages) * 100);
    },

    // Reset progress for a course
    reset(courseId?: string): void {
      if (currentUserId === null) return;
      const targetCourseId = courseId || get(selectedCourseInternal).id;

      allProgressInternal.update((map) => {
        map.delete(targetCourseId);
        saveAllProgress(map);
        return map;
      });
    },

    // Reset all course progress
    resetAll(): void {
      if (currentUserId === null) return;
      localStorage.removeItem(`exceptional-typing-all-courses-${currentUserId}`);
      allProgressInternal.set(new Map());
    },
  };
}

export const courseStore = createCourseStore();

// Derived stores
export const isEnrolled = derived(
  [allProgressInternal, selectedCourseInternal],
  ([$allProgress, $course]) => $allProgress.has($course.id)
);

export const currentStageId = derived(
  [allProgressInternal, selectedCourseInternal],
  ([$allProgress, $course]) => {
    const progress = $allProgress.get($course.id);
    return progress?.currentStageId || null;
  }
);

export const completedStagesCount = derived(
  [allProgressInternal, selectedCourseInternal],
  ([$allProgress, $course]) => {
    const progress = $allProgress.get($course.id);
    return progress?.completedStages.length || 0;
  }
);

export const courseProgressPercent = derived(
  [allProgressInternal, selectedCourseInternal],
  ([$allProgress, $course]) => {
    const progress = $allProgress.get($course.id);
    if (!progress) return 0;
    return Math.round((progress.completedStages.length / $course.stages.length) * 100);
  }
);

// Export all courses for easy access
export { allCourses, tenFingerCourse, cliCourse };
