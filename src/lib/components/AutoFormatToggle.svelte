<script lang="ts">
  interface Props {
    enabled: boolean;
    onChange?: (enabled: boolean) => void;
  }

  let { enabled, onChange }: Props = $props();

  function handleToggle() {
    onChange?.(!enabled);
  }
</script>

<button
  class="format-toggle"
  class:active={enabled}
  onclick={handleToggle}
  title={enabled ? 'Auto-format enabled' : 'Auto-format disabled'}
>
  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 6h16M4 12h10M4 18h14" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <span class="label">Format</span>
  <span class="status">{enabled ? 'ON' : 'OFF'}</span>
</button>

<style>
  .format-toggle {
    @apply flex items-center gap-2 px-3 py-1.5 rounded-lg;
    @apply bg-slate-800 text-slate-400 text-sm;
    @apply border border-slate-600/50;
    @apply hover:border-slate-500 hover:bg-slate-700 hover:text-slate-300;
    @apply transition-all duration-150 cursor-pointer;
  }

  .format-toggle.active {
    @apply bg-blue-600/20 text-blue-400 border-blue-500/50;
  }

  .format-toggle.active:hover {
    @apply bg-blue-600/30 border-blue-400/50;
  }

  .icon {
    @apply w-4 h-4;
  }

  .label {
    @apply text-xs font-medium;
  }

  .status {
    @apply text-[10px] font-bold px-1.5 py-0.5 rounded;
    @apply bg-slate-700/50;
  }

  .format-toggle.active .status {
    @apply bg-blue-500/30 text-blue-300;
  }
</style>
