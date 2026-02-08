<script lang="ts">
  import type { KeystrokeEvent } from '../../types';

  interface Props {
    keystrokes: KeystrokeEvent[];
  }

  let { keystrokes }: Props = $props();

  // Calculate WPM data points over time
  let wpmData = $derived.by(() => {
    if (keystrokes.length < 2) return [];

    const startTime = keystrokes[0].timestamp;
    const windowSize = 1000; // 1 second rolling window
    const stepSize = 500; // Calculate every 500ms

    const endTime = keystrokes[keystrokes.length - 1].timestamp;
    const points: Array<{ time: number; wpm: number; timeLabel: string }> = [];

    for (let t = startTime + windowSize; t <= endTime; t += stepSize) {
      // Count characters typed in the window
      const windowStart = t - windowSize;
      const charsInWindow = keystrokes.filter(
        k => k.timestamp >= windowStart && k.timestamp <= t
      ).length;

      // WPM = (chars / 5) / (window in minutes)
      const wpm = Math.round((charsInWindow / 5) / (windowSize / 60000));
      const elapsedSeconds = (t - startTime) / 1000;
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = Math.floor(elapsedSeconds % 60);
      const timeLabel = `${minutes}:${seconds.toString().padStart(2, '0')}`;

      points.push({ time: t - startTime, wpm, timeLabel });
    }

    return points;
  });

  // Chart dimensions
  const width = 500;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Scales
  let xScale = $derived.by(() => {
    if (wpmData.length === 0) return { min: 0, max: 1, scale: (v: number) => 0 };
    const max = Math.max(...wpmData.map(d => d.time));
    return {
      min: 0,
      max,
      scale: (v: number) => (v / max) * chartWidth,
    };
  });

  let yScale = $derived.by(() => {
    if (wpmData.length === 0) return { min: 0, max: 100, scale: (v: number) => chartHeight };
    const values = wpmData.map(d => d.wpm);
    const min = Math.max(0, Math.min(...values) - 10);
    const max = Math.max(...values) + 10;
    return {
      min,
      max,
      scale: (v: number) => chartHeight - ((v - min) / (max - min)) * chartHeight,
    };
  });

  // Generate path for line
  let linePath = $derived.by(() => {
    if (wpmData.length === 0) return '';

    return wpmData
      .map((d, i) => {
        const x = xScale.scale(d.time);
        const y = yScale.scale(d.wpm);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  });

  // Generate path for area fill
  let areaPath = $derived.by(() => {
    if (wpmData.length === 0) return '';

    const line = wpmData
      .map((d, i) => {
        const x = xScale.scale(d.time);
        const y = yScale.scale(d.wpm);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');

    // Close the area
    const lastX = xScale.scale(wpmData[wpmData.length - 1].time);
    const firstX = xScale.scale(wpmData[0].time);

    return `${line} L ${lastX} ${chartHeight} L ${firstX} ${chartHeight} Z`;
  });

  // Y-axis ticks
  let yTicks = $derived.by(() => {
    const range = yScale.max - yScale.min;
    const step = Math.ceil(range / 5 / 10) * 10; // Round to nearest 10
    const ticks: number[] = [];
    for (let v = Math.ceil(yScale.min / step) * step; v <= yScale.max; v += step) {
      ticks.push(v);
    }
    return ticks;
  });

  // X-axis ticks (time labels)
  let xTicks = $derived.by(() => {
    if (wpmData.length === 0) return [];

    // Show ~5 ticks
    const tickCount = Math.min(5, wpmData.length);
    const step = Math.floor(wpmData.length / tickCount);
    const ticks: Array<{ time: number; label: string; x: number }> = [];

    for (let i = 0; i < wpmData.length; i += step) {
      const d = wpmData[i];
      ticks.push({
        time: d.time,
        label: d.timeLabel,
        x: xScale.scale(d.time),
      });
    }

    // Always include last point
    const last = wpmData[wpmData.length - 1];
    if (ticks.length === 0 || ticks[ticks.length - 1].time !== last.time) {
      ticks.push({
        time: last.time,
        label: last.timeLabel,
        x: xScale.scale(last.time),
      });
    }

    return ticks;
  });

  // Top speed marker
  let topSpeed = $derived.by(() => {
    if (wpmData.length === 0) return null;

    let maxWpm = 0;
    let maxPoint = wpmData[0];
    for (const d of wpmData) {
      if (d.wpm > maxWpm) {
        maxWpm = d.wpm;
        maxPoint = d;
      }
    }

    return {
      wpm: maxWpm,
      x: xScale.scale(maxPoint.time),
      y: yScale.scale(maxPoint.wpm),
      timeLabel: maxPoint.timeLabel,
    };
  });

  // Hover state
  let hoveredIndex = $state<number | null>(null);
  let hoveredPoint = $derived.by(() => {
    if (hoveredIndex === null || wpmData.length === 0) return null;
    const d = wpmData[hoveredIndex];
    return {
      wpm: d.wpm,
      x: xScale.scale(d.time),
      y: yScale.scale(d.wpm),
      timeLabel: d.timeLabel,
    };
  });

  function handleMouseMove(event: MouseEvent) {
    if (wpmData.length === 0) return;

    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left - padding.left;

    // Find closest point
    let closestIndex = 0;
    let closestDist = Infinity;

    for (let i = 0; i < wpmData.length; i++) {
      const px = xScale.scale(wpmData[i].time);
      const dist = Math.abs(px - x);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    }

    hoveredIndex = closestIndex;
  }

  function handleMouseLeave() {
    hoveredIndex = null;
  }

  // Average WPM
  let avgWpm = $derived.by(() => {
    if (wpmData.length === 0) return 0;
    return Math.round(wpmData.reduce((sum, d) => sum + d.wpm, 0) / wpmData.length);
  });
</script>

<div class="wpm-chart-panel">
  <div class="panel-header">
    <h3 class="panel-title">Speed Over Time</h3>
    <div class="header-stats">
      <span class="stat">
        <span class="stat-label">Avg</span>
        <span class="stat-value">{avgWpm} wpm</span>
      </span>
      {#if topSpeed}
        <span class="stat">
          <span class="stat-label">Peak</span>
          <span class="stat-value highlight">{topSpeed!.wpm} wpm</span>
        </span>
      {/if}
    </div>
  </div>

  <div class="chart-container">
    {#if wpmData.length > 1}
      <svg
        class="chart-svg"
        viewBox="0 0 {width} {height}"
        role="img"
        aria-label="WPM over time chart"
        onmousemove={handleMouseMove}
        onmouseleave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.05" />
          </linearGradient>
        </defs>

        <g transform="translate({padding.left}, {padding.top})">
          <!-- Grid lines -->
          {#each yTicks as tick}
            <line
              x1="0"
              y1={yScale.scale(tick)}
              x2={chartWidth}
              y2={yScale.scale(tick)}
              class="grid-line"
            />
          {/each}

          <!-- Area fill -->
          <path d={areaPath} fill="url(#areaGradient)" />

          <!-- Line -->
          <path d={linePath} class="chart-line" />

          <!-- Data points -->
          {#each wpmData as point, i}
            <circle
              cx={xScale.scale(point.time)}
              cy={yScale.scale(point.wpm)}
              r={hoveredIndex === i ? 5 : 3}
              class="data-point"
              class:hovered={hoveredIndex === i}
            />
          {/each}

          <!-- Top speed marker -->
          {#if topSpeed}
            {@const top = topSpeed!}
            <g transform="translate({top.x}, {top.y - 12})">
              <rect
                x="-28"
                y="-16"
                width="56"
                height="20"
                rx="4"
                class="top-speed-badge"
              />
              <text x="0" y="-2" text-anchor="middle" class="top-speed-text">
                Top Speed
              </text>
            </g>
          {/if}

          <!-- Hover tooltip -->
          {#if hoveredPoint}
            {@const hp = hoveredPoint!}
            <g class="tooltip-group">
              <line
                x1={hp.x}
                y1="0"
                x2={hp.x}
                y2={chartHeight}
                class="hover-line"
              />
              <g transform="translate({hp.x}, {hp.y - 40})">
                <rect
                  x="-35"
                  y="-8"
                  width="70"
                  height="36"
                  rx="4"
                  class="tooltip-bg"
                />
                <text x="0" y="6" text-anchor="middle" class="tooltip-wpm">
                  {hp.wpm} wpm
                </text>
                <text x="0" y="20" text-anchor="middle" class="tooltip-time">
                  {hp.timeLabel}
                </text>
              </g>
            </g>
          {/if}

          <!-- Y-axis -->
          <g class="y-axis">
            {#each yTicks as tick}
              <text
                x="-8"
                y={yScale.scale(tick) + 4}
                text-anchor="end"
                class="axis-label"
              >
                {tick}
              </text>
            {/each}
          </g>

          <!-- X-axis -->
          <g class="x-axis" transform="translate(0, {chartHeight})">
            {#each xTicks as tick}
              <text
                x={tick.x}
                y="18"
                text-anchor="middle"
                class="axis-label"
              >
                {tick.label}
              </text>
            {/each}
          </g>
        </g>
      </svg>
    {:else}
      <div class="no-data">
        <span>Not enough data for chart</span>
      </div>
    {/if}
  </div>
</div>

<style>
  .wpm-chart-panel {
    @apply bg-slate-900/50 rounded-xl p-6 border border-slate-700/50;
  }

  .panel-header {
    @apply flex items-center justify-between mb-4;
  }

  .panel-title {
    @apply text-lg font-semibold text-white;
  }

  .header-stats {
    @apply flex gap-4;
  }

  .stat {
    @apply flex items-center gap-2;
  }

  .stat-label {
    @apply text-xs text-slate-500 uppercase;
  }

  .stat-value {
    @apply text-sm font-semibold text-slate-300;
  }

  .stat-value.highlight {
    @apply text-blue-400;
  }

  .chart-container {
    @apply relative;
  }

  .chart-svg {
    @apply w-full h-auto;
  }

  .grid-line {
    stroke: #334155;
    stroke-width: 1;
    stroke-dasharray: 4 4;
  }

  .chart-line {
    fill: none;
    stroke: #3b82f6;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .data-point {
    fill: #3b82f6;
    stroke: #1e3a8a;
    stroke-width: 1.5;
    transition: r 0.15s ease;
  }

  .data-point.hovered {
    fill: #60a5fa;
    stroke: #3b82f6;
  }

  .top-speed-badge {
    fill: #1e3a8a;
    stroke: #3b82f6;
    stroke-width: 1;
  }

  .top-speed-text {
    fill: #60a5fa;
    font-size: 9px;
    font-weight: 600;
  }

  .hover-line {
    stroke: #475569;
    stroke-width: 1;
    stroke-dasharray: 4 2;
  }

  .tooltip-bg {
    fill: #1e293b;
    stroke: #475569;
    stroke-width: 1;
  }

  .tooltip-wpm {
    fill: white;
    font-size: 12px;
    font-weight: 600;
  }

  .tooltip-time {
    fill: #94a3b8;
    font-size: 10px;
  }

  .axis-label {
    fill: #64748b;
    font-size: 10px;
  }

  .no-data {
    @apply flex items-center justify-center h-32 text-slate-500 text-sm;
  }
</style>
