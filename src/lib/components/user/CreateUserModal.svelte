<script lang="ts">
  import type { AvatarType } from '../../types';
  import { avatarOptions, createUser, isUsernameAvailable } from '../../stores/user';

  interface Props {
    onClose: () => void;
    onCreate: (userId: number) => void;
  }

  let { onClose, onCreate }: Props = $props();

  let name = $state('');
  let selectedAvatar = $state<AvatarType>('robot');
  let error = $state('');

  let isValid = $derived(name.trim().length >= 1 && name.trim().length <= 20);

  function handleSubmit(event: Event) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      error = 'Please enter a name';
      return;
    }

    if (trimmedName.length > 20) {
      error = 'Name must be 20 characters or less';
      return;
    }

    if (!isUsernameAvailable(trimmedName)) {
      error = 'This name is already taken';
      return;
    }

    const newUser = createUser(trimmedName, selectedAvatar);
    onCreate(newUser.id);
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true" tabindex="-1">
  <div class="modal">
    <div class="modal-header">
      <h2>Create Profile</h2>
      <button class="close-btn" onclick={onClose} type="button" aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <form onsubmit={handleSubmit}>
      <div class="form-group">
        <label for="name">Name</label>
        <input
          type="text"
          id="name"
          bind:value={name}
          placeholder="Enter your name"
          maxlength="20"
          autocomplete="off"
        />
        {#if error}
          <span class="error">{error}</span>
        {/if}
      </div>

      <div class="form-group">
        <span class="avatar-label" id="avatar-label">Choose an Avatar</span>
        <div class="avatar-grid" role="radiogroup" aria-labelledby="avatar-label">
          {#each avatarOptions as avatar}
            <button
              type="button"
              class="avatar-option {avatar.color}"
              class:selected={selectedAvatar === avatar.id}
              onclick={() => (selectedAvatar = avatar.id)}
              aria-label={avatar.label}
            >
              <span class="avatar-emoji">{avatar.emoji}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="modal-actions">
        <button type="button" class="btn-secondary" onclick={onClose}>
          Cancel
        </button>
        <button type="submit" class="btn-primary" disabled={!isValid}>
          Create Profile
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .modal-backdrop {
    @apply fixed inset-0;
    @apply flex items-center justify-center p-4;
    @apply z-50;
    background-color: rgba(35, 37, 40, 0.9);
  }

  .modal {
    @apply rounded-lg shadow-xl;
    @apply w-full max-w-sm p-5;
    background-color: var(--bg-secondary);
  }

  .modal-header {
    @apply flex items-center justify-between mb-5;
  }

  .modal-header h2 {
    @apply text-lg font-medium;
    color: var(--text-primary);
  }

  .close-btn {
    @apply w-7 h-7 rounded flex items-center justify-center;
    @apply transition-colors;
    color: var(--text-secondary);
  }

  .close-btn:hover {
    color: var(--text-primary);
    background-color: var(--bg-tertiary);
  }

  .close-btn svg {
    @apply w-4 h-4;
  }

  .form-group {
    @apply mb-5;
  }

  .form-group label,
  .form-group .avatar-label {
    @apply block text-sm mb-1.5;
    color: var(--text-secondary);
  }

  .form-group input {
    @apply w-full px-3 py-2 rounded;
    @apply transition-colors text-sm;
    background-color: var(--bg-tertiary);
    border: none;
    color: var(--text-primary);
  }

  .form-group input::placeholder {
    color: var(--text-muted);
  }

  .form-group input:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .error {
    @apply block mt-1 text-xs;
    color: var(--error);
  }

  .avatar-grid {
    @apply grid grid-cols-5 gap-2;
  }

  .avatar-option {
    @apply w-10 h-10 rounded-full flex items-center justify-center;
    @apply cursor-pointer transition-all duration-150;
    @apply border-2 border-transparent;
  }

  .avatar-option:hover {
    transform: scale(1.1);
  }

  .avatar-option.selected {
    transform: scale(1.1);
    border-color: var(--accent);
    box-shadow: 0 0 0 2px var(--bg-secondary), 0 0 0 4px var(--accent);
  }

  .avatar-emoji {
    @apply text-xl;
  }

  .modal-actions {
    @apply flex gap-2 mt-6;
  }

  .btn-secondary {
    @apply flex-1 px-3 py-2 rounded;
    @apply transition-colors text-sm;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .btn-secondary:hover {
    background-color: #404245;
    color: var(--text-primary);
  }

  .btn-primary {
    @apply flex-1 px-3 py-2 rounded;
    @apply transition-colors text-sm;
    background-color: var(--accent);
    color: var(--bg-primary);
  }

  .btn-primary:hover {
    background-color: var(--accent-hover);
  }

  .btn-primary:disabled {
    @apply opacity-50 cursor-not-allowed;
  }

  .btn-primary:disabled:hover {
    background-color: var(--accent);
  }
</style>
