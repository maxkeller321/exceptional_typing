import { writable, derived, get } from 'svelte/store';
import type { CustomSnippet, CodeLanguage, PracticeMode } from '../types';
import { currentUser } from './user';

// Internal stores
const snippetsInternal = writable<CustomSnippet[]>([]);
const currentSnippetInternal = writable<CustomSnippet | null>(null);

// Track current user ID
let currentUserId: number | null = null;

// Subscribe to user changes
currentUser.subscribe((user) => {
  if (user) {
    currentUserId = user.id;
    loadSnippets(user.id);
  } else {
    currentUserId = null;
    snippetsInternal.set([]);
    currentSnippetInternal.set(null);
  }
});

// Load snippets from localStorage
function loadSnippets(userId: number): void {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(`exceptional-typing-snippets-${userId}`);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      snippetsInternal.set(parsed);
    } catch {
      snippetsInternal.set([]);
    }
  } else {
    snippetsInternal.set([]);
  }
}

// Save snippets to localStorage
function saveSnippets(snippets: CustomSnippet[]): void {
  if (typeof window === 'undefined' || currentUserId === null) return;
  localStorage.setItem(
    `exceptional-typing-snippets-${currentUserId}`,
    JSON.stringify(snippets)
  );
}

// Generate unique ID
function generateId(): string {
  return `snippet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Create the practice store
function createPracticeStore() {
  return {
    snippets: { subscribe: snippetsInternal.subscribe },
    currentSnippet: { subscribe: currentSnippetInternal.subscribe },

    // Create a new snippet
    createSnippet(
      name: string,
      content: string,
      language: CodeLanguage | null,
      mode: PracticeMode
    ): CustomSnippet {
      if (currentUserId === null) throw new Error('No user selected');

      const trimmedName = name.trim();
      const existingSnippets = get(snippetsInternal);
      const nameExists = existingSnippets.some(
        (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (nameExists) {
        throw new Error(`A snippet named "${trimmedName}" already exists`);
      }

      const snippet: CustomSnippet = {
        id: generateId(),
        userId: currentUserId,
        name: trimmedName,
        content,
        language,
        mode,
        createdAt: new Date().toISOString(),
        practiceCount: 0,
        bestWpm: null,
        bestAccuracy: null,
      };

      snippetsInternal.update((list) => {
        const updated = [...list, snippet];
        saveSnippets(updated);
        return updated;
      });

      return snippet;
    },

    // Update snippet stats after practice
    updateSnippetStats(snippetId: string, wpm: number, accuracy: number): void {
      snippetsInternal.update((list) => {
        const snippet = list.find((s) => s.id === snippetId);
        if (snippet) {
          snippet.practiceCount++;
          snippet.bestWpm =
            snippet.bestWpm === null ? wpm : Math.max(snippet.bestWpm, wpm);
          snippet.bestAccuracy =
            snippet.bestAccuracy === null
              ? accuracy
              : Math.max(snippet.bestAccuracy, accuracy);
          saveSnippets(list);
        }
        return list;
      });
    },

    // Delete a snippet
    deleteSnippet(snippetId: string): void {
      snippetsInternal.update((list) => {
        const updated = list.filter((s) => s.id !== snippetId);
        saveSnippets(updated);
        return updated;
      });

      // Clear current if deleted
      currentSnippetInternal.update((current) => {
        if (current?.id === snippetId) return null;
        return current;
      });
    },

    // Rename a snippet
    renameSnippet(snippetId: string, newName: string): void {
      const trimmedName = newName.trim();
      const existingSnippets = get(snippetsInternal);
      const nameExists = existingSnippets.some(
        (s) => s.id !== snippetId && s.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (nameExists) {
        throw new Error(`A snippet named "${trimmedName}" already exists`);
      }

      snippetsInternal.update((list) => {
        const snippet = list.find((s) => s.id === snippetId);
        if (snippet) {
          snippet.name = trimmedName;
          saveSnippets(list);
        }
        return list;
      });
    },

    // Select a snippet for practice
    selectSnippet(snippetId: string): void {
      const list = get(snippetsInternal);
      const snippet = list.find((s) => s.id === snippetId);
      currentSnippetInternal.set(snippet || null);
    },

    // Clear current snippet
    clearCurrentSnippet(): void {
      currentSnippetInternal.set(null);
    },

    // Get all snippets
    getSnippets(): CustomSnippet[] {
      return get(snippetsInternal);
    },
  };
}

export const practiceStore = createPracticeStore();

// Derived stores
export const snippetCount = derived(snippetsInternal, ($s) => $s.length);
export const hasSnippets = derived(snippetsInternal, ($s) => $s.length > 0);
