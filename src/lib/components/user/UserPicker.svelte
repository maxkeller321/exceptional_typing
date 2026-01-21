<script lang="ts">
  import { users, loadUsers, selectUser } from '../../stores/user';
  import type { UserProfile } from '../../types';
  import UserCard from './UserCard.svelte';
  import CreateUserModal from './CreateUserModal.svelte';
  import AppIcon from '../AppIcon.svelte';
  import { APP_NAME } from '../../constants';
  import { onMount } from 'svelte';

  let userList = $state<UserProfile[]>([]);
  let showCreateModal = $state(false);

  onMount(() => {
    loadUsers();
    const unsub = users.subscribe((list) => {
      userList = list;
    });
    return unsub;
  });

  function handleSelectUser(userId: number) {
    selectUser(userId);
  }

  function handleCreateUser(userId: number) {
    showCreateModal = false;
    selectUser(userId);
  }
</script>

<div class="user-picker">
  <div class="background-decoration"></div>

  <div class="picker-content">
    <div class="picker-header">
      <div class="logo-container">
        <AppIcon size={56} />
      </div>
      <h1 class="title">{APP_NAME}</h1>
      <p class="subtitle">Select your profile to continue</p>
    </div>

    <div class="users-section">
      <div class="users-grid">
        {#each userList as user (user.id)}
          <UserCard {user} onSelect={handleSelectUser} />
        {/each}

        <button class="add-user-card" onclick={() => (showCreateModal = true)}>
          <div class="add-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span class="add-label">New Profile</span>
        </button>
      </div>

      {#if userList.length === 0}
        <p class="empty-hint">Create your first profile to get started!</p>
      {/if}
    </div>
  </div>

  <footer class="picker-footer">
    <p>Your progress is saved locally on this device</p>
  </footer>
</div>

{#if showCreateModal}
  <CreateUserModal
    onClose={() => (showCreateModal = false)}
    onCreate={handleCreateUser}
  />
{/if}

<style>
  .user-picker {
    @apply min-h-screen flex flex-col items-center justify-center;
    @apply p-8 relative overflow-hidden;
    background-color: var(--bg-primary);
  }

  .background-decoration {
    @apply absolute inset-0 pointer-events-none;
    background: radial-gradient(
      ellipse 80% 50% at 50% -20%,
      rgba(226, 183, 20, 0.08) 0%,
      transparent 50%
    );
  }

  .picker-content {
    @apply flex flex-col items-center relative z-10;
  }

  .picker-header {
    @apply text-center mb-12;
  }

  .logo-container {
    @apply mb-4 flex justify-center;
  }

  .title {
    @apply text-4xl font-medium mb-2;
    color: var(--accent);
    letter-spacing: -0.02em;
  }

  .subtitle {
    @apply text-base;
    color: var(--text-secondary);
  }

  .users-section {
    @apply flex flex-col items-center;
  }

  .users-grid {
    @apply grid gap-4;
    @apply grid-cols-2 sm:grid-cols-3 lg:grid-cols-4;
  }

  .add-user-card {
    @apply flex flex-col items-center justify-center gap-3 p-5 rounded-xl;
    @apply transition-all duration-300;
    @apply cursor-pointer;
    border: 2px dashed var(--text-muted);
    background-color: transparent;
    min-height: 140px;
  }

  .add-user-card:hover {
    border-color: var(--accent);
    background-color: rgba(226, 183, 20, 0.05);
    transform: translateY(-4px);
  }

  .add-icon {
    @apply w-12 h-12 rounded-full;
    @apply flex items-center justify-center;
    @apply transition-all duration-300;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .add-icon svg {
    @apply w-6 h-6;
  }

  .add-user-card:hover .add-icon {
    background-color: var(--accent);
    color: var(--bg-primary);
    transform: scale(1.1);
  }

  .add-label {
    @apply text-sm font-medium;
    color: var(--text-secondary);
  }

  .add-user-card:hover .add-label {
    color: var(--accent);
  }

  .empty-hint {
    @apply mt-8 text-center text-sm;
    color: var(--text-muted);
  }

  .picker-footer {
    @apply mt-16 text-center relative z-10;
  }

  .picker-footer p {
    @apply text-xs;
    color: var(--text-muted);
  }
</style>
