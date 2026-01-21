import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

// Mock other stores to prevent subscription side effects
vi.mock('./settings', () => ({
  settingsStore: { subscribe: vi.fn() },
}));

vi.mock('./practice', () => ({
  practiceStore: { subscribe: vi.fn() },
}));

import {
  currentUser,
  users,
  isUserSelected,
  createUser,
  selectUser,
  logout,
  deleteUser,
  updateUser,
  isUsernameAvailable,
  loadUsers,
  getAvatarOption,
  avatarOptions,
} from './user';

describe('User Store', () => {
  beforeEach(() => {
    // Reset stores completely
    currentUser.set(null);
    users.set([]);
    // Clear localStorage
    localStorage.clear();
  });

  describe('createUser', () => {
    it('creates a new user with correct properties', () => {
      const user = createUser('TestUser', 'cat');

      expect(user.name).toBe('TestUser');
      expect(user.avatar).toBe('cat');
      expect(user.id).toBeGreaterThan(0);
      expect(user.createdAt).toBeDefined();
      expect(user.lastActiveAt).toBeNull();
    });

    it('trims whitespace from username', () => {
      const user = createUser('  SpacedName  ', 'dog');
      expect(user.name).toBe('SpacedName');
    });

    it('adds user to users list', () => {
      createUser('User1', 'fox');
      createUser('User2', 'owl');

      const userList = get(users);
      expect(userList).toHaveLength(2);
      expect(userList[0].name).toBe('User1');
      expect(userList[1].name).toBe('User2');
    });

    it('persists users to localStorage', () => {
      createUser('PersistTest', 'robot');

      const stored = localStorage.getItem('exceptional-typing-users');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('PersistTest');
    });
  });

  describe('selectUser', () => {
    it('sets the current user', () => {
      const user = createUser('SelectTest', 'bear');
      selectUser(user.id);

      const current = get(currentUser);
      expect(current?.id).toBe(user.id);
      expect(current?.name).toBe('SelectTest');
    });

    it('updates lastActiveAt when selecting', () => {
      const user = createUser('ActiveTest', 'penguin');
      expect(user.lastActiveAt).toBeNull();

      selectUser(user.id);

      const current = get(currentUser);
      expect(current?.lastActiveAt).not.toBeNull();
    });

    it('updates isUserSelected derived store', () => {
      expect(get(isUserSelected)).toBe(false);

      const user = createUser('DerivedTest', 'koala');
      selectUser(user.id);

      expect(get(isUserSelected)).toBe(true);
    });
  });

  describe('logout', () => {
    it('clears the current user', () => {
      const user = createUser('LogoutTest', 'alien');
      selectUser(user.id);
      expect(get(currentUser)).not.toBeNull();

      logout();

      expect(get(currentUser)).toBeNull();
      expect(get(isUserSelected)).toBe(false);
    });

    it('allows selecting a user again after logout', () => {
      // Clear state
      users.set([]);
      currentUser.set(null);

      // Create a user and select them
      const user = createUser('ReLoginTest', 'fox');
      selectUser(user.id);
      expect(get(currentUser)?.id).toBe(user.id);
      expect(get(currentUser)?.name).toBe('ReLoginTest');

      // Logout
      logout();
      expect(get(currentUser)).toBeNull();

      // User should still exist in users list
      const userList = get(users);
      expect(userList).toHaveLength(1);
      expect(userList[0].id).toBe(user.id);

      // Select the same user again (re-login)
      selectUser(user.id);

      // Should be logged back in
      const current = get(currentUser);
      expect(current).not.toBeNull();
      expect(current?.id).toBe(user.id);
      expect(current?.name).toBe('ReLoginTest');
    });

    it('allows selecting a previously created user after app reload simulation', () => {
      // Clear all state
      users.set([]);
      currentUser.set(null);
      localStorage.clear();

      // Create a user
      const user = createUser('PersistUser', 'bear');
      const userId = user.id;

      // Simulate "logging out" (but user stays in localStorage)
      logout();

      // Simulate app reload by clearing in-memory state and reloading from localStorage
      users.set([]);
      currentUser.set(null);

      // Reload users from localStorage (like app startup)
      loadUsers();

      // User should be restored
      const loadedUsers = get(users);
      expect(loadedUsers).toHaveLength(1);
      expect(loadedUsers[0].id).toBe(userId);
      expect(loadedUsers[0].name).toBe('PersistUser');

      // Select the user
      selectUser(userId);

      // Should be logged in
      const current = get(currentUser);
      expect(current).not.toBeNull();
      expect(current?.id).toBe(userId);
      expect(current?.name).toBe('PersistUser');
    });
  });

  describe('deleteUser', () => {
    it('removes user from users list', () => {
      // Clear any previous state from other tests
      users.set([]);
      currentUser.set(null);

      const user1 = createUser('Delete1', 'cat');

      // Add small delay to ensure unique IDs
      const user2Id = user1.id + 1;
      const user2 = {
        id: user2Id,
        name: 'Delete2',
        avatar: 'dog' as const,
        createdAt: new Date().toISOString(),
        lastActiveAt: null,
      };
      users.update((list) => {
        const updated = [...list, user2];
        localStorage.setItem('exceptional-typing-users', JSON.stringify(updated));
        return updated;
      });

      // Verify both users exist
      expect(get(users)).toHaveLength(2);

      deleteUser(user1.id);

      const userList = get(users);
      expect(userList).toHaveLength(1);
      expect(userList[0].name).toBe('Delete2');
    });

    it('logs out if current user is deleted', () => {
      const user = createUser('DeleteCurrent', 'fox');
      selectUser(user.id);
      expect(get(currentUser)).not.toBeNull();

      deleteUser(user.id);

      expect(get(currentUser)).toBeNull();
    });

    it('does not logout if different user is deleted', () => {
      // Clear state first
      users.set([]);
      currentUser.set(null);

      // Create user1
      const user1 = createUser('StayUser', 'owl');

      // Manually add user2 with different ID
      const user2Id = user1.id + 1;
      users.update((list) => {
        const user2 = {
          id: user2Id,
          name: 'GoAwayUser',
          avatar: 'rabbit' as const,
          createdAt: new Date().toISOString(),
          lastActiveAt: null,
        };
        const updated = [...list, user2];
        localStorage.setItem('exceptional-typing-users', JSON.stringify(updated));
        return updated;
      });

      // Select user1 first
      selectUser(user1.id);
      expect(get(currentUser)?.id).toBe(user1.id);

      // Delete user2
      deleteUser(user2Id);

      // user1 should still be current
      const current = get(currentUser);
      expect(current).not.toBeNull();
      expect(current?.id).toBe(user1.id);
    });

    it('removes user-specific localStorage data', () => {
      const user = createUser('CleanupTest', 'bear');
      localStorage.setItem(`exceptional-typing-settings-${user.id}`, '{}');
      localStorage.setItem(`exceptional-typing-stats-${user.id}`, '{}');

      deleteUser(user.id);

      expect(localStorage.getItem(`exceptional-typing-settings-${user.id}`)).toBeNull();
      expect(localStorage.getItem(`exceptional-typing-stats-${user.id}`)).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('updates user name', () => {
      const user = createUser('OldName', 'penguin');
      updateUser(user.id, { name: 'NewName' });

      const userList = get(users);
      expect(userList[0].name).toBe('NewName');
    });

    it('updates user avatar', () => {
      const user = createUser('AvatarTest', 'koala');
      updateUser(user.id, { avatar: 'alien' });

      const userList = get(users);
      expect(userList[0].avatar).toBe('alien');
    });

    it('updates current user if same user', () => {
      const user = createUser('CurrentUpdate', 'robot');
      selectUser(user.id);

      updateUser(user.id, { name: 'UpdatedCurrent' });

      expect(get(currentUser)?.name).toBe('UpdatedCurrent');
    });
  });

  describe('isUsernameAvailable', () => {
    it('returns true for available username', () => {
      createUser('Taken', 'cat');

      expect(isUsernameAvailable('Available')).toBe(true);
    });

    it('returns false for taken username', () => {
      createUser('Taken', 'dog');

      expect(isUsernameAvailable('Taken')).toBe(false);
    });

    it('is case insensitive', () => {
      createUser('TakenName', 'fox');

      expect(isUsernameAvailable('takenname')).toBe(false);
      expect(isUsernameAvailable('TAKENNAME')).toBe(false);
    });

    it('excludes specified user from check', () => {
      const user = createUser('MyName', 'owl');

      // Same user can keep their name
      expect(isUsernameAvailable('MyName', user.id)).toBe(true);
    });
  });

  describe('loadUsers', () => {
    it('loads users from localStorage', () => {
      const testUsers = [
        { id: 1, name: 'Loaded1', avatar: 'cat', createdAt: '2024-01-01', lastActiveAt: null },
        { id: 2, name: 'Loaded2', avatar: 'dog', createdAt: '2024-01-02', lastActiveAt: null },
      ];
      localStorage.setItem('exceptional-typing-users', JSON.stringify(testUsers));

      loadUsers();

      const userList = get(users);
      expect(userList).toHaveLength(2);
      expect(userList[0].name).toBe('Loaded1');
    });

    it('handles invalid JSON gracefully', () => {
      localStorage.setItem('exceptional-typing-users', 'invalid json');

      loadUsers();

      expect(get(users)).toEqual([]);
    });

    it('loads users and allows selection on app startup simulation', () => {
      // This test simulates what happens when the app starts:
      // 1. User was previously created and saved to localStorage
      // 2. App restarts (clear in-memory stores)
      // 3. loadUsers() is called
      // 4. User should be visible and selectable

      // Setup: Create a user in localStorage directly (simulating previous session)
      const existingUser = {
        id: 12345,
        name: 'ExistingUser',
        avatar: 'fox',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastActiveAt: '2024-01-02T00:00:00.000Z',
      };
      localStorage.setItem('exceptional-typing-users', JSON.stringify([existingUser]));

      // Clear in-memory stores (simulating app restart)
      users.set([]);
      currentUser.set(null);

      // Verify stores are empty
      expect(get(users)).toHaveLength(0);
      expect(get(currentUser)).toBeNull();

      // App startup: loadUsers() is called
      loadUsers();

      // Users should now be loaded from localStorage
      const loadedUsers = get(users);
      expect(loadedUsers).toHaveLength(1);
      expect(loadedUsers[0].id).toBe(12345);
      expect(loadedUsers[0].name).toBe('ExistingUser');

      // User should be selectable
      selectUser(12345);

      // User should now be logged in
      const current = get(currentUser);
      expect(current).not.toBeNull();
      expect(current?.id).toBe(12345);
      expect(current?.name).toBe('ExistingUser');
    });

    it('subscription receives users after loadUsers is called', () => {
      // This tests the subscription pattern used in UserPicker.svelte
      const existingUser = {
        id: 99999,
        name: 'SubscriptionTest',
        avatar: 'owl',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastActiveAt: null,
      };
      localStorage.setItem('exceptional-typing-users', JSON.stringify([existingUser]));

      // Clear stores
      users.set([]);
      currentUser.set(null);

      // Track what the subscription receives
      let receivedUsers: any[] = [];

      // This is what UserPicker does: loadUsers() then subscribe
      loadUsers();
      const unsub = users.subscribe((list) => {
        receivedUsers = list;
      });

      // The subscription should have received the loaded users
      expect(receivedUsers).toHaveLength(1);
      expect(receivedUsers[0].name).toBe('SubscriptionTest');

      unsub();
    });

    it('selectUser works when userId is passed from component callback', () => {
      // This tests the flow: component gets user.id and passes to selectUser
      // Simulates: <UserCard onSelect={(userId) => selectUser(userId)} />

      const existingUser = {
        id: 77777,
        name: 'CallbackUser',
        avatar: 'bear',
        createdAt: '2024-01-01T00:00:00.000Z',
        lastActiveAt: null,
      };
      localStorage.setItem('exceptional-typing-users', JSON.stringify([existingUser]));

      // Clear stores (simulate app start)
      users.set([]);
      currentUser.set(null);

      // Load users (like App.svelte does)
      loadUsers();

      // Verify user is in list
      const loadedUsers = get(users);
      expect(loadedUsers).toHaveLength(1);

      // Simulate component callback: onClick={() => onSelect?.(user.id)}
      const userIdFromComponent = loadedUsers[0].id;
      expect(userIdFromComponent).toBe(77777);

      // Call selectUser with the ID (like UserPicker does)
      selectUser(userIdFromComponent);

      // User should be selected
      const current = get(currentUser);
      expect(current).not.toBeNull();
      expect(current?.id).toBe(77777);
      expect(current?.name).toBe('CallbackUser');
    });
  });

  describe('getAvatarOption', () => {
    it('returns correct avatar option', () => {
      const option = getAvatarOption('cat');
      expect(option.emoji).toBe('🐱');
      expect(option.label).toBe('Cat');
    });

    it('returns default robot for unknown avatar', () => {
      const option = getAvatarOption('unknown' as any);
      expect(option.id).toBe('robot');
    });
  });

  describe('avatarOptions', () => {
    it('has 10 avatar options', () => {
      expect(avatarOptions).toHaveLength(10);
    });

    it('all options have required properties', () => {
      avatarOptions.forEach((option) => {
        expect(option.id).toBeDefined();
        expect(option.emoji).toBeDefined();
        expect(option.label).toBeDefined();
        expect(option.color).toBeDefined();
      });
    });
  });
});
