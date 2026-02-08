import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { practiceStore, snippetCount, hasSnippets } from './practice';
import { currentUser } from './user';

describe('Practice Store', () => {
  beforeEach(() => {
    // Set up a mock user first
    currentUser.set({
      id: 1,
      name: 'TestUser',
      avatar: 'cat',
      createdAt: '2024-01-01',
      lastActiveAt: null,
    });

    // Clear snippets
    const snippets = practiceStore.getSnippets();
    snippets.forEach((s) => practiceStore.deleteSnippet(s.id));
  });

  describe('createSnippet', () => {
    it('creates a new snippet with correct properties', () => {
      const snippet = practiceStore.createSnippet(
        'Test Snippet',
        'console.log("hello");',
        'javascript',
        'code'
      );

      expect(snippet.name).toBe('Test Snippet');
      expect(snippet.content).toBe('console.log("hello");');
      expect(snippet.language).toBe('javascript');
      expect(snippet.mode).toBe('code');
      expect(snippet.userId).toBe(1);
      expect(snippet.practiceCount).toBe(0);
      expect(snippet.bestWpm).toBeNull();
      expect(snippet.bestAccuracy).toBeNull();
    });

    it('trims whitespace from name', () => {
      const snippet = practiceStore.createSnippet(
        '  Spaced Name  ',
        'content',
        null,
        'text'
      );

      expect(snippet.name).toBe('Spaced Name');
    });

    it('adds snippet to the list', () => {
      practiceStore.createSnippet('Snippet 1', 'content1', null, 'text');
      practiceStore.createSnippet('Snippet 2', 'content2', 'python', 'code');

      const snippets = practiceStore.getSnippets();
      expect(snippets).toHaveLength(2);
    });

    it('persists to localStorage', () => {
      practiceStore.createSnippet('PersistTest', 'content', null, 'text');

      const stored = localStorage.getItem('exceptional-typing-snippets-1');
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe('PersistTest');
    });

    it('throws error when no user is selected', () => {
      currentUser.set(null);

      expect(() => {
        practiceStore.createSnippet('Test', 'content', null, 'text');
      }).toThrow('No user selected');
    });

    it('throws error when snippet name already exists', () => {
      practiceStore.createSnippet('MySnippet', 'content1', null, 'text');

      expect(() => {
        practiceStore.createSnippet('MySnippet', 'content2', null, 'text');
      }).toThrow('A snippet named "MySnippet" already exists');
    });

    it('throws error for case-insensitive duplicate names', () => {
      practiceStore.createSnippet('Test Snippet', 'content1', null, 'text');

      expect(() => {
        practiceStore.createSnippet('test snippet', 'content2', null, 'text');
      }).toThrow('A snippet named "test snippet" already exists');
    });
  });

  describe('deleteSnippet', () => {
    it('removes snippet from list', () => {
      const snippet1 = practiceStore.createSnippet('Delete1', 'c1', null, 'text');
      const snippet2 = practiceStore.createSnippet('Delete2', 'c2', null, 'text');

      practiceStore.deleteSnippet(snippet1.id);

      const snippets = practiceStore.getSnippets();
      expect(snippets).toHaveLength(1);
      expect(snippets[0].name).toBe('Delete2');
    });

    it('clears current snippet if deleted', () => {
      const snippet = practiceStore.createSnippet('ToDelete', 'content', null, 'text');
      practiceStore.selectSnippet(snippet.id);

      expect(get(practiceStore.currentSnippet)).not.toBeNull();

      practiceStore.deleteSnippet(snippet.id);

      expect(get(practiceStore.currentSnippet)).toBeNull();
    });

    it('does not clear current if different snippet deleted', () => {
      const snippet1 = practiceStore.createSnippet('Keep', 'c1', null, 'text');
      const snippet2 = practiceStore.createSnippet('Delete', 'c2', null, 'text');

      practiceStore.selectSnippet(snippet1.id);
      practiceStore.deleteSnippet(snippet2.id);

      expect(get(practiceStore.currentSnippet)?.name).toBe('Keep');
    });
  });

  describe('updateSnippetStats', () => {
    it('increments practice count', () => {
      const snippet = practiceStore.createSnippet('Stats', 'content', null, 'text');

      practiceStore.updateSnippetStats(snippet.id, 50, 0.95);
      practiceStore.updateSnippetStats(snippet.id, 55, 0.92);

      const updated = practiceStore.getSnippets().find((s) => s.id === snippet.id);
      expect(updated?.practiceCount).toBe(2);
    });

    it('sets best WPM on first practice', () => {
      const snippet = practiceStore.createSnippet('Stats', 'content', null, 'text');

      practiceStore.updateSnippetStats(snippet.id, 50, 0.95);

      const updated = practiceStore.getSnippets().find((s) => s.id === snippet.id);
      expect(updated?.bestWpm).toBe(50);
    });

    it('updates best WPM when beaten', () => {
      const snippet = practiceStore.createSnippet('Stats', 'content', null, 'text');

      practiceStore.updateSnippetStats(snippet.id, 50, 0.95);
      practiceStore.updateSnippetStats(snippet.id, 60, 0.92);

      const updated = practiceStore.getSnippets().find((s) => s.id === snippet.id);
      expect(updated?.bestWpm).toBe(60);
    });

    it('keeps best WPM when not beaten', () => {
      const snippet = practiceStore.createSnippet('Stats', 'content', null, 'text');

      practiceStore.updateSnippetStats(snippet.id, 60, 0.95);
      practiceStore.updateSnippetStats(snippet.id, 50, 0.98);

      const updated = practiceStore.getSnippets().find((s) => s.id === snippet.id);
      expect(updated?.bestWpm).toBe(60);
    });

    it('updates best accuracy when beaten', () => {
      const snippet = practiceStore.createSnippet('Stats', 'content', null, 'text');

      practiceStore.updateSnippetStats(snippet.id, 50, 0.90);
      practiceStore.updateSnippetStats(snippet.id, 45, 0.98);

      const updated = practiceStore.getSnippets().find((s) => s.id === snippet.id);
      expect(updated?.bestAccuracy).toBe(0.98);
    });
  });

  describe('renameSnippet', () => {
    it('updates snippet name', () => {
      const snippet = practiceStore.createSnippet('OldName', 'content', null, 'text');

      practiceStore.renameSnippet(snippet.id, 'NewName');

      const updated = practiceStore.getSnippets().find((s) => s.id === snippet.id);
      expect(updated?.name).toBe('NewName');
    });

    it('trims whitespace', () => {
      const snippet = practiceStore.createSnippet('Name', 'content', null, 'text');

      practiceStore.renameSnippet(snippet.id, '  Trimmed  ');

      const updated = practiceStore.getSnippets().find((s) => s.id === snippet.id);
      expect(updated?.name).toBe('Trimmed');
    });

    it('throws error when renaming to existing name', () => {
      const snippet1 = practiceStore.createSnippet('First', 'c1', null, 'text');
      practiceStore.createSnippet('Second', 'c2', null, 'text');

      expect(() => {
        practiceStore.renameSnippet(snippet1.id, 'Second');
      }).toThrow('A snippet named "Second" already exists');
    });

    it('allows renaming to same name (no change)', () => {
      const snippet = practiceStore.createSnippet('SameName', 'content', null, 'text');

      // Should not throw
      practiceStore.renameSnippet(snippet.id, 'SameName');

      const updated = practiceStore.getSnippets().find((s) => s.id === snippet.id);
      expect(updated?.name).toBe('SameName');
    });

    it('throws error for case-insensitive duplicate rename', () => {
      const snippet1 = practiceStore.createSnippet('Alpha', 'c1', null, 'text');
      practiceStore.createSnippet('Beta', 'c2', null, 'text');

      expect(() => {
        practiceStore.renameSnippet(snippet1.id, 'BETA');
      }).toThrow('A snippet named "BETA" already exists');
    });
  });

  describe('selectSnippet', () => {
    it('sets current snippet', () => {
      const snippet = practiceStore.createSnippet('Select', 'content', null, 'text');

      practiceStore.selectSnippet(snippet.id);

      const current = get(practiceStore.currentSnippet);
      expect(current?.id).toBe(snippet.id);
    });

    it('sets null for non-existent snippet', () => {
      practiceStore.selectSnippet('non-existent-id');

      expect(get(practiceStore.currentSnippet)).toBeNull();
    });
  });

  describe('clearCurrentSnippet', () => {
    it('clears the current snippet', () => {
      const snippet = practiceStore.createSnippet('Clear', 'content', null, 'text');
      practiceStore.selectSnippet(snippet.id);

      expect(get(practiceStore.currentSnippet)).not.toBeNull();

      practiceStore.clearCurrentSnippet();

      expect(get(practiceStore.currentSnippet)).toBeNull();
    });
  });

  describe('derived stores', () => {
    it('snippetCount reflects number of snippets', () => {
      expect(get(snippetCount)).toBe(0);

      practiceStore.createSnippet('S1', 'c1', null, 'text');
      expect(get(snippetCount)).toBe(1);

      practiceStore.createSnippet('S2', 'c2', null, 'text');
      expect(get(snippetCount)).toBe(2);
    });

    it('hasSnippets is false when empty', () => {
      expect(get(hasSnippets)).toBe(false);
    });

    it('hasSnippets is true when has snippets', () => {
      practiceStore.createSnippet('Test', 'content', null, 'text');
      expect(get(hasSnippets)).toBe(true);
    });
  });

  describe('user switching', () => {
    it('loads different snippets for different users', async () => {
      // Create snippet for user 1
      practiceStore.createSnippet('User1Snippet', 'content', null, 'text');
      expect(practiceStore.getSnippets()).toHaveLength(1);

      // Switch to user 2
      currentUser.set({
        id: 2,
        name: 'User2',
        avatar: 'dog',
        createdAt: '2024-01-01',
        lastActiveAt: null,
      });

      // Flush microtask queue (loadSnippets is async)
      await new Promise(r => setTimeout(r, 0));

      // User 2 has no snippets
      expect(practiceStore.getSnippets()).toHaveLength(0);

      // Create snippet for user 2
      practiceStore.createSnippet('User2Snippet', 'content2', null, 'text');
      expect(practiceStore.getSnippets()).toHaveLength(1);

      // Switch back to user 1
      currentUser.set({
        id: 1,
        name: 'TestUser',
        avatar: 'cat',
        createdAt: '2024-01-01',
        lastActiveAt: null,
      });

      // Flush microtask queue
      await new Promise(r => setTimeout(r, 0));

      // User 1's snippets are back
      const snippets = practiceStore.getSnippets();
      expect(snippets).toHaveLength(1);
      expect(snippets[0].name).toBe('User1Snippet');
    });

    it('clears snippets on logout', () => {
      practiceStore.createSnippet('Test', 'content', null, 'text');
      expect(practiceStore.getSnippets()).toHaveLength(1);

      currentUser.set(null);

      expect(practiceStore.getSnippets()).toHaveLength(0);
      expect(get(practiceStore.currentSnippet)).toBeNull();
    });
  });
});
