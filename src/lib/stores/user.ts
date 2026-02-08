import { writable, derived } from 'svelte/store';
import type { UserProfile, AvatarType, AvatarOption } from '../types';
import { getStorage } from '../services';

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

// Load users from storage
export async function loadUsers(): Promise<void> {
  const storage = getStorage();
  const userList = await storage.getAllUsers();
  users.set(userList);
}

// Save users to storage (internal helper for updates that modify the list in-place)
// The storage service doesn't have a "save all users" method — individual updates
// go through updateUser(). For selectUser (lastActiveAt update), we use updateUser.
// For deleteUser, the storage service handles cascade deletion.

// Create a new user
export async function createUser(name: string, avatar: AvatarType): Promise<UserProfile> {
  const storage = getStorage();
  const newUser = await storage.createUser(name, avatar);

  users.update((list) => {
    return [...list, newUser];
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
      foundUser = { ...user }; // Copy the user to set after update completes
    }
    return list;
  });

  // Set currentUser AFTER users.update completes to avoid subscription race conditions
  if (foundUser) {
    currentUser.set(foundUser);
    // Persist the lastActiveAt update via storage service (fire-and-forget)
    getStorage().updateUser(userId, { lastActiveAt: foundUser!.lastActiveAt }).catch(console.error);
  }
}

// Logout (deselect user)
export function logout(): void {
  currentUser.set(null);
}

// Delete a user
export function deleteUser(userId: number): void {
  users.update((list) => {
    return list.filter((u) => u.id !== userId);
  });

  // Delete user and all their data via storage service (fire-and-forget)
  getStorage().deleteUser(userId).catch(console.error);

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

  // Persist via storage service (fire-and-forget)
  getStorage().updateUser(userId, updates).catch(console.error);
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
