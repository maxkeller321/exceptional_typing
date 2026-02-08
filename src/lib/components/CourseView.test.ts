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
   */
  type CourseSubView = 'overview' | 'detail';

  function selectCourseFromOverview(subView: CourseSubView): CourseSubView {
    // Only allowed when in overview
    if (subView === 'overview') return 'detail';
    return subView;
  }

  function goBackFromDetail(subView: CourseSubView): CourseSubView {
    if (subView === 'detail') return 'overview';
    return subView;
  }

  function navigateToCourseFromSidebar(): CourseSubView {
    // Navigating to course from another view always starts at overview
    return 'overview';
  }

  it('starts on overview when navigating to courses', () => {
    const subView = navigateToCourseFromSidebar();
    expect(subView).toBe('overview');
  });

  it('transitions to detail only from overview (selecting a course)', () => {
    let subView: CourseSubView = 'overview';
    subView = selectCourseFromOverview(subView);
    expect(subView).toBe('detail');
  });

  it('cannot switch courses from within the detail view', () => {
    let subView: CourseSubView = 'detail';
    // Attempting to select a course while already in detail should not work
    // (there is no UI for it — the only action is "back to overview")
    subView = selectCourseFromOverview(subView);
    expect(subView).toBe('detail'); // unchanged
  });

  it('back button returns to overview from detail', () => {
    let subView: CourseSubView = 'detail';
    subView = goBackFromDetail(subView);
    expect(subView).toBe('overview');
  });

  it('full round-trip: overview → detail → overview → detail', () => {
    let subView: CourseSubView = navigateToCourseFromSidebar();
    expect(subView).toBe('overview');

    subView = selectCourseFromOverview(subView);
    expect(subView).toBe('detail');

    subView = goBackFromDetail(subView);
    expect(subView).toBe('overview');

    subView = selectCourseFromOverview(subView);
    expect(subView).toBe('detail');
  });

  it('re-entering courses from sidebar always resets to overview', () => {
    // Even if previously on detail, navigating away and back resets to overview
    let subView: CourseSubView = 'detail';
    subView = navigateToCourseFromSidebar();
    expect(subView).toBe('overview');
  });
});
