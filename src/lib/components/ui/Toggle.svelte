<script lang="ts">
  interface Props {
    checked: boolean;
    label?: string;
    description?: string;
    disabled?: boolean;
    onChange?: (checked: boolean) => void;
  }

  let { checked, label, description, disabled = false, onChange }: Props = $props();

  function handleClick() {
    if (disabled) return;
    onChange?.(!checked);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (disabled) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onChange?.(!checked);
    }
  }
</script>

<label class="toggle-wrapper" class:disabled>
  {#if label || description}
    <div class="toggle-text">
      {#if label}
        <span class="toggle-label">{label}</span>
      {/if}
      {#if description}
        <span class="toggle-description">{description}</span>
      {/if}
    </div>
  {/if}
  <button
    type="button"
    class="toggle"
    class:active={checked}
    role="switch"
    aria-checked={checked}
    {disabled}
    onclick={handleClick}
    onkeydown={handleKeyDown}
  >
    <span class="toggle-slider"></span>
  </button>
</label>

<style>
  .toggle-wrapper {
    @apply flex items-center justify-between gap-4 cursor-pointer;
  }

  .toggle-wrapper.disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .toggle-text {
    @apply flex flex-col gap-0.5;
  }

  .toggle-label {
    @apply text-sm;
    color: var(--text-primary);
  }

  .toggle-description {
    @apply text-xs;
    color: var(--text-muted);
  }

  .toggle {
    @apply relative inline-flex h-5 w-9 flex-shrink-0 rounded-full;
    @apply transition-colors duration-200 ease-in-out;
    @apply disabled:cursor-not-allowed;
    background-color: var(--bg-tertiary);
  }

  .toggle:focus {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .toggle.active {
    background-color: var(--accent);
  }

  .toggle-slider {
    @apply pointer-events-none inline-block h-4 w-4 rounded-full;
    @apply shadow-sm transform transition duration-200 ease-in-out;
    @apply translate-y-0.5;
    translate: 2px;
    background-color: var(--text-primary);
  }

  .toggle.active .toggle-slider {
    translate: 18px;
    background-color: var(--bg-primary);
  }
</style>
