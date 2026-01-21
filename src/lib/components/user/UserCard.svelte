<script lang="ts">
  import type { UserProfile } from '../../types';
  import { getAvatarOption } from '../../stores/user';

  interface Props {
    user: UserProfile;
    onSelect?: (userId: number) => void;
    onDelete?: (userId: number) => void;
    showDelete?: boolean;
  }

  let { user, onSelect, onDelete, showDelete = false }: Props = $props();

  let avatar = $derived(getAvatarOption(user.avatar));

  function formatLastActive(date: string | null): string {
    if (!date) return 'Never played';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return d.toLocaleDateString();
  }

  function handleDeleteClick(event: MouseEvent) {
    event.stopPropagation();
    onDelete?.(user.id);
  }
</script>

<button class="user-card" onclick={() => onSelect?.(user.id)} type="button">
  <div class="avatar-container">
    <div class="avatar {avatar.color}">
      <span class="avatar-emoji">{avatar.emoji}</span>
    </div>
    <div class="avatar-glow"></div>
  </div>
  <div class="info">
    <span class="name">{user.name}</span>
    <span class="last-active">{formatLastActive(user.lastActiveAt)}</span>
  </div>
  {#if showDelete}
    <button
      class="delete-btn"
      onclick={handleDeleteClick}
      type="button"
      aria-label="Delete user"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  {/if}
</button>

<style>
  .user-card {
    @apply relative flex flex-col items-center gap-3 p-5 rounded-xl;
    @apply transition-all duration-300 cursor-pointer;
    @apply text-center;
    background-color: var(--bg-secondary);
    border: 1px solid transparent;
  }

  .user-card:hover {
    background-color: var(--bg-tertiary);
    border-color: var(--accent);
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .avatar-container {
    @apply relative;
  }

  .avatar {
    @apply w-16 h-16 rounded-full flex items-center justify-center;
    @apply relative z-10;
    @apply transition-transform duration-300;
  }

  .user-card:hover .avatar {
    transform: scale(1.1);
  }

  .avatar-glow {
    @apply absolute inset-0 rounded-full;
    @apply opacity-0 transition-opacity duration-300;
    background: radial-gradient(circle, var(--accent) 0%, transparent 70%);
    filter: blur(12px);
  }

  .user-card:hover .avatar-glow {
    @apply opacity-40;
  }

  .avatar-emoji {
    @apply text-3xl;
  }

  .info {
    @apply flex flex-col gap-1 min-w-0 w-full;
  }

  .name {
    @apply text-sm font-medium truncate;
    color: var(--text-primary);
  }

  .last-active {
    @apply text-xs;
    color: var(--text-muted);
  }

  .delete-btn {
    @apply absolute top-2 right-2 w-6 h-6 rounded-full;
    @apply flex items-center justify-center;
    @apply transition-all duration-200;
    @apply opacity-0;
    background-color: var(--bg-primary);
    color: var(--text-secondary);
  }

  .delete-btn:hover {
    background-color: rgba(202, 71, 84, 0.3);
    color: var(--error);
  }

  .user-card:hover .delete-btn {
    @apply opacity-100;
  }

  .delete-btn svg {
    @apply w-3.5 h-3.5;
  }
</style>
