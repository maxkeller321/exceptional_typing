import type { Lesson, KeyboardShortcut, ShortcutCategory, IDEType, Difficulty } from '../types';

/**
 * IDE Keyboard Shortcuts Database
 *
 * A comprehensive collection of keyboard shortcuts for various IDEs.
 * Users can practice these shortcuts to build muscle memory for faster coding.
 *
 * Shortcuts are organized by category and difficulty level.
 * Each shortcut includes both Windows/Linux and Mac key bindings.
 */

export const keyboardShortcuts: KeyboardShortcut[] = [
  // ============================================
  // NAVIGATION - Moving around code
  // ============================================
  {
    id: 'nav-go-to-line',
    name: 'Go to Line',
    description: 'Jump to a specific line number in the current file.',
    category: 'navigation',
    keys: { windows: 'Ctrl+G', mac: 'Cmd+G' },
    ide: ['vscode', 'jetbrains', 'sublime', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'nav-go-to-file',
    name: 'Quick Open / Go to File',
    description: 'Open any file in the project by typing its name.',
    category: 'navigation',
    keys: { windows: 'Ctrl+P', mac: 'Cmd+P' },
    ide: ['vscode', 'sublime', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'nav-go-to-symbol',
    name: 'Go to Symbol',
    description: 'Jump to a function, class, or variable definition.',
    category: 'navigation',
    keys: { windows: 'Ctrl+Shift+O', mac: 'Cmd+Shift+O' },
    ide: ['vscode', 'universal'],
    difficulty: 'intermediate',
  },
  {
    id: 'nav-go-to-definition',
    name: 'Go to Definition',
    description: 'Jump to where a symbol is defined.',
    category: 'navigation',
    keys: { windows: 'F12', mac: 'F12' },
    ide: ['vscode', 'jetbrains', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'nav-peek-definition',
    name: 'Peek Definition',
    description: 'View definition inline without leaving current file.',
    category: 'navigation',
    keys: { windows: 'Alt+F12', mac: 'Option+F12' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'nav-go-back',
    name: 'Navigate Back',
    description: 'Go back to previous cursor location.',
    category: 'navigation',
    keys: { windows: 'Alt+Left', mac: 'Ctrl+-' },
    ide: ['vscode', 'jetbrains', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'nav-go-forward',
    name: 'Navigate Forward',
    description: 'Go forward to next cursor location.',
    category: 'navigation',
    keys: { windows: 'Alt+Right', mac: 'Ctrl+Shift+-' },
    ide: ['vscode', 'jetbrains', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'nav-line-start',
    name: 'Go to Line Start',
    description: 'Move cursor to the beginning of the line.',
    category: 'navigation',
    keys: { windows: 'Home', mac: 'Cmd+Left' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'nav-line-end',
    name: 'Go to Line End',
    description: 'Move cursor to the end of the line.',
    category: 'navigation',
    keys: { windows: 'End', mac: 'Cmd+Right' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'nav-file-start',
    name: 'Go to File Start',
    description: 'Move cursor to the beginning of the file.',
    category: 'navigation',
    keys: { windows: 'Ctrl+Home', mac: 'Cmd+Up' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'nav-file-end',
    name: 'Go to File End',
    description: 'Move cursor to the end of the file.',
    category: 'navigation',
    keys: { windows: 'Ctrl+End', mac: 'Cmd+Down' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'nav-word-left',
    name: 'Move Word Left',
    description: 'Move cursor one word to the left.',
    category: 'navigation',
    keys: { windows: 'Ctrl+Left', mac: 'Option+Left' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'nav-word-right',
    name: 'Move Word Right',
    description: 'Move cursor one word to the right.',
    category: 'navigation',
    keys: { windows: 'Ctrl+Right', mac: 'Option+Right' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'nav-matching-bracket',
    name: 'Go to Matching Bracket',
    description: 'Jump between opening and closing brackets.',
    category: 'navigation',
    keys: { windows: 'Ctrl+Shift+\\', mac: 'Cmd+Shift+\\' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'nav-breadcrumbs',
    name: 'Focus Breadcrumbs',
    description: 'Navigate using the breadcrumb trail.',
    category: 'navigation',
    keys: { windows: 'Ctrl+Shift+.', mac: 'Cmd+Shift+.' },
    ide: ['vscode'],
    difficulty: 'advanced',
  },

  // ============================================
  // EDITING - Modifying code
  // ============================================
  {
    id: 'edit-cut-line',
    name: 'Cut Line',
    description: 'Cut the entire current line.',
    category: 'editing',
    keys: { windows: 'Ctrl+X', mac: 'Cmd+X' },
    ide: ['vscode', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-copy-line',
    name: 'Copy Line',
    description: 'Copy the entire current line.',
    category: 'editing',
    keys: { windows: 'Ctrl+C', mac: 'Cmd+C' },
    ide: ['vscode', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-delete-line',
    name: 'Delete Line',
    description: 'Delete the entire current line.',
    category: 'editing',
    keys: { windows: 'Ctrl+Shift+K', mac: 'Cmd+Shift+K' },
    ide: ['vscode', 'sublime'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-duplicate-line',
    name: 'Duplicate Line',
    description: 'Duplicate the current line below.',
    category: 'editing',
    keys: { windows: 'Shift+Alt+Down', mac: 'Shift+Option+Down' },
    ide: ['vscode'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-move-line-up',
    name: 'Move Line Up',
    description: 'Move the current line up.',
    category: 'editing',
    keys: { windows: 'Alt+Up', mac: 'Option+Up' },
    ide: ['vscode', 'jetbrains', 'sublime'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-move-line-down',
    name: 'Move Line Down',
    description: 'Move the current line down.',
    category: 'editing',
    keys: { windows: 'Alt+Down', mac: 'Option+Down' },
    ide: ['vscode', 'jetbrains', 'sublime'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-insert-line-below',
    name: 'Insert Line Below',
    description: 'Insert a new line below the current line.',
    category: 'editing',
    keys: { windows: 'Ctrl+Enter', mac: 'Cmd+Enter' },
    ide: ['vscode', 'jetbrains'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-insert-line-above',
    name: 'Insert Line Above',
    description: 'Insert a new line above the current line.',
    category: 'editing',
    keys: { windows: 'Ctrl+Shift+Enter', mac: 'Cmd+Shift+Enter' },
    ide: ['vscode', 'jetbrains'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-indent-line',
    name: 'Indent Line',
    description: 'Increase indentation of the current line.',
    category: 'editing',
    keys: { windows: 'Ctrl+]', mac: 'Cmd+]' },
    ide: ['vscode', 'sublime'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-outdent-line',
    name: 'Outdent Line',
    description: 'Decrease indentation of the current line.',
    category: 'editing',
    keys: { windows: 'Ctrl+[', mac: 'Cmd+[' },
    ide: ['vscode', 'sublime'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-toggle-comment',
    name: 'Toggle Line Comment',
    description: 'Comment or uncomment the current line.',
    category: 'editing',
    keys: { windows: 'Ctrl+/', mac: 'Cmd+/' },
    ide: ['vscode', 'jetbrains', 'sublime', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-toggle-block-comment',
    name: 'Toggle Block Comment',
    description: 'Add or remove block comment around selection.',
    category: 'editing',
    keys: { windows: 'Shift+Alt+A', mac: 'Shift+Option+A' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'edit-undo',
    name: 'Undo',
    description: 'Undo the last action.',
    category: 'editing',
    keys: { windows: 'Ctrl+Z', mac: 'Cmd+Z' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-redo',
    name: 'Redo',
    description: 'Redo the last undone action.',
    category: 'editing',
    keys: { windows: 'Ctrl+Y', mac: 'Cmd+Shift+Z' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-format-document',
    name: 'Format Document',
    description: 'Auto-format the entire document.',
    category: 'editing',
    keys: { windows: 'Shift+Alt+F', mac: 'Shift+Option+F' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'edit-format-selection',
    name: 'Format Selection',
    description: 'Auto-format only the selected code.',
    category: 'editing',
    keys: { windows: 'Ctrl+K Ctrl+F', mac: 'Cmd+K Cmd+F' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'edit-delete-word-left',
    name: 'Delete Word Left',
    description: 'Delete the word to the left of cursor.',
    category: 'editing',
    keys: { windows: 'Ctrl+Backspace', mac: 'Option+Backspace' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-delete-word-right',
    name: 'Delete Word Right',
    description: 'Delete the word to the right of cursor.',
    category: 'editing',
    keys: { windows: 'Ctrl+Delete', mac: 'Option+Delete' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'edit-join-lines',
    name: 'Join Lines',
    description: 'Join the current line with the next line.',
    category: 'editing',
    keys: { windows: 'Ctrl+J', mac: 'Ctrl+J' },
    ide: ['jetbrains', 'sublime'],
    difficulty: 'intermediate',
  },
  {
    id: 'edit-transform-uppercase',
    name: 'Transform to Uppercase',
    description: 'Convert selected text to uppercase.',
    category: 'editing',
    keys: { windows: 'Ctrl+Shift+U', mac: 'Cmd+K Cmd+U' },
    ide: ['vscode', 'sublime'],
    difficulty: 'intermediate',
  },
  {
    id: 'edit-transform-lowercase',
    name: 'Transform to Lowercase',
    description: 'Convert selected text to lowercase.',
    category: 'editing',
    keys: { windows: 'Ctrl+U', mac: 'Cmd+K Cmd+L' },
    ide: ['vscode', 'sublime'],
    difficulty: 'intermediate',
  },

  // ============================================
  // SELECTION - Selecting code
  // ============================================
  {
    id: 'sel-select-all',
    name: 'Select All',
    description: 'Select all content in the file.',
    category: 'selection',
    keys: { windows: 'Ctrl+A', mac: 'Cmd+A' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'sel-select-line',
    name: 'Select Line',
    description: 'Select the entire current line.',
    category: 'selection',
    keys: { windows: 'Ctrl+L', mac: 'Cmd+L' },
    ide: ['vscode', 'sublime'],
    difficulty: 'beginner',
  },
  {
    id: 'sel-expand-selection',
    name: 'Expand Selection',
    description: 'Expand selection to the next larger syntax element.',
    category: 'selection',
    keys: { windows: 'Shift+Alt+Right', mac: 'Ctrl+Shift+Cmd+Right' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'sel-shrink-selection',
    name: 'Shrink Selection',
    description: 'Shrink selection to the next smaller syntax element.',
    category: 'selection',
    keys: { windows: 'Shift+Alt+Left', mac: 'Ctrl+Shift+Cmd+Left' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'sel-select-word',
    name: 'Select Word',
    description: 'Select the word at cursor position.',
    category: 'selection',
    keys: { windows: 'Ctrl+D', mac: 'Cmd+D' },
    ide: ['vscode', 'sublime'],
    difficulty: 'beginner',
  },
  {
    id: 'sel-select-all-occurrences',
    name: 'Select All Occurrences',
    description: 'Select all occurrences of the current word.',
    category: 'selection',
    keys: { windows: 'Ctrl+Shift+L', mac: 'Cmd+Shift+L' },
    ide: ['vscode', 'sublime'],
    difficulty: 'intermediate',
  },
  {
    id: 'sel-add-cursor-above',
    name: 'Add Cursor Above',
    description: 'Add a new cursor on the line above.',
    category: 'selection',
    keys: { windows: 'Ctrl+Alt+Up', mac: 'Cmd+Option+Up' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'sel-add-cursor-below',
    name: 'Add Cursor Below',
    description: 'Add a new cursor on the line below.',
    category: 'selection',
    keys: { windows: 'Ctrl+Alt+Down', mac: 'Cmd+Option+Down' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'sel-column-select',
    name: 'Column Selection',
    description: 'Start column (box) selection mode.',
    category: 'selection',
    keys: { windows: 'Shift+Alt+Drag', mac: 'Shift+Option+Drag' },
    ide: ['vscode', 'jetbrains', 'sublime'],
    difficulty: 'advanced',
  },
  {
    id: 'sel-select-to-line-start',
    name: 'Select to Line Start',
    description: 'Extend selection to the beginning of line.',
    category: 'selection',
    keys: { windows: 'Shift+Home', mac: 'Cmd+Shift+Left' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'sel-select-to-line-end',
    name: 'Select to Line End',
    description: 'Extend selection to the end of line.',
    category: 'selection',
    keys: { windows: 'Shift+End', mac: 'Cmd+Shift+Right' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'sel-select-word-left',
    name: 'Select Word Left',
    description: 'Extend selection one word to the left.',
    category: 'selection',
    keys: { windows: 'Ctrl+Shift+Left', mac: 'Option+Shift+Left' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'sel-select-word-right',
    name: 'Select Word Right',
    description: 'Extend selection one word to the right.',
    category: 'selection',
    keys: { windows: 'Ctrl+Shift+Right', mac: 'Option+Shift+Right' },
    ide: ['universal'],
    difficulty: 'beginner',
  },

  // ============================================
  // SEARCH - Finding and replacing
  // ============================================
  {
    id: 'search-find',
    name: 'Find',
    description: 'Open the find dialog to search in current file.',
    category: 'search',
    keys: { windows: 'Ctrl+F', mac: 'Cmd+F' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'search-replace',
    name: 'Find and Replace',
    description: 'Open find and replace dialog.',
    category: 'search',
    keys: { windows: 'Ctrl+H', mac: 'Cmd+Option+F' },
    ide: ['vscode', 'jetbrains', 'sublime'],
    difficulty: 'beginner',
  },
  {
    id: 'search-find-next',
    name: 'Find Next',
    description: 'Go to next search result.',
    category: 'search',
    keys: { windows: 'F3', mac: 'Cmd+G' },
    ide: ['vscode', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'search-find-prev',
    name: 'Find Previous',
    description: 'Go to previous search result.',
    category: 'search',
    keys: { windows: 'Shift+F3', mac: 'Cmd+Shift+G' },
    ide: ['vscode', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'search-find-in-files',
    name: 'Find in Files',
    description: 'Search across all files in the project.',
    category: 'search',
    keys: { windows: 'Ctrl+Shift+F', mac: 'Cmd+Shift+F' },
    ide: ['vscode', 'jetbrains', 'sublime', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'search-replace-in-files',
    name: 'Replace in Files',
    description: 'Find and replace across all files.',
    category: 'search',
    keys: { windows: 'Ctrl+Shift+H', mac: 'Cmd+Shift+H' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'search-toggle-case-sensitive',
    name: 'Toggle Case Sensitive',
    description: 'Toggle case-sensitive search.',
    category: 'search',
    keys: { windows: 'Alt+C', mac: 'Cmd+Option+C' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'search-toggle-regex',
    name: 'Toggle Regex',
    description: 'Toggle regular expression search.',
    category: 'search',
    keys: { windows: 'Alt+R', mac: 'Cmd+Option+R' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'search-toggle-whole-word',
    name: 'Toggle Whole Word',
    description: 'Toggle matching whole words only.',
    category: 'search',
    keys: { windows: 'Alt+W', mac: 'Cmd+Option+W' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },

  // ============================================
  // CODE ACTIONS - Intelligent coding assistance
  // ============================================
  {
    id: 'code-trigger-suggest',
    name: 'Trigger Suggestions',
    description: 'Show code completion suggestions.',
    category: 'code_actions',
    keys: { windows: 'Ctrl+Space', mac: 'Ctrl+Space' },
    ide: ['vscode', 'jetbrains', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'code-quick-fix',
    name: 'Quick Fix',
    description: 'Show quick fixes and refactoring options.',
    category: 'code_actions',
    keys: { windows: 'Ctrl+.', mac: 'Cmd+.' },
    ide: ['vscode'],
    difficulty: 'beginner',
  },
  {
    id: 'code-show-hover',
    name: 'Show Hover',
    description: 'Show hover information for symbol.',
    category: 'code_actions',
    keys: { windows: 'Ctrl+K Ctrl+I', mac: 'Cmd+K Cmd+I' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'code-parameter-hints',
    name: 'Parameter Hints',
    description: 'Show function parameter hints.',
    category: 'code_actions',
    keys: { windows: 'Ctrl+Shift+Space', mac: 'Cmd+Shift+Space' },
    ide: ['vscode', 'jetbrains'],
    difficulty: 'intermediate',
  },
  {
    id: 'code-rename-symbol',
    name: 'Rename Symbol',
    description: 'Rename a symbol across all files.',
    category: 'code_actions',
    keys: { windows: 'F2', mac: 'F2' },
    ide: ['vscode', 'jetbrains', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'code-go-to-references',
    name: 'Go to References',
    description: 'Find all references to a symbol.',
    category: 'code_actions',
    keys: { windows: 'Shift+F12', mac: 'Shift+F12' },
    ide: ['vscode', 'jetbrains'],
    difficulty: 'intermediate',
  },
  {
    id: 'code-organize-imports',
    name: 'Organize Imports',
    description: 'Sort and remove unused imports.',
    category: 'code_actions',
    keys: { windows: 'Shift+Alt+O', mac: 'Shift+Option+O' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'code-fold',
    name: 'Fold Region',
    description: 'Collapse the current code region.',
    category: 'code_actions',
    keys: { windows: 'Ctrl+Shift+[', mac: 'Cmd+Option+[' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'code-unfold',
    name: 'Unfold Region',
    description: 'Expand the current code region.',
    category: 'code_actions',
    keys: { windows: 'Ctrl+Shift+]', mac: 'Cmd+Option+]' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'code-fold-all',
    name: 'Fold All',
    description: 'Collapse all code regions in the file.',
    category: 'code_actions',
    keys: { windows: 'Ctrl+K Ctrl+0', mac: 'Cmd+K Cmd+0' },
    ide: ['vscode'],
    difficulty: 'advanced',
  },
  {
    id: 'code-unfold-all',
    name: 'Unfold All',
    description: 'Expand all code regions in the file.',
    category: 'code_actions',
    keys: { windows: 'Ctrl+K Ctrl+J', mac: 'Cmd+K Cmd+J' },
    ide: ['vscode'],
    difficulty: 'advanced',
  },

  // ============================================
  // TERMINAL - Integrated terminal
  // ============================================
  {
    id: 'term-toggle',
    name: 'Toggle Terminal',
    description: 'Show or hide the integrated terminal.',
    category: 'terminal',
    keys: { windows: 'Ctrl+`', mac: 'Ctrl+`' },
    ide: ['vscode'],
    difficulty: 'beginner',
  },
  {
    id: 'term-new',
    name: 'New Terminal',
    description: 'Create a new terminal instance.',
    category: 'terminal',
    keys: { windows: 'Ctrl+Shift+`', mac: 'Ctrl+Shift+`' },
    ide: ['vscode'],
    difficulty: 'beginner',
  },
  {
    id: 'term-kill',
    name: 'Kill Terminal',
    description: 'Close the current terminal instance.',
    category: 'terminal',
    keys: { windows: 'Ctrl+Shift+X', mac: 'Cmd+Shift+X' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'term-clear',
    name: 'Clear Terminal',
    description: 'Clear the terminal output.',
    category: 'terminal',
    keys: { windows: 'Ctrl+K', mac: 'Cmd+K' },
    ide: ['vscode'],
    difficulty: 'beginner',
  },
  {
    id: 'term-split',
    name: 'Split Terminal',
    description: 'Split the terminal into two panes.',
    category: 'terminal',
    keys: { windows: 'Ctrl+Shift+5', mac: 'Cmd+\\' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },

  // ============================================
  // FILE MANAGEMENT - Working with files
  // ============================================
  {
    id: 'file-new',
    name: 'New File',
    description: 'Create a new untitled file.',
    category: 'file_management',
    keys: { windows: 'Ctrl+N', mac: 'Cmd+N' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'file-open',
    name: 'Open File',
    description: 'Open a file from disk.',
    category: 'file_management',
    keys: { windows: 'Ctrl+O', mac: 'Cmd+O' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'file-save',
    name: 'Save File',
    description: 'Save the current file.',
    category: 'file_management',
    keys: { windows: 'Ctrl+S', mac: 'Cmd+S' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'file-save-as',
    name: 'Save As',
    description: 'Save the current file with a new name.',
    category: 'file_management',
    keys: { windows: 'Ctrl+Shift+S', mac: 'Cmd+Shift+S' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'file-save-all',
    name: 'Save All',
    description: 'Save all open files.',
    category: 'file_management',
    keys: { windows: 'Ctrl+K S', mac: 'Cmd+Option+S' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'file-close',
    name: 'Close File',
    description: 'Close the current file.',
    category: 'file_management',
    keys: { windows: 'Ctrl+W', mac: 'Cmd+W' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'file-close-all',
    name: 'Close All Files',
    description: 'Close all open files.',
    category: 'file_management',
    keys: { windows: 'Ctrl+K Ctrl+W', mac: 'Cmd+K Cmd+W' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'file-reopen-closed',
    name: 'Reopen Closed Editor',
    description: 'Reopen the most recently closed file.',
    category: 'file_management',
    keys: { windows: 'Ctrl+Shift+T', mac: 'Cmd+Shift+T' },
    ide: ['vscode', 'sublime'],
    difficulty: 'intermediate',
  },
  {
    id: 'file-next-editor',
    name: 'Next Editor',
    description: 'Switch to the next open file.',
    category: 'file_management',
    keys: { windows: 'Ctrl+Tab', mac: 'Ctrl+Tab' },
    ide: ['vscode', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'file-prev-editor',
    name: 'Previous Editor',
    description: 'Switch to the previous open file.',
    category: 'file_management',
    keys: { windows: 'Ctrl+Shift+Tab', mac: 'Ctrl+Shift+Tab' },
    ide: ['vscode', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'file-reveal-in-explorer',
    name: 'Reveal in Explorer',
    description: 'Show the current file in the file explorer.',
    category: 'file_management',
    keys: { windows: 'Ctrl+Shift+E', mac: 'Cmd+Shift+E' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },

  // ============================================
  // VIEW - Window and panel management
  // ============================================
  {
    id: 'view-command-palette',
    name: 'Command Palette',
    description: 'Open the command palette for quick access to all commands.',
    category: 'view',
    keys: { windows: 'Ctrl+Shift+P', mac: 'Cmd+Shift+P' },
    ide: ['vscode', 'sublime', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'view-toggle-sidebar',
    name: 'Toggle Sidebar',
    description: 'Show or hide the side bar.',
    category: 'view',
    keys: { windows: 'Ctrl+B', mac: 'Cmd+B' },
    ide: ['vscode'],
    difficulty: 'beginner',
  },
  {
    id: 'view-toggle-panel',
    name: 'Toggle Panel',
    description: 'Show or hide the bottom panel.',
    category: 'view',
    keys: { windows: 'Ctrl+J', mac: 'Cmd+J' },
    ide: ['vscode'],
    difficulty: 'beginner',
  },
  {
    id: 'view-zen-mode',
    name: 'Toggle Zen Mode',
    description: 'Enter distraction-free zen mode.',
    category: 'view',
    keys: { windows: 'Ctrl+K Z', mac: 'Cmd+K Z' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'view-split-editor',
    name: 'Split Editor',
    description: 'Split the editor into two panes.',
    category: 'view',
    keys: { windows: 'Ctrl+\\', mac: 'Cmd+\\' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'view-zoom-in',
    name: 'Zoom In',
    description: 'Increase editor font size.',
    category: 'view',
    keys: { windows: 'Ctrl++', mac: 'Cmd++' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'view-zoom-out',
    name: 'Zoom Out',
    description: 'Decrease editor font size.',
    category: 'view',
    keys: { windows: 'Ctrl+-', mac: 'Cmd+-' },
    ide: ['universal'],
    difficulty: 'beginner',
  },
  {
    id: 'view-reset-zoom',
    name: 'Reset Zoom',
    description: 'Reset editor font size to default.',
    category: 'view',
    keys: { windows: 'Ctrl+0', mac: 'Cmd+0' },
    ide: ['vscode', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'view-toggle-word-wrap',
    name: 'Toggle Word Wrap',
    description: 'Enable or disable word wrapping.',
    category: 'view',
    keys: { windows: 'Alt+Z', mac: 'Option+Z' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'view-focus-editor-1',
    name: 'Focus First Editor Group',
    description: 'Switch focus to the first editor group.',
    category: 'view',
    keys: { windows: 'Ctrl+1', mac: 'Cmd+1' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'view-focus-editor-2',
    name: 'Focus Second Editor Group',
    description: 'Switch focus to the second editor group.',
    category: 'view',
    keys: { windows: 'Ctrl+2', mac: 'Cmd+2' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },

  // ============================================
  // DEBUGGING - Debug controls
  // ============================================
  {
    id: 'debug-start',
    name: 'Start Debugging',
    description: 'Start the debugger.',
    category: 'debugging',
    keys: { windows: 'F5', mac: 'F5' },
    ide: ['vscode', 'jetbrains', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'debug-stop',
    name: 'Stop Debugging',
    description: 'Stop the debugger.',
    category: 'debugging',
    keys: { windows: 'Shift+F5', mac: 'Shift+F5' },
    ide: ['vscode', 'jetbrains'],
    difficulty: 'beginner',
  },
  {
    id: 'debug-restart',
    name: 'Restart Debugging',
    description: 'Restart the debug session.',
    category: 'debugging',
    keys: { windows: 'Ctrl+Shift+F5', mac: 'Cmd+Shift+F5' },
    ide: ['vscode'],
    difficulty: 'intermediate',
  },
  {
    id: 'debug-toggle-breakpoint',
    name: 'Toggle Breakpoint',
    description: 'Add or remove a breakpoint on the current line.',
    category: 'debugging',
    keys: { windows: 'F9', mac: 'F9' },
    ide: ['vscode', 'jetbrains', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'debug-step-over',
    name: 'Step Over',
    description: 'Execute the next line without entering functions.',
    category: 'debugging',
    keys: { windows: 'F10', mac: 'F10' },
    ide: ['vscode', 'jetbrains', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'debug-step-into',
    name: 'Step Into',
    description: 'Step into a function call.',
    category: 'debugging',
    keys: { windows: 'F11', mac: 'F11' },
    ide: ['vscode', 'jetbrains', 'universal'],
    difficulty: 'beginner',
  },
  {
    id: 'debug-step-out',
    name: 'Step Out',
    description: 'Step out of the current function.',
    category: 'debugging',
    keys: { windows: 'Shift+F11', mac: 'Shift+F11' },
    ide: ['vscode', 'jetbrains', 'universal'],
    difficulty: 'intermediate',
  },
  {
    id: 'debug-continue',
    name: 'Continue',
    description: 'Continue execution until next breakpoint.',
    category: 'debugging',
    keys: { windows: 'F5', mac: 'F5' },
    ide: ['vscode', 'jetbrains'],
    difficulty: 'beginner',
  },

  // ============================================
  // REFACTORING - Code transformation
  // ============================================
  {
    id: 'refactor-extract-method',
    name: 'Extract Method',
    description: 'Extract selected code into a new function.',
    category: 'refactoring',
    keys: { windows: 'Ctrl+Shift+R', mac: 'Cmd+Shift+R' },
    ide: ['jetbrains'],
    difficulty: 'advanced',
  },
  {
    id: 'refactor-extract-variable',
    name: 'Extract Variable',
    description: 'Extract expression into a new variable.',
    category: 'refactoring',
    keys: { windows: 'Ctrl+Alt+V', mac: 'Cmd+Option+V' },
    ide: ['jetbrains'],
    difficulty: 'advanced',
  },
  {
    id: 'refactor-inline',
    name: 'Inline Variable',
    description: 'Inline a variable and replace all usages.',
    category: 'refactoring',
    keys: { windows: 'Ctrl+Alt+N', mac: 'Cmd+Option+N' },
    ide: ['jetbrains'],
    difficulty: 'advanced',
  },
  {
    id: 'refactor-move',
    name: 'Move',
    description: 'Move class or function to another file.',
    category: 'refactoring',
    keys: { windows: 'F6', mac: 'F6' },
    ide: ['jetbrains'],
    difficulty: 'expert',
  },
  {
    id: 'refactor-safe-delete',
    name: 'Safe Delete',
    description: 'Delete a symbol and find usages first.',
    category: 'refactoring',
    keys: { windows: 'Alt+Delete', mac: 'Cmd+Delete' },
    ide: ['jetbrains'],
    difficulty: 'expert',
  },
];

/**
 * Generate shortcut lessons from the shortcuts database
 */
function generateShortcutLessons(): Lesson[] {
  const categoryNames: Record<ShortcutCategory, string> = {
    navigation: 'Navigation',
    editing: 'Editing',
    selection: 'Selection',
    search: 'Search & Replace',
    code_actions: 'Code Intelligence',
    terminal: 'Terminal',
    file_management: 'File Management',
    view: 'View & Window',
    debugging: 'Debugging',
    refactoring: 'Refactoring',
  };

  const categoryDescriptions: Record<ShortcutCategory, string> = {
    navigation: 'Master shortcuts for navigating through code and files quickly.',
    editing: 'Learn shortcuts for editing code faster without reaching for the mouse.',
    selection: 'Practice selecting code with precision using keyboard shortcuts.',
    search: 'Learn to find and replace text efficiently across files.',
    code_actions: 'Use intelligent code assistance features with keyboard shortcuts.',
    terminal: 'Control the integrated terminal without leaving your keyboard.',
    file_management: 'Open, save, and switch between files efficiently.',
    view: 'Control your editor layout and focus with shortcuts.',
    debugging: 'Debug your code faster with these essential debugging shortcuts.',
    refactoring: 'Transform your code safely with refactoring shortcuts.',
  };

  const lessons: Lesson[] = [];

  // Group shortcuts by category
  const byCategory = new Map<ShortcutCategory, KeyboardShortcut[]>();
  for (const shortcut of keyboardShortcuts) {
    const list = byCategory.get(shortcut.category) || [];
    list.push(shortcut);
    byCategory.set(shortcut.category, list);
  }

  // Create lessons for each category
  for (const [category, shortcuts] of byCategory.entries()) {
    // Group by difficulty within category
    const byDifficulty = new Map<Difficulty, KeyboardShortcut[]>();
    for (const shortcut of shortcuts) {
      const list = byDifficulty.get(shortcut.difficulty) || [];
      list.push(shortcut);
      byDifficulty.set(shortcut.difficulty, list);
    }

    // Create a lesson for each difficulty level that has shortcuts
    for (const [difficulty, diffShortcuts] of byDifficulty.entries()) {
      if (diffShortcuts.length < 3) continue; // Skip if too few shortcuts

      const lesson: Lesson = {
        id: `shortcuts-${category}-${difficulty}`,
        name: `${categoryNames[category]} (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`,
        description: categoryDescriptions[category],
        category: 'shortcuts',
        difficulty,
        tasks: diffShortcuts.slice(0, 8).map((shortcut, idx) => ({
          id: `${shortcut.id}-task`,
          instruction: `${shortcut.name}: ${shortcut.description}`,
          // Default to Windows keys, user can configure this
          targetText: shortcut.keys.windows,
          minAccuracy: 0.95,
          language: 'bash' as const,
        })),
      };

      lessons.push(lesson);
    }
  }

  // Create a comprehensive "Essential Shortcuts" lesson
  const essentialShortcuts = keyboardShortcuts.filter(
    s => ['file-save', 'edit-undo', 'edit-redo', 'search-find', 'edit-cut-line',
          'edit-copy-line', 'edit-toggle-comment', 'nav-go-to-file', 'view-command-palette',
          'code-quick-fix', 'code-rename-symbol', 'nav-go-to-definition'].includes(s.id)
  );

  lessons.unshift({
    id: 'shortcuts-essentials',
    name: 'Essential Shortcuts',
    description: 'The 12 most important shortcuts every developer should know.',
    category: 'shortcuts',
    difficulty: 'beginner',
    tasks: essentialShortcuts.map(shortcut => ({
      id: `${shortcut.id}-essential`,
      instruction: `${shortcut.name}: ${shortcut.description}`,
      targetText: shortcut.keys.windows,
      minAccuracy: 0.95,
      language: 'bash' as const,
    })),
  });

  // Create multi-cursor mastery lesson
  const multiCursorShortcuts = keyboardShortcuts.filter(
    s => s.id.includes('cursor') || s.id.includes('select-all-occurrences') || s.id.includes('column')
  );

  if (multiCursorShortcuts.length >= 3) {
    lessons.push({
      id: 'shortcuts-multi-cursor',
      name: 'Multi-Cursor Mastery',
      description: 'Learn to edit multiple locations at once with multi-cursor shortcuts.',
      category: 'shortcuts',
      difficulty: 'advanced',
      tasks: multiCursorShortcuts.map(shortcut => ({
        id: `${shortcut.id}-multi`,
        instruction: `${shortcut.name}: ${shortcut.description}`,
        targetText: shortcut.keys.windows,
        minAccuracy: 0.95,
        language: 'bash' as const,
      })),
    });
  }

  return lessons;
}

export const shortcutLessons = generateShortcutLessons();

export function getShortcutsByCategory(category: ShortcutCategory): KeyboardShortcut[] {
  return keyboardShortcuts.filter(s => s.category === category);
}

export function getShortcutsByIDE(ide: IDEType): KeyboardShortcut[] {
  return keyboardShortcuts.filter(s => s.ide.includes(ide));
}

export function getShortcutById(id: string): KeyboardShortcut | undefined {
  return keyboardShortcuts.find(s => s.id === id);
}
