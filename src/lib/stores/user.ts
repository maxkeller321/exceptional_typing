import { writable, derived } from 'svelte/store';
import type { UserProfile, AvatarType, AvatarOption } from '../types';

// Avatar options configuration
export const avatarOptions: AvatarOption[] = [
  { id: 'cat', emoji: '🐱', label: 'Cat', color: 'bg-orange-500' },
  { id: 'dog', emoji: '🐶', label: 'Dog', color: 'bg-amber-500' },
  { id: 'fox', emoji: '🦊', label: 'Fox', color: 'bg-orange-600' },
  { id: 'owl', emoji: '🦉', label: 'Owl', color: 'bg-amber-700' },
  { id: 'rabbit', emoji: '🐰', label: 'Rabbit', color: 'bg-pink-400' },
  { id: 'bear', emoji: '🐻', label: 'Bear', color: 'bg-amber-800' },
  { id: 'penguin', emoji: '🐧', label: 'Penguin', color: 'bg-slate-600' },
  { id: 'koala', emoji: '🐨', label: 'Koala', color: 'bg-gray-500' },
  { id: 'robot', emoji: '🤖', label: 'Robot', color: 'bg-blue-500' },
  { id: 'alien', emoji: '👽', label: 'Alien', color: 'bg-green-500' },
];

// Current active user (null means show user picker)
export const currentUser = writable<UserProfile | null>(null);

// All available users
export const users = writable<UserProfile[]>([]);

// Derived: check if user is selected
export const isUserSelected = derived(currentUser, ($user) => $user !== null);

// Derived: get avatar option for current user
export const currentUserAvatar = derived(currentUser, ($user) => {
  if (!$user) return null;
  return avatarOptions.find((a) => a.id === $user.avatar) || avatarOptions[8]; // default to robot
});

// Helper function to get avatar option by id
export function getAvatarOption(avatarId: AvatarType): AvatarOption {
  return avatarOptions.find((a) => a.id === avatarId) || avatarOptions[8];
}

// Generate unique ID for new users
function generateUserId(): number {
  return Date.now();
}

// Load users from localStorage
export function loadUsers(): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem('exceptional-typing-users');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      users.set(parsed);
    } catch {
      users.set([]);
    }
  }
}

// Save users to localStorage
function saveUsers(userList: UserProfile[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('exceptional-typing-users', JSON.stringify(userList));
}

// Create a new user
export function createUser(name: string, avatar: AvatarType): UserProfile {
  const newUser: UserProfile = {
    id: generateUserId(),
    name: name.trim(),
    avatar,
    createdAt: new Date().toISOString(),
    lastActiveAt: null,
  };

  users.update((list) => {
    const updated = [...list, newUser];
    saveUsers(updated);
    return updated;
  });

  return newUser;
}

// Select a user (login)
export function selectUser(userId: number): void {
  let foundUser: UserProfile | null = null;

  users.update((list) => {
    const user = list.find((u) => u.id === userId);
    if (user) {
      // Update last active time
      user.lastActiveAt = new Date().toISOString();
      saveUsers(list);
      foundUser = { ...user }; // Copy the user to set after update completes
    }
    return list;
  });

  // Set currentUser AFTER users.update completes to avoid subscription race conditions
  if (foundUser) {
    currentUser.set(foundUser);
  }
}

// Logout (deselect user)
export function logout(): void {
  currentUser.set(null);
}

// Delete a user
export function deleteUser(userId: number): void {
  users.update((list) => {
    const updated = list.filter((u) => u.id !== userId);
    saveUsers(updated);

    // Also delete user's settings and stats from localStorage
    localStorage.removeItem(`exceptional-typing-settings-${userId}`);
    localStorage.removeItem(`exceptional-typing-stats-${userId}`);
    localStorage.removeItem(`exceptional-typing-progress-${userId}`);

    return updated;
  });

  // If current user was deleted, logout
  currentUser.update((user) => {
    if (user?.id === userId) {
      return null;
    }
    return user;
  });
}

// Update user profile
export function updateUser(userId: number, updates: Partial<Pick<UserProfile, 'name' | 'avatar'>>): void {
  users.update((list) => {
    const user = list.find((u) => u.id === userId);
    if (user) {
      if (updates.name !== undefined) user.name = updates.name.trim();
      if (updates.avatar !== undefined) user.avatar = updates.avatar;
      saveUsers(list);

      // Update current user if it's the same
      currentUser.update((current) => {
        if (current?.id === userId) {
          return { ...current, ...updates };
        }
        return current;
      });
    }
    return list;
  });
}

// Check if username is available
export function isUsernameAvailable(name: string, excludeUserId?: number): boolean {
  let available = true;
  const trimmedName = name.trim().toLowerCase();

  users.subscribe((list) => {
    available = !list.some(
      (u) => u.name.toLowerCase() === trimmedName && u.id !== excludeUserId
    );
  })();

  return available;
}
