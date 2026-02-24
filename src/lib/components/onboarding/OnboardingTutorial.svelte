<script lang="ts">
  import { onMount } from 'svelte';
  import { settingsStore, detectedLayout, resolvedKeyboardLayout } from '../../stores/settings';
  import { layouts } from '../../data/layouts';
  import { APP_NAME } from '../../constants';
  import SpotlightOverlay from './SpotlightOverlay.svelte';
  import type { KeyboardLayoutId, ConcreteKeyboardLayoutId } from '../../types';

  interface Props {
    onComplete: () => void;
  }

  let { onComplete }: Props = $props();

  // Keyboard layout state for the interactive step
  let selectedLayout = $state<KeyboardLayoutId>('auto');
  let detectedLayoutId = $state<ConcreteKeyboardLayoutId>('qwerty-us');

  onMount(() => {
    const unsub1 = detectedLayout.subscribe((v) => { detectedLayoutId = v; });
    const unsub2 = resolvedKeyboardLayout.subscribe(() => {});
    return () => { unsub1(); unsub2(); };
  });

  const concreteLayouts = Object.values(layouts);

  function selectKeyboardLayout(id: KeyboardLayoutId) {
    selectedLayout = id;
    settingsStore.setKeyboardLayout(id);
  }

  // Resolve the selected layout to a concrete one for preview
  let previewLayoutData = $derived(
    selectedLayout === 'auto'
      ? layouts[detectedLayoutId]
      : layouts[selectedLayout as ConcreteKeyboardLayoutId]
  );

  function getKeyLabel(key: string): string {
    if (key === ' ') return '';
    return key.toUpperCase();
  }

  // Onboarding steps with target selectors for highlighting
  const steps = [
    {
      id: 'welcome',
      title: `Welcome to ${APP_NAME}!`,
      description: 'Your personal typing tutor to help you master touch typing and become more productive.',
      icon: '👋',
      features: [
        'Learn proper touch typing technique',
        'Practice with code snippets',
        'Track your progress over time',
      ],
      targetSelector: null, // No highlight for welcome
      tooltipPosition: 'center' as const,
    },
    {
      id: 'keyboard-layout',
      title: 'Keyboard Layout',
      description: 'Select your keyboard layout so the virtual keyboard and finger guides match your physical keyboard.',
      icon: '⌨️',
      features: [],
      targetSelector: null,
      tooltipPosition: 'center' as const,
      interactive: true,
    },
    {
      id: 'sidebar',
      title: 'Navigation Sidebar',
      description: 'Use the sidebar to navigate between different sections of the app.',
      icon: '📍',
      features: [
        'Quick access to all features',
        'Visual indicators for active section',
        'Daily test completion badge',
      ],
      targetSelector: '.sidebar',
      tooltipPosition: 'right' as const,
    },
    {
      id: 'lessons',
      title: 'Lessons',
      description: 'Start with the basics and progress through increasingly challenging exercises.',
      icon: '🏠',
      features: [
        'Home row, top row, bottom row drills',
        'Numbers, symbols, and special characters',
        'Real code examples for programmers',
      ],
      targetSelector: '.nav-item:nth-child(1)',
      tooltipPosition: 'right' as const,
    },
    {
      id: 'practice',
      title: 'Quick Practice',
      description: 'Paste any text or code to practice typing in your own context.',
      icon: '⚡',
      features: [
        'Practice with your own code',
        'Save snippets for later',
        'Syntax highlighting for 15+ languages',
      ],
      targetSelector: '.nav-item:nth-child(2)',
      tooltipPosition: 'right' as const,
    },
    {
      id: 'daily',
      title: 'Daily Test',
      description: 'Take a daily typing test to track your progress over time.',
      icon: '📅',
      features: [
        'Consistent benchmark each day',
        'Build a daily practice habit',
        'See your improvement trends',
      ],
      targetSelector: '.nav-item:nth-child(3)',
      tooltipPosition: 'right' as const,
    },
    {
      id: 'course',
      title: '10 Fingers Course',
      description: 'Follow a structured curriculum to learn proper touch typing from scratch.',
      icon: '🎓',
      features: [
        '14 stages from beginner to expert',
        'Unlock stages as you improve',
        'Command line course for developers',
      ],
      targetSelector: '.nav-item:nth-child(4)',
      tooltipPosition: 'right' as const,
    },
    {
      id: 'stats',
      title: 'Statistics',
      description: 'Track every aspect of your typing with detailed analytics.',
      icon: '📊',
      features: [
        'WPM and accuracy tracking',
        'Problem key identification',
        'Activity heatmap over time',
      ],
      targetSelector: '.nav-item:nth-child(5)',
      tooltipPosition: 'right' as const,
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Adjust settings to match your preferences and keyboard layout.',
      icon: '⚙️',
      features: [
        'Multiple themes (Dark Gold, Dark Blue, Light, Midnight)',
        'Keyboard layouts (QWERTY, Dvorak, Colemak, etc.)',
        'Virtual keyboard with finger guides',
      ],
      targetSelector: '.nav-item:nth-child(6)',
      tooltipPosition: 'right' as const,
    },
    {
      id: 'mode-toggle',
      title: 'Typing Mode',
      description: 'Switch between Normal and Coder mode for different practice experiences.',
      icon: '🔄',
      features: [
        'Normal mode: Standard typing practice',
        'Coder mode: Programming-focused exercises',
        'Toggle anytime from the sidebar',
      ],
      targetSelector: '.mode-section',
      tooltipPosition: 'right' as const,
    },
    {
      id: 'ready',
      title: "You're All Set!",
      description: 'Start your typing journey and watch your skills improve day by day.',
      icon: '🚀',
      features: [
        'Begin with the 10 Fingers course for structured learning',
        'Or jump into any lesson that interests you',
        'Practice regularly for best results',
      ],
      targetSelector: null,
      tooltipPosition: 'center' as const,
    },
  ];

  let currentStep = $state(0);

  let isFirstStep = $derived(currentStep === 0);
  let isLastStep = $derived(currentStep === steps.length - 1);
  let currentStepData = $derived(steps[currentStep]);
  let progress = $derived(((currentStep + 1) / steps.length) * 100);

  function nextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++;
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
    }
  }

  function handleComplete() {
    settingsStore.completeOnboarding();
    onComplete();
  }

  function handleSkip() {
    settingsStore.completeOnboarding();
    onComplete();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowRight' || event.key === 'Enter') {
      if (isLastStep) {
        handleComplete();
      } else {
        nextStep();
      }
    } else if (event.key === 'ArrowLeft') {
      prevStep();
    } else if (event.key === 'Escape') {
      handleSkip();
    }
  }

  // Calculate tooltip position based on target element
  let tooltipStyle = $derived.by(() => {
    if (!currentStepData.targetSelector || currentStepData.tooltipPosition === 'center') {
      return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
    }

    const element = document.querySelector(currentStepData.targetSelector);
    if (!element) {
      return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
    }

    const rect = element.getBoundingClientRect();
    const padding = 20;

    switch (currentStepData.tooltipPosition) {
      case 'right':
        return `top: ${Math.max(100, rect.top)}px; left: ${rect.right + padding}px;`;
      case 'left':
        return `top: ${Math.max(100, rect.top)}px; right: ${window.innerWidth - rect.left + padding}px;`;
      case 'bottom':
        return `top: ${rect.bottom + padding}px; left: ${rect.left}px;`;
      case 'top':
        return `bottom: ${window.innerHeight - rect.top + padding}px; left: ${rect.left}px;`;
      default:
        return 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
    }
  });
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="onboarding-container" role="dialog" aria-modal="true">
  <!-- Spotlight overlay with cutout -->
  <SpotlightOverlay targetSelector={currentStepData.targetSelector} />

  <!-- Click blocker (allows clicking through cutout) -->
  <div class="click-blocker"></div>

  <!-- Tooltip/Modal -->
  <div
    class="onboarding-tooltip"
    class:centered={!currentStepData.targetSelector}
    style={tooltipStyle}
  >
    <!-- Progress bar -->
    <div class="progress-container">
      <div class="progress-bar" style="width: {progress}%"></div>
    </div>

    <!-- Skip button -->
    <button class="skip-btn" onclick={handleSkip} type="button">
      Skip tutorial
    </button>

    <!-- Step content -->
    <div class="step-content">
      <div class="step-icon">{currentStepData.icon}</div>
      <h2 class="step-title">{currentStepData.title}</h2>
      <p class="step-description">{currentStepData.description}</p>

      {#if currentStepData.features.length > 0}
        <ul class="feature-list">
          {#each currentStepData.features as feature}
            <li class="feature-item">
              <span class="feature-check">✓</span>
              <span>{feature}</span>
            </li>
          {/each}
        </ul>
      {/if}

      <!-- Keyboard layout selection (interactive step) -->
      {#if currentStepData.id === 'keyboard-layout'}
        <div class="layout-picker">
          <button
            class="layout-option"
            class:selected={selectedLayout === 'auto'}
            onclick={() => selectKeyboardLayout('auto')}
            type="button"
          >
            <span class="layout-option-name">Auto-detect</span>
            <span class="layout-option-detail">{layouts[detectedLayoutId].name}</span>
          </button>

          {#each concreteLayouts as layout}
            <button
              class="layout-option"
              class:selected={selectedLayout === layout.id}
              onclick={() => selectKeyboardLayout(layout.id)}
              type="button"
            >
              <span class="layout-option-name">{layout.name}</span>
              <span class="layout-option-detail">{layout.locale}</span>
            </button>
          {/each}
        </div>

        <!-- Keyboard preview -->
        <div class="layout-preview">
          <div class="layout-preview-header">
            <span class="layout-preview-name">{previewLayoutData.name}</span>
          </div>
          <div class="keyboard-mini-preview">
            {#each previewLayoutData.rows.slice(0, 4) as row, rowIndex}
              <div class="mini-row" class:home-row={rowIndex === 2}>
                {#each row as keyDef}
                  <div
                    class="mini-key"
                    class:home-key={keyDef.home}
                    class:wide-key={keyDef.width && keyDef.width > 1}
                    style={keyDef.width ? `flex: ${keyDef.width}` : ''}
                  >
                    {getKeyLabel(keyDef.key)}
                  </div>
                {/each}
              </div>
            {/each}
          </div>
          <div class="mini-legend">
            <div class="mini-legend-item">
              <div class="mini-legend-swatch home"></div>
              <span>Home keys</span>
            </div>
          </div>
        </div>

        <p class="layout-hint">You can change this later in Settings.</p>
      {/if}
    </div>

    <!-- Step indicators -->
    <div class="step-indicators">
      {#each steps as step, index}
        <button
          class="step-dot"
          class:active={index === currentStep}
          class:completed={index < currentStep}
          onclick={() => (currentStep = index)}
          type="button"
          aria-label="Go to step {index + 1}"
        ></button>
      {/each}
    </div>

    <!-- Navigation buttons -->
    <div class="nav-buttons">
      <button
        class="btn-secondary"
        onclick={prevStep}
        disabled={isFirstStep}
        type="button"
      >
        Back
      </button>

      {#if isLastStep}
        <button class="btn-primary" onclick={handleComplete} type="button">
          Get Started
        </button>
      {:else}
        <button class="btn-primary" onclick={nextStep} type="button">
          Next
        </button>
      {/if}
    </div>

    <!-- Keyboard hint -->
    <p class="keyboard-hint">
      Use <kbd>←</kbd> <kbd>→</kbd> arrows or <kbd>Enter</kbd> to navigate
    </p>
  </div>
</div>

<style>
  .onboarding-container {
    @apply fixed inset-0;
    z-index: 9999;
  }

  .click-blocker {
    @apply fixed inset-0;
    z-index: 9997;
  }

  .onboarding-tooltip {
    @apply fixed rounded-xl shadow-2xl;
    @apply w-full max-w-md p-6;
    background-color: var(--bg-secondary);
    z-index: 10000;
    max-height: 90vh;
    overflow-y: auto;
  }

  .onboarding-tooltip.centered {
    @apply top-1/2 left-1/2;
    transform: translate(-50%, -50%);
  }

  .progress-container {
    @apply absolute top-0 left-0 right-0 h-1 rounded-t-xl overflow-hidden;
    background-color: var(--bg-tertiary);
  }

  .progress-bar {
    @apply h-full transition-all duration-300;
    background-color: var(--accent);
  }

  .skip-btn {
    @apply absolute top-3 right-3;
    @apply text-xs px-2 py-1 rounded;
    @apply transition-colors;
    color: var(--text-muted);
  }

  .skip-btn:hover {
    color: var(--text-secondary);
    background-color: var(--bg-tertiary);
  }

  .step-content {
    @apply text-center mt-4;
  }

  .step-icon {
    @apply text-4xl mb-3;
  }

  .step-title {
    @apply text-xl font-semibold mb-2;
    color: var(--text-primary);
  }

  .step-description {
    @apply text-sm mb-4;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .feature-list {
    @apply text-left space-y-2 mb-6;
    @apply max-w-sm mx-auto;
  }

  .feature-item {
    @apply flex items-start gap-2 text-sm;
    color: var(--text-primary);
  }

  .feature-check {
    @apply flex-shrink-0 w-4 h-4 rounded-full;
    @apply flex items-center justify-center text-xs font-bold;
    background-color: rgba(126, 198, 153, 0.2);
    color: var(--success);
  }

  .step-indicators {
    @apply flex justify-center gap-1.5 mb-4;
  }

  .step-dot {
    @apply w-2 h-2 rounded-full;
    @apply transition-all duration-200;
    background-color: var(--bg-tertiary);
  }

  .step-dot:hover {
    background-color: var(--text-muted);
  }

  .step-dot.active {
    @apply w-5;
    background-color: var(--accent);
  }

  .step-dot.completed {
    background-color: var(--accent);
    opacity: 0.5;
  }

  .nav-buttons {
    @apply flex gap-3;
  }

  .btn-secondary {
    @apply flex-1 px-4 py-2 rounded-lg;
    @apply transition-colors text-sm font-medium;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: #404245;
    color: var(--text-primary);
  }

  .btn-secondary:disabled {
    @apply opacity-30 cursor-not-allowed;
  }

  .btn-primary {
    @apply flex-1 px-4 py-2 rounded-lg;
    @apply transition-colors text-sm font-medium;
    background-color: var(--accent);
    color: var(--bg-primary);
  }

  .btn-primary:hover {
    background-color: var(--accent-hover);
  }

  .keyboard-hint {
    @apply text-center text-xs mt-3;
    color: var(--text-muted);
  }

  .keyboard-hint kbd {
    @apply inline-block px-1.5 py-0.5 rounded text-xs;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .layout-picker {
    @apply flex flex-col gap-1.5 mb-4;
    @apply max-w-sm mx-auto;
  }

  .layout-option {
    @apply flex items-center justify-between;
    @apply px-3 py-2.5 rounded-lg;
    @apply text-sm text-left;
    @apply transition-all duration-150;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
    border: 2px solid transparent;
  }

  .layout-option:hover {
    color: var(--text-primary);
    background-color: #404245;
  }

  .layout-option.selected {
    border-color: var(--accent);
    color: var(--text-primary);
    background-color: rgba(226, 183, 20, 0.08);
  }

  .layout-option-name {
    @apply font-medium;
  }

  .layout-option-detail {
    @apply text-xs;
    color: var(--text-muted);
  }

  .layout-hint {
    @apply text-xs text-center mb-4;
    color: var(--text-muted);
  }

  .layout-preview {
    @apply max-w-sm mx-auto mb-4;
  }

  .layout-preview-header {
    @apply flex items-center justify-center mb-1.5;
  }

  .layout-preview-name {
    @apply text-xs font-medium;
    color: var(--text-secondary);
  }

  .keyboard-mini-preview {
    @apply flex flex-col gap-px;
    @apply rounded-lg p-2;
    background-color: var(--bg-primary);
  }

  .mini-row {
    @apply flex gap-px justify-center;
  }

  .mini-row:nth-child(2) {
    @apply ml-2;
  }

  .mini-row:nth-child(3) {
    @apply ml-4;
  }

  .mini-row:nth-child(4) {
    @apply ml-6;
  }

  .mini-key {
    @apply flex items-center justify-center;
    @apply h-5 text-[8px] font-mono;
    @apply rounded-sm;
    flex: 1;
    max-width: 22px;
    background-color: var(--bg-tertiary);
    color: var(--text-muted);
  }

  .mini-key.home-key {
    background-color: rgba(226, 183, 20, 0.2);
    color: var(--accent);
  }

  .mini-key.wide-key {
    max-width: none;
  }

  .mini-legend {
    @apply flex items-center justify-center gap-3 mt-1.5 text-[10px];
    color: var(--text-muted);
  }

  .mini-legend-item {
    @apply flex items-center gap-1;
  }

  .mini-legend-swatch {
    @apply w-2 h-2 rounded-sm;
    background-color: var(--bg-tertiary);
  }

  .mini-legend-swatch.home {
    background-color: rgba(226, 183, 20, 0.2);
  }
</style>
