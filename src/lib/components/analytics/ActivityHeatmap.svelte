<script lang="ts">
  import { onMount } from 'svelte';

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

  // Generate dates for the heatmap
  let dates = $state<{ date: Date; data: DayData | null }[]>([]);

  $effect(() => {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days + 1);

    // Adjust to start on Sunday
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const result: { date: Date; data: DayData | null }[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = data.find((d) => d.date === dateStr) || null;
      result.push({ date: new Date(currentDate), data: dayData });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    dates = result;
  });

  // Group dates by week
  let weeks = $derived.by(() => {
    const result: { date: Date; data: DayData | null }[][] = [];
    let currentWeek: { date: Date; data: DayData | null }[] = [];

    for (const day of dates) {
      if (day.date.getDay() === 0 && currentWeek.length > 0) {
        result.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(day);
    }

    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  });

  // Get intensity level (0-4) based on practice time
  function getIntensity(dayData: DayData | null): number {
    if (!dayData || dayData.practiceTime === 0) return 0;

    const minutes = dayData.practiceTime / 60000;
    if (minutes < 5) return 1;
    if (minutes < 15) return 2;
    if (minutes < 30) return 3;
    return 4;
  }

  // Format tooltip
  function formatTooltip(day: { date: Date; data: DayData | null }): string {
    const dateStr = day.date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    if (!day.data || day.data.practiceTime === 0) {
      return `${dateStr}: No practice`;
    }

    const minutes = Math.round(day.data.practiceTime / 60000);
    return `${dateStr}: ${minutes}min, ${day.data.characters} chars`;
  }

  // Month labels
  let monthLabels = $derived.by(() => {
    const labels: { text: string; week: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      if (firstDay) {
        const month = firstDay.date.getMonth();
        if (month !== lastMonth) {
          labels.push({
            text: firstDay.date.toLocaleDateString('en-US', { month: 'short' }),
            week: weekIndex,
          });
          lastMonth = month;
        }
      }
    });

    return labels;
  });

  const dayLabels = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];
  const cellSize = 12;
  const cellGap = 3;
</script>

<div class="heatmap-container">
  <div class="heatmap-header">
    <h3>Activity</h3>
  </div>

  <div class="heatmap-wrapper">
    <!-- Day labels -->
    <div class="day-labels">
      {#each dayLabels as label}
        <span class="day-label" style="height: {cellSize + cellGap}px">{label}</span>
      {/each}
    </div>

    <!-- Main grid -->
    <div class="heatmap-grid">
      <!-- Month labels -->
      <div class="month-labels" style="height: 20px">
        {#each monthLabels as label}
          <span
            class="month-label"
            style="left: {label.week * (cellSize + cellGap)}px"
          >
            {label.text}
          </span>
        {/each}
      </div>

      <!-- Cells -->
      <svg
        class="heatmap-svg"
        width={weeks.length * (cellSize + cellGap)}
        height={7 * (cellSize + cellGap)}
      >
        {#each weeks as week, weekIndex}
          {#each week as day, dayIndex}
            {@const intensity = getIntensity(day.data)}
            {@const today = new Date()}
            {@const isToday =
              day.date.toDateString() === today.toDateString()}
            {@const isFuture = day.date > today}
            <rect
              x={weekIndex * (cellSize + cellGap)}
              y={day.date.getDay() * (cellSize + cellGap)}
              width={cellSize}
              height={cellSize}
              rx="2"
              class="cell level-{intensity}"
              class:today={isToday}
              class:future={isFuture}
            >
              <title>{formatTooltip(day)}</title>
            </rect>
          {/each}
        {/each}
      </svg>
    </div>
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
    @apply flex gap-2 overflow-x-auto pb-2;
  }

  .day-labels {
    @apply flex flex-col text-xs;
    @apply pt-5;
    color: var(--text-muted);
  }

  .day-label {
    @apply flex items-center;
  }

  .heatmap-grid {
    @apply relative;
  }

  .month-labels {
    @apply relative text-xs;
    color: var(--text-muted);
  }

  .month-label {
    @apply absolute top-0;
  }

  .heatmap-svg {
    @apply mt-5;
  }

  .cell {
    @apply transition-colors;
  }

  .cell.level-0 {
    fill: var(--bg-secondary);
  }

  .cell.level-1 {
    fill: rgba(99, 102, 241, 0.25);
  }

  .cell.level-2 {
    fill: rgba(99, 102, 241, 0.45);
  }

  .cell.level-3 {
    fill: rgba(99, 102, 241, 0.7);
  }

  .cell.level-4 {
    fill: #6366f1;
  }

  .cell.today {
    stroke: #6366f1;
    stroke-width: 2;
  }

  .cell.future {
    fill: var(--bg-primary);
    opacity: 0.5;
  }

  .cell:hover {
    stroke: var(--text-secondary);
    stroke-width: 1;
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
