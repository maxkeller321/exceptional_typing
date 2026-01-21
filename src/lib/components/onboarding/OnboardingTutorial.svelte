<script lang="ts">
  import { settingsStore } from '../../stores/settings';
  import { APP_NAME } from '../../constants';

  interface Props {
    onComplete: () => void;
  }

  let { onComplete }: Props = $props();

  // Onboarding steps
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
    },
    {
      id: 'lessons',
      title: 'Structured Lessons',
      description: 'Start with the basics and progress through increasingly challenging exercises.',
      icon: '🏠',
      features: [
        'Home row, top row, bottom row drills',
        'Numbers, symbols, and special characters',
        'Real code examples for programmers',
      ],
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
    },
    {
      id: 'stats',
      title: 'Detailed Statistics',
      description: 'Track every aspect of your typing with detailed analytics.',
      icon: '📊',
      features: [
        'WPM and accuracy tracking',
        'Problem key identification',
        'Finger and hand analysis',
      ],
    },
    {
      id: 'settings',
      title: 'Customize Your Experience',
      description: 'Adjust settings to match your preferences and keyboard layout.',
      icon: '⚙️',
      features: [
        'Multiple themes (Dark Gold, Dark Blue, Light, Midnight)',
        'Keyboard layouts (QWERTY, Dvorak, Colemak, etc.)',
        'Virtual keyboard with finger guides',
      ],
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
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="onboarding-backdrop" role="dialog" aria-modal="true">
  <div class="onboarding-modal">
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

      <ul class="feature-list">
        {#each currentStepData.features as feature}
          <li class="feature-item">
            <span class="feature-check">✓</span>
            <span>{feature}</span>
          </li>
        {/each}
      </ul>
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
  .onboarding-backdrop {
    @apply fixed inset-0;
    @apply flex items-center justify-center p-4;
    @apply z-50;
    background-color: rgba(20, 21, 23, 0.95);
  }

  .onboarding-modal {
    @apply rounded-xl shadow-2xl;
    @apply w-full max-w-lg p-8;
    @apply relative;
    background-color: var(--bg-secondary);
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
    @apply absolute top-4 right-4;
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
    @apply text-5xl mb-4;
  }

  .step-title {
    @apply text-2xl font-semibold mb-3;
    color: var(--text-primary);
  }

  .step-description {
    @apply text-sm mb-6;
    color: var(--text-secondary);
    line-height: 1.6;
  }

  .feature-list {
    @apply text-left space-y-3 mb-8;
    @apply max-w-sm mx-auto;
  }

  .feature-item {
    @apply flex items-start gap-3 text-sm;
    color: var(--text-primary);
  }

  .feature-check {
    @apply flex-shrink-0 w-5 h-5 rounded-full;
    @apply flex items-center justify-center text-xs font-bold;
    background-color: rgba(126, 198, 153, 0.2);
    color: var(--success);
  }

  .step-indicators {
    @apply flex justify-center gap-2 mb-6;
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
    @apply w-6;
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
    @apply flex-1 px-4 py-2.5 rounded-lg;
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
    @apply flex-1 px-4 py-2.5 rounded-lg;
    @apply transition-colors text-sm font-medium;
    background-color: var(--accent);
    color: var(--bg-primary);
  }

  .btn-primary:hover {
    background-color: var(--accent-hover);
  }

  .keyboard-hint {
    @apply text-center text-xs mt-4;
    color: var(--text-muted);
  }

  .keyboard-hint kbd {
    @apply inline-block px-1.5 py-0.5 rounded text-xs;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }
</style>
