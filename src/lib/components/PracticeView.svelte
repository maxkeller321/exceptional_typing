<script lang="ts">
  import { onMount } from 'svelte';
  import TypingArea from './TypingArea.svelte';
  import Dropdown from './ui/Dropdown.svelte';
  import { practiceStore, hasSnippets } from '../stores/practice';
  import { settingsStore, codeTheme as codeThemeStore, typingMode } from '../stores/settings';
  import { getLanguageDisplayName } from '../utils/languageDetector';
  import type { CodeLanguage, CustomSnippet, Task, TaskResult, PracticeMode } from '../types';
  import type { CodeTheme } from '../utils/highlight';

  // State
  let inputText = $state('');
  let selectedLanguage = $state<CodeLanguage | null>(null);
  let mode = $state<PracticeMode>('text');
  let snippetName = $state('');
  let showSaveDialog = $state(false);
  let isPracticing = $state(false);
  let lastResult = $state<TaskResult | null>(null);

  // Snippets
  let snippets = $state<CustomSnippet[]>([]);
  let hasUserSnippets = $state(false);
  let codeTheme = $state<CodeTheme>('vscode-dark');
  let currentMode = $state<'normal' | 'coder'>('normal');

  onMount(() => {
    const unsubSnippets = practiceStore.snippets.subscribe((s) => {
      snippets = s;
    });
    const unsubHasSnippets = hasSnippets.subscribe((h) => {
      hasUserSnippets = h;
    });
    const unsubTheme = codeThemeStore.subscribe((t) => {
      codeTheme = t as CodeTheme;
    });
    const unsubMode = typingMode.subscribe((m) => {
      currentMode = m;
      mode = m === 'coder' ? 'code' : 'text';
    });

    return () => {
      unsubSnippets();
      unsubHasSnippets();
      unsubTheme();
      unsubMode();
    };
  });

  // Create task for practice
  let practiceTask = $derived.by(() => {
    if (!inputText.trim()) return null;

    const task: Task = {
      id: `practice-${Date.now()}`,
      instruction: mode === 'code' ? 'Type the code below:' : 'Type the text below:',
      targetText: inputText.trim(),
      minAccuracy: 0.8,
      language: mode === 'code' ? selectedLanguage || undefined : undefined,
    };

    return task;
  });

  function handleStartPractice() {
    if (inputText.trim()) {
      lastResult = null;
      isPracticing = true;
    }
  }

  function handleComplete(result: TaskResult) {
    lastResult = result;
    isPracticing = false;

    // Update snippet stats if practicing a saved snippet
    // This would be enhanced with proper snippet tracking
  }

  function handleSaveSnippet() {
    if (!inputText.trim() || !snippetName.trim()) return;

    practiceStore.createSnippet(
      snippetName.trim(),
      inputText.trim(),
      mode === 'code' ? selectedLanguage : null,
      mode
    );

    snippetName = '';
    showSaveDialog = false;
  }

  function handleLoadSnippet(snippet: CustomSnippet) {
    inputText = snippet.content;
    mode = snippet.mode;
    selectedLanguage = snippet.language;
    isPracticing = false;
    lastResult = null;
  }

  function handleDeleteSnippet(snippetId: string) {
    practiceStore.deleteSnippet(snippetId);
  }

  function handleReset() {
    isPracticing = false;
    lastResult = null;
  }

  const languages: CodeLanguage[] = [
    'javascript',
    'typescript',
    'python',
    'rust',
    'go',
    'java',
    'c',
    'cpp',
    'csharp',
    'html',
    'css',
    'json',
    'sql',
    'bash',
  ];

  const languageOptions = [
    { value: '', label: 'Select Language' },
    ...languages.map((lang) => ({ value: lang, label: getLanguageDisplayName(lang) })),
  ];
</script>

<div class="practice-view">
  {#if isPracticing && practiceTask}
    <div class="practice-session">
      <div class="session-header">
        <button class="back-btn" onclick={handleReset}>
          ← Back to Editor
        </button>
        {#if mode === 'code' && selectedLanguage}
          <span class="language-badge">{getLanguageDisplayName(selectedLanguage)}</span>
        {/if}
      </div>

      <TypingArea
        task={practiceTask}
        showKeyboard={true}
        codeTheme={codeTheme}
        onComplete={handleComplete}
      />
    </div>
  {:else if lastResult}
    <div class="results-panel">
      <h2 class="result-title">
        {#if lastResult.passed}
          Great job!
        {:else}
          Keep practicing!
        {/if}
      </h2>

      <div class="results-stats">
        <div class="result-stat">
          <span class="stat-value">{lastResult.wpm}</span>
          <span class="stat-label">WPM</span>
        </div>
        <div class="result-stat">
          <span class="stat-value">{Math.round(lastResult.accuracy * 100)}%</span>
          <span class="stat-label">Accuracy</span>
        </div>
        <div class="result-stat">
          <span class="stat-value">{lastResult.errors.length}</span>
          <span class="stat-label">Errors</span>
        </div>
        <div class="result-stat">
          <span class="stat-value">{(lastResult.duration / 1000).toFixed(1)}s</span>
          <span class="stat-label">Time</span>
        </div>
      </div>

      <div class="result-actions">
        <button class="btn-secondary" onclick={handleReset}>
          Edit Text
        </button>
        <button class="btn-primary" onclick={handleStartPractice}>
          Practice Again
        </button>
      </div>
    </div>
  {:else}
    <div class="editor-panel">
      <!-- Mode Toggle -->
      <div class="mode-tabs">
        <button
          class="mode-tab"
          class:active={mode === 'text'}
          onclick={() => (mode = 'text')}
        >
          Text
        </button>
        <button
          class="mode-tab"
          class:active={mode === 'code'}
          onclick={() => (mode = 'code')}
        >
          Code
        </button>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <textarea
          class="text-input"
          class:code-mode={mode === 'code'}
          placeholder={mode === 'code'
            ? 'Paste your code here...'
            : 'Paste or type your text here...'}
          bind:value={inputText}
          rows="12"
        ></textarea>

        {#if mode === 'code'}
          <div class="code-options">
            <Dropdown
              options={languageOptions}
              value={selectedLanguage ?? ''}
              placeholder="Select Language"
              onChange={(v) => (selectedLanguage = v ? (v as CodeLanguage) : null)}
            />
          </div>
        {/if}
      </div>

      <!-- Actions -->
      <div class="editor-actions">
        <button
          class="btn-secondary"
          onclick={() => (showSaveDialog = true)}
          disabled={!inputText.trim()}
        >
          Save Snippet
        </button>
        <button
          class="btn-primary"
          onclick={handleStartPractice}
          disabled={!inputText.trim()}
        >
          Start Practice
        </button>
      </div>

      <!-- Saved Snippets -->
      {#if hasUserSnippets}
        <div class="snippets-section">
          <h3>Saved Snippets</h3>
          <div class="snippets-grid">
            {#each snippets as snippet (snippet.id)}
              <div class="snippet-card">
                <div class="snippet-header">
                  <span class="snippet-name">{snippet.name}</span>
                  {#if snippet.language}
                    <span class="snippet-lang">{getLanguageDisplayName(snippet.language)}</span>
                  {/if}
                </div>
                <div class="snippet-preview">
                  {snippet.content.slice(0, 100)}{snippet.content.length > 100 ? '...' : ''}
                </div>
                <div class="snippet-meta">
                  <span>Practiced {snippet.practiceCount} times</span>
                  {#if snippet.bestWpm}
                    <span>Best: {snippet.bestWpm} WPM</span>
                  {/if}
                </div>
                <div class="snippet-actions">
                  <button
                    class="snippet-btn"
                    onclick={() => handleLoadSnippet(snippet)}
                  >
                    Load
                  </button>
                  <button
                    class="snippet-btn delete"
                    onclick={() => handleDeleteSnippet(snippet.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Save Dialog -->
  {#if showSaveDialog}
    <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
    <div class="modal-backdrop" onclick={() => (showSaveDialog = false)} role="presentation">
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <div class="modal" onclick={(e) => e.stopPropagation()} role="presentation">
        <h3>Save Snippet</h3>
        <input
          type="text"
          class="snippet-name-input"
          placeholder="Enter snippet name"
          bind:value={snippetName}
        />
        <div class="modal-actions">
          <button class="btn-secondary" onclick={() => (showSaveDialog = false)}>
            Cancel
          </button>
          <button
            class="btn-primary"
            onclick={handleSaveSnippet}
            disabled={!snippetName.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .practice-view {
    @apply h-full;
  }

  .practice-session {
    @apply flex flex-col gap-4;
  }

  .session-header {
    @apply flex items-center gap-4;
  }

  .back-btn {
    @apply px-3 py-1.5 text-sm;
    @apply transition-colors;
    color: var(--text-secondary);
  }

  .back-btn:hover {
    color: var(--text-primary);
  }

  .language-badge {
    @apply px-2 py-1 text-xs rounded;
    background-color: rgba(226, 183, 20, 0.2);
    color: var(--accent);
  }

  .results-panel {
    @apply rounded-lg p-6 text-center max-w-md mx-auto;
    background-color: var(--bg-secondary);
  }

  .result-title {
    @apply text-2xl font-medium mb-5;
    color: var(--success);
  }

  .results-stats {
    @apply flex justify-center gap-6 mb-6;
  }

  .result-stat {
    @apply flex flex-col;
  }

  .result-stat .stat-value {
    @apply text-2xl font-medium;
    color: var(--accent);
  }

  .result-stat .stat-label {
    @apply text-xs;
    color: var(--text-muted);
  }

  .result-actions {
    @apply flex justify-center gap-3;
  }

  .editor-panel {
    @apply flex flex-col gap-5;
  }

  .mode-tabs {
    @apply flex gap-0.5 p-0.5 rounded w-fit;
    background-color: var(--bg-tertiary);
  }

  .mode-tab {
    @apply px-4 py-1.5 text-sm rounded-sm transition-colors;
    color: var(--text-secondary);
  }

  .mode-tab:hover {
    color: var(--text-primary);
  }

  .mode-tab.active {
    background-color: var(--bg-secondary);
    color: var(--accent);
  }

  .input-area {
    @apply flex flex-col gap-3;
  }

  .text-input {
    @apply w-full p-4 rounded-lg resize-none;
    @apply transition-colors;
    background-color: var(--bg-secondary);
    border: none;
    color: var(--text-primary);
  }

  .text-input::placeholder {
    color: var(--text-muted);
  }

  .text-input:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .text-input.code-mode {
    @apply font-mono text-sm;
  }

  .code-options {
    @apply flex items-center gap-2 flex-wrap;
  }

  .editor-actions {
    @apply flex gap-2;
  }

  .btn-primary {
    @apply px-5 py-2 rounded text-sm;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
    @apply transition-colors;
    background-color: var(--accent);
    color: var(--bg-primary);
  }

  .btn-primary:hover:not(:disabled) {
    background-color: var(--accent-hover);
  }

  .btn-secondary {
    @apply px-5 py-2 rounded text-sm;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
    @apply transition-colors;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: #404245;
    color: var(--text-primary);
  }

  .snippets-section {
    @apply mt-6;
  }

  .snippets-section h3 {
    @apply text-sm font-medium mb-3 uppercase tracking-wider;
    color: var(--text-secondary);
  }

  .snippets-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3;
  }

  .snippet-card {
    @apply rounded-lg p-3;
    background-color: var(--bg-secondary);
  }

  .snippet-header {
    @apply flex items-center justify-between mb-2;
  }

  .snippet-name {
    @apply text-sm font-medium;
    color: var(--text-primary);
  }

  .snippet-lang {
    @apply text-xs px-1.5 py-0.5 rounded;
    background-color: var(--bg-tertiary);
    color: var(--text-muted);
  }

  .snippet-preview {
    @apply text-xs font-mono mb-2;
    @apply line-clamp-2 overflow-hidden;
    color: var(--text-secondary);
  }

  .snippet-meta {
    @apply flex justify-between text-xs mb-2;
    color: var(--text-muted);
  }

  .snippet-actions {
    @apply flex gap-1.5;
  }

  .snippet-btn {
    @apply px-2 py-1 text-xs rounded;
    @apply transition-colors;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .snippet-btn:hover {
    background-color: #404245;
    color: var(--text-primary);
  }

  .snippet-btn.delete:hover {
    background-color: rgba(202, 71, 84, 0.2);
    color: var(--error);
  }

  .modal-backdrop {
    @apply fixed inset-0;
    @apply flex items-center justify-center p-4 z-50;
    background-color: rgba(35, 37, 40, 0.9);
  }

  .modal {
    @apply rounded-lg p-5 w-full max-w-sm;
    background-color: var(--bg-secondary);
  }

  .modal h3 {
    @apply text-base font-medium mb-4;
    color: var(--text-primary);
  }

  .snippet-name-input {
    @apply w-full px-3 py-2 rounded mb-4 text-sm;
    background-color: var(--bg-tertiary);
    border: none;
    color: var(--text-primary);
  }

  .snippet-name-input::placeholder {
    color: var(--text-muted);
  }

  .snippet-name-input:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .modal-actions {
    @apply flex justify-end gap-2;
  }
</style>
