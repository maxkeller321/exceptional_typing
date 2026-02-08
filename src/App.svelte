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
  import { settingsStore, hasCompletedOnboarding } from './lib/stores/settings';
  import { get } from 'svelte/store';
  import { completedToday } from './lib/stores/daily';
  import { APP_NAME } from './lib/constants';
  import { checkAndConsumeDemoFlag, initializeDemoMode } from './lib/utils/demo';
  import type { AppView, UserSettings } from './lib/types';

  let view = $state<AppView>('home');
  let hasUser = $state(false);
  let settings = $state<UserSettings | null>(null);
  let dailyCompleted = $state(false);
  let showOnboarding = $state(false);

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
      // Reset course sub-view when navigating to course from sidebar
      if (v === 'course' && view !== 'course') {
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

  function handleGlobalKeyDown(event: KeyboardEvent): void {
    // Backspace to navigate back (only when not in an input/textarea and not in lesson view)
    if (event.key === 'Backspace' && view !== 'lesson' && view !== 'home') {
      // Don't capture if user is in an input element
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
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

      <div class="nav-items">
        <button
          class="nav-item"
          class:active={view === 'home'}
          onclick={() => navigateTo('home')}
        >
          <span class="nav-icon">🏠</span>
          <span class="nav-label">Lessons</span>
        </button>

        <button
          class="nav-item"
          class:active={view === 'practice'}
          onclick={() => navigateTo('practice')}
        >
          <span class="nav-icon">⚡</span>
          <span class="nav-label">Quick Practice</span>
        </button>

        <button
          class="nav-item"
          class:active={view === 'daily'}
          onclick={() => navigateTo('daily')}
        >
          <span class="nav-icon">{dailyCompleted ? '✅' : '📅'}</span>
          <span class="nav-label">Daily Test</span>
          {#if dailyCompleted}
            <span class="nav-badge">Done</span>
          {/if}
        </button>

        <button
          class="nav-item"
          class:active={view === 'course'}
          onclick={() => navigateTo('course')}
        >
          <span class="nav-icon">🎓</span>
          <span class="nav-label">Course</span>
        </button>

        <button
          class="nav-item"
          class:active={view === 'stats'}
          onclick={() => navigateTo('stats')}
        >
          <span class="nav-icon">📊</span>
          <span class="nav-label">Statistics</span>
        </button>

        <button
          class="nav-item"
          class:active={view === 'settings'}
          onclick={() => navigateTo('settings')}
        >
          <span class="nav-icon">⚙️</span>
          <span class="nav-label">Settings</span>
        </button>
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
            <h1>Choose a Lesson</h1>
            <p class="subtitle">Select a lesson to improve your typing skills</p>
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
            <h1>Quick Practice</h1>
            <p class="subtitle">Paste your own text or code to practice</p>
          </header>
          <PracticeView />
        </div>
      {:else if view === 'daily'}
        <div class="page daily-page">
          <header class="page-header">
            <h1>Daily Test</h1>
            <p class="subtitle">Take today's standardized typing test</p>
          </header>
          <DailyTestView />
        </div>
      {:else if view === 'course'}
        <div class="page course-page">
          {#if courseSubView === 'overview'}
            <header class="page-header">
              <h1>Courses</h1>
              <p class="subtitle">Choose a structured learning path</p>
            </header>
            <CourseOverview onSelectCourse={() => { courseSubView = 'detail'; }} />
          {:else}
            <header class="page-header course-detail-header">
              <button class="back-btn" onclick={() => { courseSubView = 'overview'; }}>
                <span class="back-arrow">←</span>
                <span>All Courses</span>
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
            <h1>Settings</h1>
            <p class="subtitle">Customize your experience</p>
          </header>

          <div class="settings-sections">
            <!-- Display Settings -->
            <section class="settings-section">
              <h2 class="section-title">Display</h2>
              <div class="settings-list">
                <Toggle
                  checked={settings.showVirtualKeyboard}
                  label="Virtual Keyboard"
                  description="Show keyboard with finger highlights"
                  onChange={(v) => settingsStore.setShowKeyboard(v)}
                />
                <Toggle
                  checked={settings.showHandGuides}
                  label="Hand Guides"
                  description="Show which finger to use for each key"
                  onChange={(v) => settingsStore.setShowHandGuides(v)}
                />
                <Toggle
                  checked={settings.showProgressPercentage}
                  label="Progress Percentage"
                  description="Show completion percentage while typing"
                  onChange={(v) => settingsStore.setShowProgress(v)}
                />
                <Toggle
                  checked={settings.showSyntaxHighlighting}
                  label="Syntax Highlighting"
                  description="Colorize code snippets"
                  onChange={(v) => settingsStore.setShowSyntaxHighlighting(v)}
                />
              </div>
            </section>

            <!-- Theme Settings -->
            <section class="settings-section">
              <h2 class="section-title">Theme</h2>
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-label">App Theme</span>
                    <span class="setting-description">Choose the overall color scheme</span>
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
              <h2 class="section-title">Typography</h2>
              <div class="settings-list">
                <Slider
                  value={settings.fontSize}
                  min={16}
                  max={40}
                  step={2}
                  label="Font Size"
                  description="Size of the typing text"
                  unit="px"
                  onChange={(v) => settingsStore.setFontSize(v)}
                />
              </div>
            </section>

            <!-- Audio Settings -->
            <section class="settings-section">
              <h2 class="section-title">Audio</h2>
              <div class="settings-list">
                <Toggle
                  checked={settings.soundEffectsEnabled}
                  label="Sound Effects"
                  description="Play sounds for keystrokes and feedback"
                  onChange={(v) => settingsStore.setSoundEffects(v)}
                />
              </div>
            </section>

            <!-- Code Settings -->
            <section class="settings-section">
              <h2 class="section-title">Code</h2>
              <div class="settings-list">
                <Toggle
                  checked={settings.autoFormatCode}
                  label="Auto-Format Code"
                  description="Automatically format pasted code"
                  onChange={(v) => settingsStore.setAutoFormat(v)}
                />
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-label">Code Theme</span>
                    <span class="setting-description">Syntax highlighting color scheme</span>
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
              <h2 class="section-title">Keyboard</h2>
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-label">Keyboard Layout</span>
                    <span class="setting-description">Your physical keyboard layout - hover to preview</span>
                  </div>
                  <KeyboardLayoutSelector
                    value={settings.keyboardLayout}
                    onchange={(layoutId) => settingsStore.setKeyboardLayout(layoutId)}
                  />
                </div>
              </div>
            </section>

            <!-- Language (placeholder for now) -->
            <section class="settings-section">
              <h2 class="section-title">Language</h2>
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-label">Interface Language</span>
                    <span class="setting-description">Language for the app interface</span>
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
              <h2 class="section-title">Tutorial</h2>
              <div class="settings-list">
                <div class="setting-item">
                  <div class="setting-info">
                    <span class="setting-label">App Tour</span>
                    <span class="setting-description">Replay the interactive tutorial to learn about app features</span>
                  </div>
                  <button class="tutorial-btn" onclick={() => { settingsStore.resetOnboarding(); showOnboarding = true; }}>
                    Rerun Tutorial
                  </button>
                </div>
              </div>
            </section>

            <!-- Reset -->
            <section class="settings-section">
              <h2 class="section-title">Reset</h2>
              <div class="settings-list">
                <button class="reset-btn" onclick={() => settingsStore.reset()}>
                  Reset All Settings to Defaults
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
