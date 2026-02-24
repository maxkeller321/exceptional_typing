<script lang="ts">
  import { layouts, type KeyboardLayout } from '../data/layouts';
  import type { KeyboardLayoutId, ConcreteKeyboardLayoutId } from '../types';

  interface Props {
    value: KeyboardLayoutId;
    resolvedLayoutId: ConcreteKeyboardLayoutId;
    onchange: (layoutId: KeyboardLayoutId) => void;
  }

  let { value, resolvedLayoutId, onchange }: Props = $props();

  let isOpen = $state(false);
  let hoveredLayout = $state<KeyboardLayoutId | null>(null);

  // "Auto-detect" appears first, then the concrete layouts
  const concreteLayoutList = Object.values(layouts);

  // Resolve a layout ID to a concrete one for preview purposes
  function resolveForPreview(id: KeyboardLayoutId): ConcreteKeyboardLayoutId {
    return id === 'auto' ? resolvedLayoutId : id;
  }

  // Get the layout to preview (hovered or selected)
  const previewLayout = $derived(
    hoveredLayout
      ? layouts[resolveForPreview(hoveredLayout)]
      : layouts[resolveForPreview(value)]
  );

  // Display name for the selector button
  const displayName = $derived(
    value === 'auto'
      ? `Auto-detect (${layouts[resolvedLayoutId].name})`
      : layouts[value].name
  );

  function selectLayout(layoutId: KeyboardLayoutId): void {
    onchange(layoutId);
    isOpen = false;
    hoveredLayout = null;
  }

  function handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      isOpen = false;
      hoveredLayout = null;
    }
  }

  function getKeyLabel(key: string): string {
    if (key === ' ') return '';
    return key.toUpperCase();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="layout-selector">
  <!-- Current selection button -->
  <button
    class="selector-button"
    onclick={() => (isOpen = !isOpen)}
    aria-expanded={isOpen}
  >
    <span class="selected-name">{displayName}</span>
    <svg class="chevron" class:open={isOpen} viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if isOpen}
    <!-- Backdrop -->
    <button
      class="backdrop"
      onclick={() => { isOpen = false; hoveredLayout = null; }}
      aria-label="Close layout selector"
    ></button>

    <!-- Dropdown panel -->
    <div class="dropdown-panel">
      <div class="panel-content">
        <!-- Layout options list -->
        <div class="layout-list">
          <!-- Auto-detect option -->
          <button
            class="layout-option"
            class:selected={value === 'auto'}
            class:hovered={hoveredLayout === 'auto'}
            onclick={() => selectLayout('auto')}
            onmouseenter={() => (hoveredLayout = 'auto')}
            onmouseleave={() => (hoveredLayout = null)}
          >
            <span class="layout-name">Auto-detect</span>
            {#if value === 'auto'}
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            {/if}
          </button>

          <div class="layout-divider"></div>

          {#each concreteLayoutList as layout}
            <button
              class="layout-option"
              class:selected={value === layout.id}
              class:hovered={hoveredLayout === layout.id}
              onclick={() => selectLayout(layout.id)}
              onmouseenter={() => (hoveredLayout = layout.id)}
              onmouseleave={() => (hoveredLayout = null)}
            >
              <span class="layout-name">{layout.name}</span>
              {#if value === layout.id}
                <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              {/if}
            </button>
          {/each}
        </div>

        <!-- Visual preview -->
        <div class="preview-section">
          <div class="preview-header">
            <span class="preview-title">{previewLayout.name}</span>
            <span class="preview-locale">{previewLayout.locale}</span>
          </div>

          <div class="keyboard-preview">
            {#each previewLayout.rows.slice(0, 4) as row, rowIndex}
              <div class="preview-row" class:home-row={rowIndex === 2}>
                {#each row as keyDef}
                  <div
                    class="preview-key"
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

          <div class="preview-legend">
            <div class="legend-item">
              <div class="legend-key home"></div>
              <span>Home keys</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .layout-selector {
    @apply relative;
  }

  .selector-button {
    @apply w-full flex items-center justify-between gap-2;
    @apply px-3 py-2 rounded;
    @apply transition-colors duration-150;
    @apply text-sm;
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    border: none;
  }

  .selector-button:hover {
    background-color: #404245;
  }

  .selected-name {
    @apply truncate;
  }

  .chevron {
    @apply w-4 h-4 transition-transform duration-200;
    color: var(--text-muted);
  }

  .chevron.open {
    @apply rotate-180;
  }

  .backdrop {
    @apply fixed inset-0 z-40 bg-transparent;
  }

  .dropdown-panel {
    @apply absolute z-50 mt-2;
    @apply rounded-lg;
    @apply shadow-xl;
    @apply overflow-hidden;
    min-width: 480px;
    right: 0;
    background-color: var(--bg-secondary);
    border: 1px solid var(--bg-tertiary);
  }

  .panel-content {
    @apply flex;
  }

  .layout-list {
    @apply flex flex-col py-1;
    min-width: 160px;
    border-right: 1px solid var(--bg-tertiary);
  }

  .layout-option {
    @apply flex items-center justify-between gap-2;
    @apply px-3 py-2;
    @apply text-sm text-left;
    @apply transition-colors duration-100;
    color: var(--text-secondary);
  }

  .layout-option:hover {
    background-color: var(--bg-tertiary);
  }

  .layout-option.selected {
    color: var(--accent);
  }

  .layout-option.hovered {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .layout-divider {
    @apply my-1;
    border-top: 1px solid var(--bg-tertiary);
  }

  .layout-name {
    @apply truncate;
  }

  .check-icon {
    @apply w-4 h-4 flex-shrink-0;
    color: var(--accent);
  }

  .preview-section {
    @apply flex-1 p-3;
  }

  .preview-header {
    @apply flex items-center justify-between mb-2;
  }

  .preview-title {
    @apply text-sm font-medium;
    color: var(--text-primary);
  }

  .preview-locale {
    @apply text-xs;
    color: var(--text-muted);
  }

  .keyboard-preview {
    @apply flex flex-col gap-0.5;
    @apply rounded p-2;
    background-color: var(--bg-primary);
  }

  .preview-row {
    @apply flex gap-0.5 justify-center;
  }

  .preview-row:nth-child(2) {
    @apply ml-2;
  }

  .preview-row:nth-child(3) {
    @apply ml-4;
  }

  .preview-row:nth-child(4) {
    @apply ml-6;
  }

  .preview-key {
    @apply flex items-center justify-center;
    @apply w-5 h-5 text-[9px] font-mono;
    @apply rounded-sm;
    flex: 1;
    max-width: 20px;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .preview-key.home-key {
    background-color: rgba(226, 183, 20, 0.2);
    color: var(--accent);
  }

  .preview-key.wide-key {
    max-width: none;
  }

  .preview-legend {
    @apply flex items-center gap-3 mt-2 text-xs;
    color: var(--text-muted);
  }

  .legend-item {
    @apply flex items-center gap-1;
  }

  .legend-key {
    @apply w-2.5 h-2.5 rounded-sm;
    background-color: var(--bg-tertiary);
  }

  .legend-key.home {
    background-color: rgba(226, 183, 20, 0.2);
  }
</style>
