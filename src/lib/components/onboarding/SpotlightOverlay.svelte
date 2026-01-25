<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    targetSelector: string | null;
    padding?: number;
    borderRadius?: number;
  }

  let { targetSelector, padding = 8, borderRadius = 8 }: Props = $props();

  let cutoutRect = $state<{ x: number; y: number; width: number; height: number } | null>(null);
  let windowWidth = $state(0);
  let windowHeight = $state(0);

  function updateCutout() {
    if (!targetSelector) {
      cutoutRect = null;
      return;
    }

    const element = document.querySelector(targetSelector);
    if (!element) {
      cutoutRect = null;
      return;
    }

    const rect = element.getBoundingClientRect();
    cutoutRect = {
      x: rect.left - padding,
      y: rect.top - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    };
  }

  function updateWindowSize() {
    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;
  }

  onMount(() => {
    updateWindowSize();
    updateCutout();

    window.addEventListener('resize', updateWindowSize);
    window.addEventListener('resize', updateCutout);
    window.addEventListener('scroll', updateCutout, true);

    // Use MutationObserver to handle DOM changes
    const observer = new MutationObserver(updateCutout);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('resize', updateWindowSize);
      window.removeEventListener('resize', updateCutout);
      window.removeEventListener('scroll', updateCutout, true);
      observer.disconnect();
    };
  });

  // Recalculate when target changes
  $effect(() => {
    if (targetSelector) {
      // Small delay to ensure DOM is updated
      setTimeout(updateCutout, 50);
    } else {
      cutoutRect = null;
    }
  });

  // Create the SVG path for the spotlight effect
  let maskPath = $derived.by(() => {
    if (!cutoutRect || windowWidth === 0 || windowHeight === 0) {
      return `M 0 0 L ${windowWidth} 0 L ${windowWidth} ${windowHeight} L 0 ${windowHeight} Z`;
    }

    const { x, y, width, height } = cutoutRect;
    const r = borderRadius;

    // Outer rectangle (full screen)
    // Inner rounded rectangle (cutout) - drawn counter-clockwise to create hole
    return `
      M 0 0
      L ${windowWidth} 0
      L ${windowWidth} ${windowHeight}
      L 0 ${windowHeight}
      Z
      M ${x + r} ${y}
      L ${x + width - r} ${y}
      Q ${x + width} ${y} ${x + width} ${y + r}
      L ${x + width} ${y + height - r}
      Q ${x + width} ${y + height} ${x + width - r} ${y + height}
      L ${x + r} ${y + height}
      Q ${x} ${y + height} ${x} ${y + height - r}
      L ${x} ${y + r}
      Q ${x} ${y} ${x + r} ${y}
      Z
    `;
  });
</script>

<svg
  class="spotlight-overlay"
  viewBox="0 0 {windowWidth} {windowHeight}"
  preserveAspectRatio="none"
>
  <path
    d={maskPath}
    fill="rgba(20, 21, 23, 0.85)"
    fill-rule="evenodd"
  />
  {#if cutoutRect}
    <rect
      x={cutoutRect.x}
      y={cutoutRect.y}
      width={cutoutRect.width}
      height={cutoutRect.height}
      rx={borderRadius}
      ry={borderRadius}
      fill="none"
      stroke="var(--accent)"
      stroke-width="2"
    />
  {/if}
</svg>

<style>
  .spotlight-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9998;
  }
</style>
