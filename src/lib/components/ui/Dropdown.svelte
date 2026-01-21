<script lang="ts">
  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    options: Option[];
    value: string;
    placeholder?: string;
    onChange?: (value: string) => void;
  }

  let { options, value, placeholder = 'Select...', onChange }: Props = $props();

  let isOpen = $state(false);
  let dropdownRef = $state<HTMLDivElement | null>(null);

  let selectedOption = $derived(options.find((o) => o.value === value));

  function toggle() {
    isOpen = !isOpen;
  }

  function select(optionValue: string) {
    onChange?.(optionValue);
    isOpen = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      isOpen = false;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      const currentIndex = options.findIndex((o) => o.value === value);
      const nextIndex = Math.min(currentIndex + 1, options.length - 1);
      onChange?.(options[nextIndex].value);
    } else if (e.key === 'ArrowUp' && isOpen) {
      e.preventDefault();
      const currentIndex = options.findIndex((o) => o.value === value);
      const prevIndex = Math.max(currentIndex - 1, 0);
      onChange?.(options[prevIndex].value);
    }
  }

  function handleClickOutside(e: MouseEvent) {
    // Only handle when dropdown is open to avoid interfering with other clicks
    if (isOpen && dropdownRef && !dropdownRef.contains(e.target as Node)) {
      isOpen = false;
    }
  }
</script>

<svelte:window onmousedown={handleClickOutside} />

<div class="dropdown" bind:this={dropdownRef}>
  <button
    type="button"
    class="dropdown-trigger"
    class:open={isOpen}
    onclick={toggle}
    onkeydown={handleKeydown}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
  >
    <span class="dropdown-value">
      {selectedOption?.label ?? placeholder}
    </span>
    <svg class="dropdown-chevron" class:open={isOpen} viewBox="0 0 20 20" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6 8 4 4 4-4" />
    </svg>
  </button>

  {#if isOpen}
    <div class="dropdown-menu" role="listbox">
      {#each options as option}
        <button
          type="button"
          class="dropdown-option"
          class:selected={option.value === value}
          onclick={() => select(option.value)}
          role="option"
          aria-selected={option.value === value}
        >
          <span>{option.label}</span>
          {#if option.value === value}
            <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dropdown {
    @apply relative;
  }

  .dropdown-trigger {
    @apply flex items-center justify-between gap-2;
    @apply pl-3 pr-2 py-2 rounded text-sm;
    @apply cursor-pointer transition-all duration-150;
    @apply text-left w-full min-w-[140px];
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid transparent;
  }

  .dropdown-trigger:hover {
    background-color: #404245;
  }

  .dropdown-trigger.open {
    border-color: var(--accent);
  }

  .dropdown-trigger:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .dropdown-value {
    @apply truncate;
  }

  .dropdown-chevron {
    @apply w-5 h-5 flex-shrink-0;
    @apply transition-transform duration-200;
    color: var(--text-muted);
  }

  .dropdown-chevron.open {
    transform: rotate(180deg);
  }

  .dropdown-menu {
    @apply absolute z-50 mt-1;
    @apply w-full min-w-[160px] max-h-[280px] overflow-y-auto;
    @apply rounded-lg py-1;
    @apply shadow-xl;
    background-color: var(--bg-secondary);
    border: 1px solid var(--bg-tertiary);
    left: 0;
  }

  .dropdown-option {
    @apply flex items-center justify-between gap-2;
    @apply w-full px-3 py-2 text-sm text-left;
    @apply transition-colors duration-100;
    color: var(--text-secondary);
  }

  .dropdown-option:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .dropdown-option.selected {
    color: var(--accent);
  }

  .check-icon {
    @apply w-4 h-4 flex-shrink-0;
    color: var(--accent);
  }
</style>
