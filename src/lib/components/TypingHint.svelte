<script lang="ts">
  import type { TypingHint } from '../utils/hintEngine';

  interface Props {
    hint: TypingHint | null;
    onDismiss?: () => void;
  }

  let { hint, onDismiss }: Props = $props();

  let visible = $state(false);

  $effect(() => {
    if (hint) {
      visible = true;
      // Auto-dismiss after 4 seconds
      const timeout = setTimeout(() => {
        visible = false;
        onDismiss?.();
      }, 4000);
      return () => clearTimeout(timeout);
    } else {
      visible = false;
    }
  });
</script>

{#if hint && visible}
  <div
    class="typing-hint"
    class:warning={hint.type === 'warning'}
    class:success={hint.type === 'success'}
    class:info={hint.type === 'info'}
  >
    <span class="hint-icon">
      {#if hint.type === 'warning'}
        ⚠️
      {:else if hint.type === 'success'}
        ✨
      {:else}
        💡
      {/if}
    </span>
    <span class="hint-message">{hint.message}</span>
    <button class="hint-dismiss" onclick={() => onDismiss?.()}>×</button>
  </div>
{/if}

<style>
  .typing-hint {
    @apply fixed bottom-24 left-1/2 -translate-x-1/2;
    @apply flex items-center gap-3 px-4 py-3 rounded-xl;
    @apply shadow-lg backdrop-blur-sm;
    @apply animate-slide-up;
    @apply z-40;
  }

  .typing-hint.warning {
    @apply bg-yellow-900/90 border border-yellow-700/50;
    @apply text-yellow-200;
  }

  .typing-hint.success {
    @apply bg-green-900/90 border border-green-700/50;
    @apply text-green-200;
  }

  .typing-hint.info {
    @apply bg-blue-900/90 border border-blue-700/50;
    @apply text-blue-200;
  }

  .hint-icon {
    @apply text-lg;
  }

  .hint-message {
    @apply text-sm font-medium;
  }

  .hint-dismiss {
    @apply ml-2 text-lg opacity-60 hover:opacity-100;
    @apply transition-opacity;
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  :global(.animate-slide-up) {
    animation: slide-up 0.3s ease-out;
  }
</style>
