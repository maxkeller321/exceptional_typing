<script lang="ts">
  import Heatmap from 'svelte5-heatmap';

  interface DayData {
    date: string;
    practiceTime: number; // ms
    characters: number;
    sessions: number;
  }

  interface Props {
    data?: DayData[];
    days?: number;
  }

  let { data = [], days = 365 }: Props = $props();

  // Convert data array to object format expected by svelte5-heatmap
  // The library expects { 'YYYY-MM-DD': value, ... }
  // We convert practice time to intensity levels (0-4) for better visualization
  let heatmapData = $derived.by(() => {
    const result: Record<string, number> = {};

    for (const day of data) {
      if (day.practiceTime > 0) {
        const minutes = day.practiceTime / 60000;
        // Convert to intensity level 1-4 based on practice time
        let intensity: number;
        if (minutes < 5) intensity = 1;
        else if (minutes < 15) intensity = 2;
        else if (minutes < 30) intensity = 3;
        else intensity = 4;

        result[day.date] = intensity;
      }
    }

    return result;
  });

  // Get the year to display - use current year by default
  const currentYear = new Date().getFullYear();

  // Custom colors matching the app's theme (indigo/purple tones)
  const colors = [
    'var(--bg-secondary)',      // level 0 - no activity
    'rgba(99, 102, 241, 0.25)', // level 1 - light
    'rgba(99, 102, 241, 0.45)', // level 2 - medium
    'rgba(99, 102, 241, 0.7)',  // level 3 - high
    '#6366f1',                  // level 4 - max
  ];

  // Handle cell click to show details
  function handleClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    const date = target.dataset.date;
    const value = target.dataset.value;

    if (date) {
      const dayData = data.find(d => d.date === date);
      if (dayData && dayData.practiceTime > 0) {
        const minutes = Math.round(dayData.practiceTime / 60000);
        const formattedDate = new Date(date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        // Could show a tooltip or modal here in the future
        console.log(`${formattedDate}: ${minutes}min, ${dayData.characters} chars`);
      }
    }
  }
</script>

<div class="heatmap-container">
  <div class="heatmap-header">
    <h3>Activity</h3>
  </div>

  <div class="heatmap-wrapper">
    <Heatmap
      data={heatmapData}
      year={currentYear}
      {colors}
      lday={true}
      lmonth={true}
      onclick={handleClick}
    />
  </div>

  <!-- Legend -->
  <div class="heatmap-legend">
    <span class="legend-label">Less</span>
    <div class="legend-cells">
      {#each [0, 1, 2, 3, 4] as level}
        <div class="legend-cell level-{level}"></div>
      {/each}
    </div>
    <span class="legend-label">More</span>
  </div>
</div>

<style>
  .heatmap-container {
    @apply rounded-xl p-4;
    background-color: var(--bg-tertiary);
  }

  .heatmap-header {
    @apply mb-4;
  }

  .heatmap-header h3 {
    @apply text-sm font-medium;
    color: var(--text-primary);
  }

  .heatmap-wrapper {
    @apply overflow-x-auto pb-2;
    font-size: 11px; /* Controls cell size since library uses em units */
  }

  /* Style the library's heatmap table */
  .heatmap-wrapper :global(.Heatmap) {
    color: var(--text-muted);
    border-collapse: separate;
    border-spacing: 3px;
  }

  .heatmap-wrapper :global(.Heatmap td[data-date]) {
    border-radius: 2px;
    /* Add visible grid lines for better structure */
    outline: 1px solid rgba(255, 255, 255, 0.08);
    transition: outline-color 0.15s;
  }

  .heatmap-wrapper :global(.Heatmap td[data-date]:hover) {
    outline: 2px solid var(--text-secondary);
  }

  .heatmap-legend {
    @apply flex items-center gap-2 mt-4 text-xs;
    color: var(--text-muted);
  }

  .legend-cells {
    @apply flex gap-1;
  }

  .legend-cell {
    @apply w-3 h-3 rounded-sm;
  }

  .legend-cell.level-0 {
    background-color: var(--bg-secondary);
  }

  .legend-cell.level-1 {
    background-color: rgba(99, 102, 241, 0.25);
  }

  .legend-cell.level-2 {
    background-color: rgba(99, 102, 241, 0.45);
  }

  .legend-cell.level-3 {
    background-color: rgba(99, 102, 241, 0.7);
  }

  .legend-cell.level-4 {
    background-color: #6366f1;
  }
</style>
