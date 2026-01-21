<script lang="ts">
  import { availableThemes, type CodeTheme } from '../utils/highlight';

  interface Props {
    value: CodeTheme;
    onChange?: (theme: CodeTheme) => void;
  }

  let { value, onChange }: Props = $props();

  function handleChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    onChange?.(select.value as CodeTheme);
  }
</script>

<div class="theme-selector">
  <label class="selector-label">
    <span class="label-text">Theme</span>
    <select class="selector-input" {value} onchange={handleChange}>
      {#each availableThemes as theme}
        <option value={theme.value}>{theme.label}</option>
      {/each}
    </select>
  </label>
</div>

<style>
  .theme-selector {
    @apply flex items-center;
  }

  .selector-label {
    @apply flex items-center gap-3;
  }

  .label-text {
    @apply text-xs uppercase tracking-wider font-medium;
    color: var(--text-muted);
  }

  .selector-input {
    @apply text-sm rounded pl-3 pr-8 py-1.5;
    @apply cursor-pointer;
    @apply transition-all duration-150;
    appearance: none;
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid transparent;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23646669' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.25rem 1.25rem;
  }

  .selector-input:hover {
    background-color: #404245;
  }

  .selector-input:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .selector-input option {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }
</style>
