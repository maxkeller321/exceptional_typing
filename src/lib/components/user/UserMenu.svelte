<script lang="ts">
  import { currentUser, currentUserAvatar, logout } from '../../stores/user';
  import type { UserProfile, AvatarOption } from '../../types';
  import { onMount } from 'svelte';

  let user = $state<UserProfile | null>(null);
  let avatar = $state<AvatarOption | null>(null);
  let isOpen = $state(false);

  onMount(() => {
    const unsubUser = currentUser.subscribe((u) => {
      user = u;
    });
    const unsubAvatar = currentUserAvatar.subscribe((a) => {
      avatar = a;
    });
    return () => {
      unsubUser();
      unsubAvatar();
    };
  });

  function toggleMenu() {
    isOpen = !isOpen;
  }

  function handleLogout() {
    isOpen = false;
    logout();
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      isOpen = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

{#if user && avatar}
  <div class="user-menu">
    <button class="user-button" onclick={toggleMenu} aria-expanded={isOpen}>
      <div class="avatar {avatar.color}">
        <span class="avatar-emoji">{avatar.emoji}</span>
      </div>
      <span class="user-name">{user.name}</span>
      <svg
        class="chevron"
        class:open={isOpen}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>

    {#if isOpen}
      <div class="dropdown">
        <div class="dropdown-header">
          <div class="avatar-large {avatar.color}">
            <span class="avatar-emoji-large">{avatar.emoji}</span>
          </div>
          <div class="user-info">
            <span class="name">{user.name}</span>
            <span class="since">Member since {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div class="dropdown-divider"></div>

        <button class="dropdown-item" onclick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Switch Profile
        </button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .user-menu {
    @apply relative;
  }

  .user-button {
    @apply flex items-center gap-2 w-full px-2 py-1.5 rounded;
    @apply transition-colors cursor-pointer;
    background-color: var(--bg-tertiary);
  }

  .user-button:hover {
    background-color: #404245;
  }

  .avatar {
    @apply w-7 h-7 rounded-full flex items-center justify-center;
    @apply flex-shrink-0;
  }

  .avatar-emoji {
    @apply text-base;
  }

  .user-name {
    @apply flex-1 text-left text-sm truncate;
    color: var(--text-primary);
  }

  .chevron {
    @apply w-3.5 h-3.5 transition-transform duration-200;
    color: var(--text-muted);
  }

  .chevron.open {
    @apply rotate-180;
  }

  .dropdown {
    @apply absolute bottom-full left-0 right-0 mb-1;
    @apply rounded shadow-lg;
    @apply overflow-hidden;
    @apply z-50;
    background-color: var(--bg-secondary);
    border: 1px solid var(--bg-tertiary);
  }

  .dropdown-header {
    @apply flex items-center gap-3 p-3;
  }

  .avatar-large {
    @apply w-10 h-10 rounded-full flex items-center justify-center;
    @apply flex-shrink-0;
  }

  .avatar-emoji-large {
    @apply text-xl;
  }

  .user-info {
    @apply flex flex-col;
  }

  .user-info .name {
    @apply font-medium text-sm;
    color: var(--text-primary);
  }

  .user-info .since {
    @apply text-xs;
    color: var(--text-muted);
  }

  .dropdown-divider {
    @apply h-px;
    background-color: var(--bg-tertiary);
  }

  .dropdown-item {
    @apply flex items-center gap-2 w-full px-3 py-2;
    @apply text-sm;
    @apply transition-colors;
    color: var(--text-secondary);
  }

  .dropdown-item:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }

  .dropdown-item svg {
    @apply w-4 h-4;
  }
</style>
