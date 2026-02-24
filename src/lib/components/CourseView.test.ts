import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Tests ensuring course switching is ONLY possible from the CourseOverview page.
 *
 * CourseView should display a single course's content (stages, lessons).
 * It must NOT contain any UI for switching between courses (tabs, dropdowns, etc.).
 * Course selection happens exclusively in CourseOverview, which navigates to CourseView.
 *
 * The App.svelte navigation flow:
 *   CourseOverview (select course) → courseSubView = 'detail' → CourseView (single course)
 *   CourseView "← All Courses" back button → courseSubView = 'overview' → CourseOverview
 */

describe('CourseView: no course-switching UI', () => {
  const courseViewSource = readFileSync(
    resolve(__dirname, 'CourseView.svelte'),
    'utf-8',
  );

  it('does not contain course-tab elements', () => {
    expect(courseViewSource).not.toContain('course-tab');
  });

  it('does not contain a course selector or switcher', () => {
    expect(courseViewSource).not.toContain('selectCourse');
    expect(courseViewSource).not.toContain('handleSelectCourse');
  });

  it('does not iterate over allCourses to render tabs', () => {
    // allCourses may be imported for initial state, but should NOT be
    // iterated in the template to render course-switching UI
    const templateSection = courseViewSource.split('<script')[0] +
      (courseViewSource.split('</script>').slice(1).join('</script>'));
    expect(templateSection).not.toMatch(/\{#each\s+allCourses/);
  });
});

describe('App course navigation flow', () => {
  /**
   * State machine for the course sub-view in App.svelte:
   *   'overview' → select course → 'detail'
   *   'detail' → back button / Backspace → 'overview'
   *   'detail' → start lesson → 'lesson' → finish lesson → 'detail' (NOT overview!)
   *
   * The key invariant: returning from a lesson should land back in the course
   * detail view, not reset to the overview. Only sidebar navigation resets.
   */
  type AppView = 'home' | 'course' | 'lesson' | 'practice' | 'daily' | 'stats' | 'settings';
  type CourseSubView = 'overview' | 'detail';

  // Models the App.svelte state
  let view: AppView;
  let courseSubView: CourseSubView;

  function reset() {
    view = 'home';
    courseSubView = 'overview';
  }

  // Models the currentView subscriber in App.svelte
  function navigateTo(newView: AppView) {
    // Reset course sub-view when navigating to course from sidebar,
    // but NOT when returning from a lesson
    if (newView === 'course' && view !== 'course' && view !== 'lesson') {
      courseSubView = 'overview';
    }
    view = newView;
  }

  function selectCourseFromOverview() {
    if (courseSubView === 'overview') courseSubView = 'detail';
  }

  function goBackFromDetail() {
    if (courseSubView === 'detail') courseSubView = 'overview';
  }

  function startLessonFromCourse() {
    // CourseView calls selectLesson() which navigates to 'lesson'
    navigateTo('lesson');
  }

  function finishLessonBackToCourse() {
    // LessonView calls navigateTo(getLessonSourceView()) which is 'course'
    navigateTo('course');
  }

  beforeEach(() => reset());

  it('starts on overview when navigating to courses', () => {
    navigateTo('course');
    expect(courseSubView).toBe('overview');
  });

  it('transitions to detail only from overview (selecting a course)', () => {
    navigateTo('course');
    selectCourseFromOverview();
    expect(courseSubView).toBe('detail');
  });

  it('cannot switch courses from within the detail view', () => {
    navigateTo('course');
    selectCourseFromOverview();
    expect(courseSubView).toBe('detail');
    // No UI to select another course from detail
    selectCourseFromOverview();
    expect(courseSubView).toBe('detail');
  });

  it('back button returns to overview from detail', () => {
    navigateTo('course');
    selectCourseFromOverview();
    goBackFromDetail();
    expect(courseSubView).toBe('overview');
  });

  it('full round-trip: overview → detail → overview → detail', () => {
    navigateTo('course');
    expect(courseSubView).toBe('overview');

    selectCourseFromOverview();
    expect(courseSubView).toBe('detail');

    goBackFromDetail();
    expect(courseSubView).toBe('overview');

    selectCourseFromOverview();
    expect(courseSubView).toBe('detail');
  });

  it('re-entering courses from sidebar always resets to overview', () => {
    navigateTo('course');
    selectCourseFromOverview();
    expect(courseSubView).toBe('detail');

    // Navigate away to home, then back to course
    navigateTo('home');
    navigateTo('course');
    expect(courseSubView).toBe('overview');
  });

  it('returning from a lesson stays in course detail, not overview', () => {
    // User navigates to courses, selects a course, enters detail view
    navigateTo('course');
    selectCourseFromOverview();
    expect(courseSubView).toBe('detail');

    // User starts a lesson from the course detail
    startLessonFromCourse();
    expect(view).toBe('lesson');

    // User finishes the lesson and navigates back to course
    finishLessonBackToCourse();
    expect(view).toBe('course');
    // CRITICAL: should stay in detail, not reset to overview
    expect(courseSubView).toBe('detail');
  });

  it('returning from a lesson preserves detail across multiple lessons', () => {
    navigateTo('course');
    selectCourseFromOverview();

    // Complete multiple lessons in a row
    for (let i = 0; i < 3; i++) {
      startLessonFromCourse();
      expect(view).toBe('lesson');

      finishLessonBackToCourse();
      expect(view).toBe('course');
      expect(courseSubView).toBe('detail');
    }
  });

  it('sidebar navigation after lesson still resets to overview', () => {
    navigateTo('course');
    selectCourseFromOverview();

    // Start and finish a lesson
    startLessonFromCourse();
    finishLessonBackToCourse();
    expect(courseSubView).toBe('detail');

    // Now navigate away via sidebar and back — should reset
    navigateTo('settings');
    navigateTo('course');
    expect(courseSubView).toBe('overview');
  });
});
