<script lang="ts">
  import { onMount } from 'svelte';
  import LessonPicker from './lib/components/LessonPicker.svelte';
  import LessonView from './lib/components/LessonView.svelte';
  import StatsDisplay from './lib/components/StatsDisplay.svelte';
  import PracticeView from './lib/components/PracticeView.svelte';
  import DailyTestView from './lib/components/DailyTestView.svelte';
  import CourseView from './lib/components/CourseView.svelte';
  import CourseOverview from './lib/components/CourseOverview.svelte';
  import UserPicker from './lib/components/user/UserPicker.svelte';
  import UserMenu from './lib/components/user/UserMenu.svelte';
  import ModeToggle from './lib/components/ModeToggle.svelte';
  import Toggle from './lib/components/ui/Toggle.svelte';
  import Slider from './lib/components/ui/Slider.svelte';
  import Dropdown from './lib/components/ui/Dropdown.svelte';
  import AppIcon from './lib/components/AppIcon.svelte';
  import KeyboardLayoutSelector from './lib/components/KeyboardLayoutSelector.svelte';
  import OnboardingTutorial from './lib/components/onboarding/OnboardingTutorial.svelte';
  import { currentView, navigateTo, selectedLesson } from './lib/stores/app';
  import { isUserSelected, loadUsers, currentUser } from './lib/stores/user';
  import { settingsStore, hasCompletedOnboarding, resolvedKeyboardLayout } from './lib/stores/settings';
  import { get } from 'svelte/store';
  import { completedToday } from './lib/stores/daily';
  import { APP_NAME } from './lib/constants';
  import { checkAndConsumeDemoFlag, initializeDemoMode } from './lib/utils/demo';
  import { i18n, type TranslationKey } from './lib/i18n';
  import type { AppView, UserSettings, ConcreteKeyboardLayoutId } from './lib/types';

  let view = $state<AppView>('home');
  let tr = $state<(key: TranslationKey, params?: Record<string, string>) => string>((key) => key);
  let hasUser = $state(false);
  let settings = $state<UserSettings | null>(null);
  let resolvedLayoutId = $state<ConcreteKeyboardLayoutId>('qwerty-us');
  let dailyCompleted = $state(false);
  let showOnboarding = $state(false);

  // Sidebar keyboard navigation
  let focusedNavIndex = $state(-1);
  let usingNavKeyboard = $state(false);

  // Course sub-view: 'overview' shows all courses, 'detail' shows stages/lessons
  let courseSubView = $state<'overview' | 'detail'>('overview');

  // Lesson session key - incremented each time a lesson is selected
  // This forces LessonView to re-mount with fresh state
  let lessonSessionKey = $state(0);

  // Track if we've already checked onboarding for the current user session
  // This prevents showing onboarding multiple times on settings updates
  let onboardingCheckedForUser = $state<number | null>(null);

  // Subscribe to stores
  onMount(() => {
    // Demo mode: if the self-cleaning flag is set, initialize demo data
    // and auto-login. Otherwise load real users normally.
    if (checkAndConsumeDemoFlag()) {
      initializeDemoMode();
    } else {
      loadUsers();
    }

    const unsubView = currentView.subscribe((v) => {
      // Reset course sub-view when navigating to course from sidebar,
      // but NOT when returning from a lesson (so user lands back in the course detail)
      if (v === 'course' && view !== 'course' && view !== 'lesson') {
        courseSubView = 'overview';
      }
      view = v;
    });

    const unsubUser = isUserSelected.subscribe((selected) => {
      hasUser = selected;
      // Reset onboarding check when user logs out
      if (!selected) {
        onboardingCheckedForUser = null;
      }
    });

    const unsubSettings = settingsStore.subscribe((s) => {
      settings = s;
      // Apply theme to document (dark-blue is the default, so it doesn't need data-theme attribute)
      if (s?.appTheme && s.appTheme !== 'dark-blue') {
        document.documentElement.setAttribute('data-theme', s.appTheme);
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    });

    const unsubDaily = completedToday.subscribe((c) => {
      dailyCompleted = c;
    });

    const unsubResolvedLayout = resolvedKeyboardLayout.subscribe((l) => {
      resolvedLayoutId = l;
    });

    const unsubI18n = i18n.subscribe((fn) => {
      tr = fn;
    });

    // Increment lesson session key when a new lesson is selected
    // This forces LessonView to re-mount with fresh state
    const unsubLesson = selectedLesson.subscribe((lesson) => {
      if (lesson) {
        lessonSessionKey++;
      }
    });

    // Subscribe to currentUser to check onboarding status once per user login
    const unsubCurrentUser = currentUser.subscribe((user) => {
      if (user && user.id !== onboardingCheckedForUser) {
        // Mark that we've checked onboarding for this user
        onboardingCheckedForUser = user.id;

        // Use a small delay to ensure settings are loaded for this user
        setTimeout(() => {
          const completed = get(hasCompletedOnboarding);
          if (!completed) {
            showOnboarding = true;
          }
        }, 50);
      }
    });

    return () => {
      unsubView();
      unsubUser();
      unsubSettings();
      unsubDaily();
      unsubResolvedLayout();
      unsubI18n();
      unsubLesson();
      unsubCurrentUser();
    };
  });

  const codeThemeOptions = [
    { value: 'vscode-dark', label: 'VS Code Dark' },
    { value: 'github-dark', label: 'GitHub Dark' },
    { value: 'monokai', label: 'Monokai' },
    { value: 'nord', label: 'Nord' },
    { value: 'dracula', label: 'Dracula' },
    { value: 'one-dark', label: 'One Dark' },
  ];

  // Sidebar navigation order for arrow key navigation
  const sidebarViews: AppView[] = ['home', 'practice', 'daily', 'course', 'stats', 'settings'];

  function handleGlobalKeyDown(event: KeyboardEvent): void {
    // Don't capture if user is in an input element
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    // Don't capture keys when in lesson, daily test, or practice (typing views)
    if (view === 'lesson' || view === 'daily' || view === 'practice') {
      return;
    }

    // ArrowUp / ArrowDown to move focus outline between sidebar sections
    // Skip when course view is active (CourseView/CourseOverview have their own arrow key handlers)
    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && view !== 'course') {
      event.preventDefault();
      usingNavKeyboard = true;

      const currentIndex = focusedNavIndex >= 0 ? focusedNavIndex : sidebarViews.indexOf(view);
      if (currentIndex === -1) return;

      if (event.key === 'ArrowUp') {
        focusedNavIndex = currentIndex > 0 ? currentIndex - 1 : sidebarViews.length - 1;
      } else {
        focusedNavIndex = currentIndex < sidebarViews.length - 1 ? currentIndex + 1 : 0;
      }
      return;
    }

    // Enter to navigate to the focused sidebar section
    if (event.key === 'Enter' && usingNavKeyboard && focusedNavIndex >= 0) {
      event.preventDefault();
      navigateTo(sidebarViews[focusedNavIndex]);
      focusedNavIndex = -1;
      usingNavKeyboard = false;
      return;
    }

    // Backspace to navigate back (only when not in home)
    if (event.key === 'Backspace' && view !== 'home') {
      event.preventDefault();
      if (view === 'course' && courseSubView === 'detail') {
        courseSubView = 'overview';
      } else {
        navigateTo('home');
      }
    }
  }

  const localeOptions = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
  ];

  const appThemeOptions = [
    { value: 'dark-gold', label: 'Dark Gold' },
    { value: 'dark-blue', label: 'Dark Blue' },
    { value: 'light', label: 'Light' },
    { value: 'midnight', label: 'Midnight' },
  ];
</script>

<svelte:window onkeydown={handleGlobalKeyDown} />

{#if !hasUser}
  <UserPicker />
{:else}
  <!-- Onboarding overlay (rendered on top of app) -->
  {#if showOnboarding}
    <OnboardingTutorial onComplete={() => (showOnboarding = false)} />
  {/if}

  <div class="app">
    <!-- Navigation sidebar -->
    <nav class="sidebar">
      <div class="logo">
        <AppIcon size={28} />
        <span class="logo-text">{APP_NAME}</span>
      </div>

      <!-- Mode Toggle -->
      <div class="mode-section">
        <ModeToggle />
      </div>

      <div class="nav-items" class:no-hover={usingNavKeyboard}>
        {#each sidebarViews as navView, i}
          <button
            class="nav-item"
            class:active={view === navView}
            class:focused={usingNavKeyboard && focusedNavIndex === i}
            onclick={() => { navigateTo(navView); usingNavKeyboard = false; focusedNavIndex = -1; }}
            onmouseenter={() => { usingNavKeyboard = false; focusedNavIndex = -1; }}
          >
            <span class="nav-icon">{
              navView === 'home' ? '🏠' :
              navView === 'practice' ? '⚡' :
              navView === 'daily' ? (dailyCompleted ? '✅' : '📅') :
              navView === 'course' ? '🎓' :
              navView === 'stats' ? '📊' : '⚙️'
            }</span>
            <span class="nav-label">{
              navView === 'home' ? tr('nav.lessons') :
              navView === 'practice' ? tr('nav.practice') :
              navView === 'daily' ? tr('nav.daily') :
              navView === 'course' ? tr('nav.course') :
              navView === 'stats' ? tr('nav.stats') : tr('nav.settings')
            }</span>
            {#if navView === 'daily' && dailyCompleted}
              <span class="nav-badge">{tr('daily.done')}</span>
            {/if}
          </button>
        {/each}
      </div>

      <div class="sidebar-footer">
        <UserMenu />
        <p class="version">v0.1.0</p>
      </div>
    </nav>

    <!-- Main content area -->
    <main class="content">
      {#if view === 'home'}
        <div class="page home-page">
          <header class="page-header">
            <h1>{tr('lessons.title')}</h1>
            <p class="subtitle">{tr('lessons.subtitle')}</p>
          </header>
          <LessonPicker />
        </div>
      {:else if view === 'lesson'}
        <div class="page lesson-page">
          {#key lessonSessionKey}
            <LessonView />
          {/key}
        </div>
      {:else if view === 'practice'}
        <div class="page practice-page">
          <header class="page-header">
            <h1>{tr('practice.title')}</h1>
            <p class="subtitle">{tr('practice.subtitle')}</p>
          </header>
          <PracticeView />
        </div>
      {:else if view === 'daily'}
        <div class="page daily-page">
          <header class="page-header">
            <h1>{tr('daily.title')}</h1>
            <p class="subtitle">{tr('daily.subtitle')}</p>
          </header>
          <DailyTestView />
        </div>
      {:else if view === 'course'}
        <div class="page course-page">
          {#if courseSubView === 'overview'}
            <header class="page-header">
              <h1>{tr('course.coursesTitle')}</h1>
              <p class="subtitle">{tr('course.choosePathSubtitle')}</p>
            </header>
            <CourseOverview onSelectCourse={() => { courseSubView = 'detail'; }} />
          {:else}
            <header class="page-header course-detail-header">
              <button class="back-btn" onclick={() => { courseSubView = 'overview'; }}>
                <span class="back-arrow">←</span>
                <span>{tr('course.allCourses')}</span>
              </button>
            </header>
            <CourseView />
          {/if}
        </div>
      {:else if view === 'stats'}
        <div class="page stats-page">
          <StatsDisplay />
        </div>
      {:else if view === 'settings' && settings}
        <div class="page settings-page">
          <header class="page-header">
            <h1>{tr('settings.title')}</h1>
            <p class="subtitle">{tr('settings.subtitle')}</p>
          </header>

          <div class="settings-sections">
            <!-- Display Settings -->
            <section class="settings-section">
              <h2 class="section-title">{tr('settings.display')}</h2>
              <div class="settings-list">
                <Toggle
                  checked={settings.showVirtualKeyboard}
                  label={tr('settings.virtualKeyboard')}
                  description={tr('settings.virtualKeyboardDesc')}
                  onChange={(v) => settingsStore.setShowKeyboard(v)}
                />
                <Toggle
                  checked={settings.showHandGuides}
                  label={tr('settings.handGuides')}
                  description={tr('settings.handGuidesDesc')}
                  onChange={(v) => settingsStore.setShowHandGuides(v)}
                />
                <Toggle
                  checked={settings.showProgressPercentage}
                  label={tr('settings.progressPercentage')}
                  description={tr('settings.progressPercentageDesc')}
                  onChange={(v) => settingsStore.setShowProgress(v)}
                />
                <Toggle
                  checked={settings.showSyntaxHighlighting}
                  label={tr('settings.syntaxHighlighting')}
                  description={tr('settings.syntaxHighlightingDesc')}
                  onChange={(v) => settingsStore.setShowSyntaxHighlighting(v)}
                />
              </div>
            </section>

            <!-- Theme Settings -->
            <section class="settings-section">
              <h2 class="section-title">{tr('settings.theme')}</h2>
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-label">{tr('settings.appTheme')}</span>
                    <span class="setting-description">{tr('settings.appThemeDesc')}</span>
                  </div>
                  <Dropdown
                    options={appThemeOptions}
                    value={settings.appTheme}
                    onChange={(v) => settingsStore.setAppTheme(v as import('./lib/types').AppTheme)}
                  />
                </div>
              </div>
            </section>

            <!-- Typography Settings -->
            <section class="settings-section">
              <h2 class="section-title">{tr('settings.typography')}</h2>
              <div class="settings-list">
                <Slider
                  value={settings.fontSize}
                  min={16}
                  max={40}
                  step={2}
                  label={tr('settings.fontSize')}
                  description={tr('settings.fontSizeDesc')}
                  unit="px"
                  onChange={(v) => settingsStore.setFontSize(v)}
                />
              </div>
            </section>

            <!-- Audio Settings -->
            <section class="settings-section">
              <h2 class="section-title">{tr('settings.audio')}</h2>
              <div class="settings-list">
                <Toggle
                  checked={settings.soundEffectsEnabled}
                  label={tr('settings.soundEffects')}
                  description={tr('settings.soundEffectsDesc')}
                  onChange={(v) => settingsStore.setSoundEffects(v)}
                />
              </div>
            </section>

            <!-- Code Settings -->
            <section class="settings-section">
              <h2 class="section-title">{tr('settings.code')}</h2>
              <div class="settings-list">
                <Toggle
                  checked={settings.autoFormatCode}
                  label={tr('settings.autoFormat')}
                  description={tr('settings.autoFormatDesc')}
                  onChange={(v) => settingsStore.setAutoFormat(v)}
                />
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-label">{tr('settings.codeTheme')}</span>
                    <span class="setting-description">{tr('settings.codeThemeDesc')}</span>
                  </div>
                  <Dropdown
                    options={codeThemeOptions}
                    value={settings.codeTheme}
                    onChange={(v) => settingsStore.setCodeTheme(v)}
                  />
                </div>
              </div>
            </section>

            <!-- Keyboard Layout -->
            <section class="settings-section">
              <h2 class="section-title">{tr('settings.keyboard')}</h2>
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-label">{tr('settings.keyboardLayout')}</span>
                    <span class="setting-description">{tr('settings.keyboardLayoutDesc')}</span>
                  </div>
                  <KeyboardLayoutSelector
                    value={settings.keyboardLayout}
                    {resolvedLayoutId}
                    onchange={(layoutId) => settingsStore.setKeyboardLayout(layoutId)}
                  />
                </div>
              </div>
            </section>

            <!-- Language -->
            <section class="settings-section">
              <h2 class="section-title">{tr('settings.language')}</h2>
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-label">{tr('settings.interfaceLanguage')}</span>
                    <span class="setting-description">{tr('settings.interfaceLanguageDesc')}</span>
                  </div>
                  <Dropdown
                    options={localeOptions}
                    value={settings.locale}
                    onChange={(v) => settingsStore.setLocale(v as any)}
                  />
                </div>
              </div>
            </section>

            <!-- Tutorial -->
            <section class="settings-section">
              <h2 class="section-title">{tr('settings.tutorial')}</h2>
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-label">{tr('settings.appTour')}</span>
                    <span class="setting-description">{tr('settings.appTourDesc')}</span>
                  </div>
                  <button class="tutorial-btn" onclick={() => { settingsStore.resetOnboarding(); showOnboarding = true; }}>
                    {tr('settings.rerunTutorial')}
                  </button>
                </div>
              </div>
            </section>

            <!-- Reset -->
            <section class="settings-section">
              <h2 class="section-title">{tr('settings.reset')}</h2>
              <div class="settings-list">
                <button class="reset-btn" onclick={() => settingsStore.reset()}>
                  {tr('settings.resetAll')}
                </button>
              </div>
            </section>
          </div>
        </div>
      {/if}
    </main>
  </div>
{/if}

<style>
  .app {
    @apply flex h-screen;
    background-color: var(--bg-primary);
  }

  .sidebar {
    @apply w-56 flex flex-col;
    background-color: var(--bg-secondary);
  }

  .logo {
    @apply flex items-center gap-2.5 px-5 py-4;
  }

  .logo-text {
    @apply text-base font-medium;
    color: var(--text-primary);
  }

  .mode-section {
    @apply px-3 py-2;
  }

  .nav-items {
    @apply flex-1 py-2;
  }

  .nav-item {
    @apply w-full flex items-center gap-3 px-5 py-2.5;
    @apply transition-all duration-150;
    color: var(--text-secondary);
  }

  .nav-item:hover {
    color: var(--text-primary);
    background-color: var(--bg-tertiary);
  }

  .nav-item.active {
    color: var(--accent);
    background-color: transparent;
  }

  .nav-item.focused {
    outline: 2px solid var(--accent);
    outline-offset: -2px;
    border-radius: 4px;
  }

  .nav-items.no-hover .nav-item:hover:not(.focused) {
    color: var(--text-secondary);
    background-color: transparent;
  }

  .nav-icon {
    @apply text-lg opacity-80;
  }

  .nav-label {
    @apply text-sm font-normal flex-1;
  }

  .nav-badge {
    @apply text-xs px-1.5 py-0.5 rounded;
    background-color: rgba(126, 198, 153, 0.2);
    color: var(--success);
  }

  .sidebar-footer {
    @apply px-3 py-3;
    @apply flex flex-col gap-2;
  }

  .version {
    @apply text-xs text-center;
    color: var(--text-muted);
  }

  .content {
    @apply flex-1 overflow-y-auto;
  }

  .page {
    @apply p-8 min-h-full;
    max-width: 1800px;
    margin: 0 auto;
  }

  /* Stats page should use more width on large screens */
  .page.stats-page {
    max-width: none;
  }

  /* Lesson page should use available width for better experience */
  .page.lesson-page {
    max-width: none;
  }

  .page-header {
    @apply mb-6;
  }

  .page-header h1 {
    @apply text-2xl font-medium mb-1;
    color: var(--text-primary);
  }

  .subtitle {
    color: var(--text-secondary);
    @apply text-sm;
  }

  /* Settings styles */
  .settings-sections {
    @apply space-y-6 max-w-xl;
  }

  .settings-section {
    @apply rounded-lg p-5;
    background-color: var(--bg-secondary);
  }

  .section-title {
    @apply text-sm font-medium mb-4 uppercase tracking-wider;
    color: var(--text-secondary);
  }

  .settings-list {
    @apply flex flex-col gap-3;
  }

  .setting-item {
    @apply flex items-center justify-between gap-4;
    @apply py-1;
  }

  .setting-info {
    @apply flex flex-col gap-0.5;
  }

  .setting-label {
    @apply text-sm;
    color: var(--text-primary);
  }

  .setting-description {
    @apply text-xs;
    color: var(--text-muted);
  }

  .reset-btn {
    @apply w-full px-4 py-2.5 rounded;
    @apply transition-colors font-medium text-sm;
    background-color: rgba(202, 71, 84, 0.15);
    color: var(--error);
    border: none;
  }

  .reset-btn:hover {
    background-color: rgba(202, 71, 84, 0.25);
  }

  .tutorial-btn {
    @apply px-4 py-2 rounded;
    @apply transition-colors font-medium text-sm whitespace-nowrap;
    background-color: rgba(99, 102, 241, 0.15);
    color: #6366f1;
    border: none;
  }

  .tutorial-btn:hover {
    background-color: rgba(99, 102, 241, 0.25);
  }

  /* Course back button */
  .course-detail-header {
    @apply mb-4;
  }

  .back-btn {
    @apply flex items-center gap-2 px-3 py-1.5 rounded;
    @apply text-sm transition-colors;
    color: var(--text-secondary);
  }

  .back-btn:hover {
    color: var(--text-primary);
    background-color: var(--bg-secondary);
  }

  .back-arrow {
    @apply text-base;
  }
</style>
