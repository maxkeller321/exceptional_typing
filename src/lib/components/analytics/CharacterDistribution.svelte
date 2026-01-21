<script lang="ts">
  import type { CharacterTypeAnalysis } from '../../types';

  interface Props {
    characterTypes: CharacterTypeAnalysis[];
    totalChars: number;
  }

  let { characterTypes, totalChars }: Props = $props();

  let sortBy = $state<'speed' | 'accuracy'>('speed');

  // Colors for each type (bluish/purplish palette)
  const typeColors: Record<string, string> = {
    lowercase: '#3b82f6',    // blue
    uppercase: '#8b5cf6',    // purple
    numbers: '#06b6d4',      // cyan
    punctuation: '#6366f1',  // indigo
    whitespace: '#a855f7',   // violet
  };

  let sortedTypes = $derived.by(() => {
    const types = [...characterTypes];
    if (sortBy === 'speed') {
      return types.sort((a, b) => b.avgDelay - a.avgDelay);
    }
    return types.sort((a, b) => b.count - a.count);
  });

  // Calculate donut chart segments
  let donutSegments = $derived.by(() => {
    if (totalChars === 0) return [];

    let currentAngle = 0;
    const segments: Array<{
      type: string;
      label: string;
      percentage: number;
      count: number;
      startAngle: number;
      endAngle: number;
      color: string;
    }> = [];

    for (const type of characterTypes) {
      const percentage = (type.count / totalChars) * 100;
      const angle = (percentage / 100) * 360;

      segments.push({
        type: type.type,
        label: type.label,
        percentage,
        count: type.count,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: typeColors[type.type] || '#64748b',
      });

      currentAngle += angle;
    }

    return segments;
  });

  // SVG arc path calculation
  function describeArc(startAngle: number, endAngle: number, innerRadius: number, outerRadius: number): string {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;

    const x1 = 100 + outerRadius * Math.cos(startRad);
    const y1 = 100 + outerRadius * Math.sin(startRad);
    const x2 = 100 + outerRadius * Math.cos(endRad);
    const y2 = 100 + outerRadius * Math.sin(endRad);
    const x3 = 100 + innerRadius * Math.cos(endRad);
    const y3 = 100 + innerRadius * Math.sin(endRad);
    const x4 = 100 + innerRadius * Math.cos(startRad);
    const y4 = 100 + innerRadius * Math.sin(startRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  }

  // Hovered segment
  let hoveredSegment = $state<string | null>(null);

  function formatChars(chars: string[]): string {
    return chars.slice(0, 8).map(c => c === ' ' ? '␣' : c).join(' ');
  }
</script>

<div class="distribution-panel">
  <div class="panel-header">
    <h3 class="panel-title">Character Distribution</h3>
    <div class="toggle-group">
      <button
        class="toggle-btn"
        class:active={sortBy === 'speed'}
        onclick={() => sortBy = 'speed'}
      >
        Speed
      </button>
      <button
        class="toggle-btn"
        class:active={sortBy === 'accuracy'}
        onclick={() => sortBy = 'accuracy'}
      >
        Accuracy
      </button>
    </div>
  </div>

  <div class="distribution-content">
    <!-- Donut Chart -->
    <div class="chart-section">
      <svg class="donut-chart" viewBox="0 0 200 200">
        {#each donutSegments as segment}
          {#if segment.percentage > 0.5}
            <path
              d={describeArc(segment.startAngle, segment.endAngle, 55, 80)}
              fill={segment.color}
              class="donut-segment"
              class:hovered={hoveredSegment === segment.type}
              onmouseenter={() => hoveredSegment = segment.type}
              onmouseleave={() => hoveredSegment = null}
            />
          {/if}
        {/each}
        <!-- Center text -->
        <text x="100" y="95" class="center-label" text-anchor="middle">
          {totalChars}
        </text>
        <text x="100" y="112" class="center-sublabel" text-anchor="middle">
          chars
        </text>
      </svg>

      <!-- Hover tooltip -->
      {#if hoveredSegment}
        {@const seg = donutSegments.find(s => s.type === hoveredSegment)}
        {#if seg}
          <div class="chart-tooltip">
            <span class="tooltip-label">{seg.label}</span>
            <span class="tooltip-value">{seg.count} chars</span>
            <span class="tooltip-percent">{seg.percentage.toFixed(1)}%</span>
          </div>
        {/if}
      {/if}
    </div>

    <!-- Stats Table -->
    <div class="stats-section">
      <table class="stats-table">
        <thead>
          <tr class="stats-header">
            <th class="col-type">Type</th>
            <th class="col-count">#</th>
            <th class="col-delay">Delay</th>
            <th class="col-wpm">WPM</th>
          </tr>
        </thead>
        <tbody>
          {#each sortedTypes as type}
            <tr
              class="stats-row"
              class:hovered={hoveredSegment === type.type}
              onmouseenter={() => hoveredSegment = type.type}
              onmouseleave={() => hoveredSegment = null}
            >
              <td class="col-type">
                <span class="type-dot" style="background-color: {typeColors[type.type]}"></span>
                <span class="type-name">{type.label}</span>
              </td>
              <td class="col-count">{type.count}</td>
              <td class="col-delay">{type.avgDelay}ms</td>
              <td class="col-wpm">{type.wpm}</td>
            </tr>
          {/each}
        </tbody>
      </table>

      <!-- Characters Used -->
      {#if hoveredSegment}
        {@const hovType = characterTypes.find(t => t.type === hoveredSegment)}
        {#if hovType && hovType.chars.length > 0}
          <div class="chars-used">
            <span class="chars-label">Characters Used:</span>
            <div class="chars-list">
              {#each hovType.chars.slice(0, 12) as char}
                <span class="char-badge">{char === ' ' ? '␣' : char}</span>
              {/each}
              {#if hovType.chars.length > 12}
                <span class="chars-more">+{hovType.chars.length - 12}</span>
              {/if}
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  .distribution-panel {
    @apply bg-slate-900/50 rounded-xl p-4 border border-slate-700/50;
    overflow: hidden;
  }

  .panel-header {
    @apply flex flex-wrap items-center justify-between gap-2 mb-4;
  }

  .panel-title {
    @apply text-base font-semibold text-white;
  }

  .toggle-group {
    @apply flex bg-slate-700/50 rounded-lg p-0.5;
  }

  .toggle-btn {
    @apply px-2 py-1 text-[11px] font-medium rounded-md transition-colors;
    @apply text-slate-400 hover:text-white;
  }

  .toggle-btn.active {
    @apply bg-blue-600 text-white;
  }

  .distribution-content {
    @apply flex flex-col items-center gap-4;
  }

  @media (min-width: 500px) {
    .distribution-content {
      @apply flex-row items-start;
    }
  }

  .chart-section {
    @apply relative flex-shrink-0;
  }

  .donut-chart {
    @apply w-32 h-32;
  }

  @media (min-width: 500px) {
    .donut-chart {
      @apply w-36 h-36;
    }
  }

  .donut-segment {
    @apply transition-all duration-200 cursor-pointer;
    opacity: 0.85;
  }

  .donut-segment:hover,
  .donut-segment.hovered {
    opacity: 1;
    filter: brightness(1.1);
  }

  .center-label {
    @apply text-2xl font-bold;
    fill: white;
  }

  .center-sublabel {
    @apply text-xs;
    fill: #64748b;
  }

  .chart-tooltip {
    @apply absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2;
    @apply bg-slate-800 rounded-lg px-3 py-2 text-center pointer-events-none;
    @apply border border-slate-600;
  }

  .tooltip-label {
    @apply block text-xs text-slate-400;
  }

  .tooltip-value {
    @apply block text-sm font-semibold text-white;
  }

  .tooltip-percent {
    @apply block text-xs text-blue-400;
  }

  .stats-section {
    @apply flex-1 min-w-0 w-full overflow-x-auto;
  }

  .stats-table {
    @apply w-full text-sm;
    border-collapse: collapse;
  }

  .stats-header th {
    @apply py-2 text-xs font-medium text-slate-500 text-left;
    @apply border-b border-slate-700/50;
    white-space: nowrap;
  }

  .stats-row {
    @apply transition-colors cursor-pointer;
  }

  .stats-row:hover,
  .stats-row.hovered {
    @apply bg-slate-800/40;
  }

  .stats-row td {
    @apply py-2;
  }

  .col-type {
    @apply pr-2;
  }

  td.col-type {
    @apply flex items-center gap-2 text-slate-300;
  }

  .type-dot {
    @apply w-2.5 h-2.5 rounded-full flex-shrink-0;
  }

  .type-name {
    @apply truncate;
    max-width: 100px;
  }

  .col-count {
    @apply text-center text-slate-400 px-2;
    white-space: nowrap;
  }

  .col-delay {
    @apply text-slate-300 font-mono px-2;
    white-space: nowrap;
  }

  .col-wpm {
    @apply text-right text-slate-300 font-mono pl-2;
    white-space: nowrap;
  }

  .chars-used {
    @apply mt-4 pt-4 border-t border-slate-700/50;
  }

  .chars-label {
    @apply text-xs text-slate-500 block mb-2;
  }

  .chars-list {
    @apply flex flex-wrap gap-1;
  }

  .char-badge {
    @apply inline-flex items-center justify-center w-6 h-6;
    @apply bg-slate-700/50 rounded border border-slate-600/50;
    @apply text-xs font-mono text-slate-300;
  }

  .chars-more {
    @apply text-xs text-slate-500 self-center ml-1;
  }
</style>
