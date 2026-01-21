<script lang="ts">
  interface Props {
    size?: number;
    class?: string;
  }

  let { size = 32, class: className = '' }: Props = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 64 64"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  class={className}
  aria-hidden="true"
>
  <!-- Background rounded square -->
  <rect
    x="4"
    y="12"
    width="56"
    height="40"
    rx="8"
    fill="url(#keyboard-gradient)"
  />

  <!-- Keyboard keys - top row -->
  <rect x="10" y="18" width="8" height="6" rx="1.5" fill="#1e293b" opacity="0.8" />
  <rect x="20" y="18" width="8" height="6" rx="1.5" fill="#1e293b" opacity="0.8" />
  <rect x="30" y="18" width="8" height="6" rx="1.5" fill="#1e293b" opacity="0.8" />
  <rect x="40" y="18" width="8" height="6" rx="1.5" fill="#1e293b" opacity="0.8" />

  <!-- Keyboard keys - middle row -->
  <rect x="12" y="26" width="8" height="6" rx="1.5" fill="#1e293b" opacity="0.8" />
  <rect x="22" y="26" width="8" height="6" rx="1.5" fill="#1e293b" opacity="0.8" />
  <rect x="32" y="26" width="8" height="6" rx="1.5" fill="#1e293b" opacity="0.8" />
  <rect x="42" y="26" width="8" height="6" rx="1.5" fill="#1e293b" opacity="0.8" />

  <!-- Keyboard keys - bottom row (space bar) -->
  <rect x="16" y="34" width="32" height="6" rx="1.5" fill="#1e293b" opacity="0.8" />

  <!-- Highlighted key (the "exceptional" touch) -->
  <rect x="30" y="18" width="8" height="6" rx="1.5" fill="url(#key-highlight)" />

  <!-- Sparkle/star effect -->
  <g filter="url(#glow)">
    <path
      d="M52 8L53.5 12L58 13.5L53.5 15L52 19L50.5 15L46 13.5L50.5 12L52 8Z"
      fill="#fbbf24"
    />
    <path
      d="M12 4L13 6.5L16 7.5L13 8.5L12 11L11 8.5L8 7.5L11 6.5L12 4Z"
      fill="#60a5fa"
    />
  </g>

  <!-- Cursor/caret indicator -->
  <rect x="34" y="44" width="2" height="8" rx="1" fill="#60a5fa">
    <animate
      attributeName="opacity"
      values="1;0.3;1"
      dur="1s"
      repeatCount="indefinite"
    />
  </rect>

  <!-- Gradient definitions -->
  <defs>
    <linearGradient id="keyboard-gradient" x1="4" y1="12" x2="60" y2="52" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#8b5cf6" />
    </linearGradient>

    <linearGradient id="key-highlight" x1="30" y1="18" x2="38" y2="24" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>

    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
</svg>
