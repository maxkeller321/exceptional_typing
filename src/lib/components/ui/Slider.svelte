<script lang="ts">
  interface Props {
    value: number;
    min: number;
    max: number;
    step?: number;
    label?: string;
    description?: string;
    showValue?: boolean;
    unit?: string;
    disabled?: boolean;
    onChange?: (value: number) => void;
  }

  let {
    value,
    min,
    max,
    step = 1,
    label,
    description,
    showValue = true,
    unit = '',
    disabled = false,
    onChange,
  }: Props = $props();

  function handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    onChange?.(parseFloat(input.value));
  }

  // Calculate percentage for custom track fill
  let percentage = $derived(((value - min) / (max - min)) * 100);
</script>

<div class="slider-wrapper" class:disabled>
  {#if label || description}
    <div class="slider-header">
      <div class="slider-labels">
        {#if label}
          <span class="slider-label">{label}</span>
        {/if}
        {#if description}
          <span class="slider-description">{description}</span>
        {/if}
      </div>
      {#if showValue}
        <span class="slider-value">{value}{unit}</span>
      {/if}
    </div>
  {/if}
  <div class="slider-track-wrapper">
    <input
      type="range"
      {min}
      {max}
      {step}
      {value}
      {disabled}
      oninput={handleInput}
      class="slider"
      style="--percentage: {percentage}%"
    />
  </div>
  <div class="slider-range">
    <span>{min}{unit}</span>
    <span>{max}{unit}</span>
  </div>
</div>

<style>
  .slider-wrapper {
    @apply flex flex-col gap-2;
  }

  .slider-wrapper.disabled {
    @apply opacity-50;
  }

  .slider-header {
    @apply flex items-center justify-between;
  }

  .slider-labels {
    @apply flex flex-col gap-0.5;
  }

  .slider-label {
    @apply text-sm;
    color: var(--text-primary);
  }

  .slider-description {
    @apply text-xs;
    color: var(--text-muted);
  }

  .slider-value {
    @apply text-sm font-medium tabular-nums;
    color: var(--accent);
  }

  .slider-track-wrapper {
    @apply relative;
  }

  .slider {
    @apply w-full h-1.5 rounded-full appearance-none cursor-pointer;
    background: linear-gradient(
      to right,
      var(--accent) 0%,
      var(--accent) var(--percentage),
      var(--bg-tertiary) var(--percentage),
      var(--bg-tertiary) 100%
    );
  }

  .slider:disabled {
    @apply cursor-not-allowed;
  }

  .slider:focus {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .slider::-webkit-slider-thumb {
    @apply appearance-none w-3.5 h-3.5 rounded-full;
    @apply shadow-sm cursor-pointer;
    @apply transition-transform duration-150;
    background-color: var(--text-primary);
    border: 2px solid var(--accent);
  }

  .slider::-webkit-slider-thumb:hover {
    @apply scale-110;
  }

  .slider::-moz-range-thumb {
    @apply w-3.5 h-3.5 rounded-full;
    @apply shadow-sm cursor-pointer;
    background-color: var(--text-primary);
    border: 2px solid var(--accent);
  }

  .slider-range {
    @apply flex justify-between text-xs;
    color: var(--text-muted);
  }
</style>
