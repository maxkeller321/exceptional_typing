import hljs from 'highlight.js/lib/core';

// Import commonly used languages
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import go from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import xml from 'highlight.js/lib/languages/xml'; // HTML uses xml
import css from 'highlight.js/lib/languages/css';
import json from 'highlight.js/lib/languages/json';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';
import markdown from 'highlight.js/lib/languages/markdown';

import type { CodeLanguage } from '../types';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('go', go);
hljs.registerLanguage('java', java);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('markdown', markdown);

// Token types to CSS classes mapping for consistent styling
export interface HighlightToken {
  text: string;
  type: string | null; // null means plain text
  start: number;
  end: number;
}

/**
 * Highlight code and return tokens with their types
 */
export function highlightCode(code: string, language: CodeLanguage): HighlightToken[] {
  try {
    const result = hljs.highlight(code, { language });
    return parseHighlightResult(result.value, code);
  } catch {
    // If highlighting fails, return as plain text
    return [{ text: code, type: null, start: 0, end: code.length }];
  }
}

/**
 * Parse the HTML result from highlight.js into tokens
 */
function parseHighlightResult(html: string, originalCode: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  let currentIndex = 0;

  // Simple regex-based HTML parsing for span tags
  const regex = /<span class="([^"]+)">([^<]*)<\/span>|([^<]+)/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const className = match[1];
    const spanText = match[2];
    const plainText = match[3];

    if (spanText !== undefined) {
      // Decode HTML entities
      const text = decodeHtmlEntities(spanText);
      tokens.push({
        text,
        type: className,
        start: currentIndex,
        end: currentIndex + text.length,
      });
      currentIndex += text.length;
    } else if (plainText !== undefined) {
      const text = decodeHtmlEntities(plainText);
      tokens.push({
        text,
        type: null,
        start: currentIndex,
        end: currentIndex + text.length,
      });
      currentIndex += text.length;
    }
  }

  // Handle nested spans by flattening
  return flattenTokens(tokens, originalCode);
}

/**
 * Flatten tokens to ensure each character is accounted for
 */
function flattenTokens(tokens: HighlightToken[], originalCode: string): HighlightToken[] {
  const result: HighlightToken[] = [];
  let codeIndex = 0;

  for (const token of tokens) {
    // Add each character as a separate token for precise typing tracking
    for (let i = 0; i < token.text.length; i++) {
      if (codeIndex < originalCode.length) {
        result.push({
          text: originalCode[codeIndex],
          type: token.type,
          start: codeIndex,
          end: codeIndex + 1,
        });
        codeIndex++;
      }
    }
  }

  // Add any remaining characters as plain text
  while (codeIndex < originalCode.length) {
    result.push({
      text: originalCode[codeIndex],
      type: null,
      start: codeIndex,
      end: codeIndex + 1,
    });
    codeIndex++;
  }

  return result;
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

/**
 * Get CSS color for a highlight.js token type
 * Based on popular color themes (VS Code Dark+, One Dark, etc.)
 */
export function getTokenColor(tokenType: string | null, theme: CodeTheme = 'vscode-dark'): string {
  const colors = themeColors[theme];

  if (!tokenType) return colors.default;

  // Map hljs classes to colors
  if (tokenType.includes('keyword')) return colors.keyword;
  if (tokenType.includes('built_in')) return colors.builtin;
  if (tokenType.includes('type')) return colors.type;
  if (tokenType.includes('literal') || tokenType.includes('number')) return colors.number;
  if (tokenType.includes('string')) return colors.string;
  if (tokenType.includes('regexp')) return colors.regex;
  if (tokenType.includes('comment')) return colors.comment;
  if (tokenType.includes('function')) return colors.function;
  if (tokenType.includes('class')) return colors.class;
  if (tokenType.includes('variable')) return colors.variable;
  if (tokenType.includes('property')) return colors.property;
  if (tokenType.includes('operator')) return colors.operator;
  if (tokenType.includes('punctuation')) return colors.punctuation;
  if (tokenType.includes('attr')) return colors.attribute;
  if (tokenType.includes('tag')) return colors.tag;
  if (tokenType.includes('meta')) return colors.meta;
  if (tokenType.includes('params')) return colors.params;
  if (tokenType.includes('title')) return colors.function;

  return colors.default;
}

export type CodeTheme = 'vscode-dark' | 'one-dark' | 'github-dark' | 'dracula' | 'monokai' | 'nord' | 'solarized-dark' | 'gruvbox-dark' | 'tokyo-night';

interface ThemeColors {
  default: string;
  keyword: string;
  builtin: string;
  type: string;
  number: string;
  string: string;
  regex: string;
  comment: string;
  function: string;
  class: string;
  variable: string;
  property: string;
  operator: string;
  punctuation: string;
  attribute: string;
  tag: string;
  meta: string;
  params: string;
}

const themeColors: Record<CodeTheme, ThemeColors> = {
  'vscode-dark': {
    default: '#d4d4d4',
    keyword: '#569cd6',
    builtin: '#4ec9b0',
    type: '#4ec9b0',
    number: '#b5cea8',
    string: '#ce9178',
    regex: '#d16969',
    comment: '#6a9955',
    function: '#dcdcaa',
    class: '#4ec9b0',
    variable: '#9cdcfe',
    property: '#9cdcfe',
    operator: '#d4d4d4',
    punctuation: '#d4d4d4',
    attribute: '#9cdcfe',
    tag: '#569cd6',
    meta: '#c586c0',
    params: '#9cdcfe',
  },
  'one-dark': {
    default: '#abb2bf',
    keyword: '#c678dd',
    builtin: '#e5c07b',
    type: '#e5c07b',
    number: '#d19a66',
    string: '#98c379',
    regex: '#56b6c2',
    comment: '#5c6370',
    function: '#61afef',
    class: '#e5c07b',
    variable: '#e06c75',
    property: '#e06c75',
    operator: '#56b6c2',
    punctuation: '#abb2bf',
    attribute: '#d19a66',
    tag: '#e06c75',
    meta: '#c678dd',
    params: '#abb2bf',
  },
  'github-dark': {
    default: '#c9d1d9',
    keyword: '#ff7b72',
    builtin: '#79c0ff',
    type: '#79c0ff',
    number: '#79c0ff',
    string: '#a5d6ff',
    regex: '#7ee787',
    comment: '#8b949e',
    function: '#d2a8ff',
    class: '#ffa657',
    variable: '#c9d1d9',
    property: '#c9d1d9',
    operator: '#ff7b72',
    punctuation: '#c9d1d9',
    attribute: '#79c0ff',
    tag: '#7ee787',
    meta: '#ffa657',
    params: '#c9d1d9',
  },
  'dracula': {
    default: '#f8f8f2',
    keyword: '#ff79c6',
    builtin: '#8be9fd',
    type: '#8be9fd',
    number: '#bd93f9',
    string: '#f1fa8c',
    regex: '#ffb86c',
    comment: '#6272a4',
    function: '#50fa7b',
    class: '#8be9fd',
    variable: '#f8f8f2',
    property: '#f8f8f2',
    operator: '#ff79c6',
    punctuation: '#f8f8f2',
    attribute: '#50fa7b',
    tag: '#ff79c6',
    meta: '#ffb86c',
    params: '#ffb86c',
  },
  'monokai': {
    default: '#f8f8f2',
    keyword: '#f92672',
    builtin: '#66d9ef',
    type: '#66d9ef',
    number: '#ae81ff',
    string: '#e6db74',
    regex: '#e6db74',
    comment: '#75715e',
    function: '#a6e22e',
    class: '#66d9ef',
    variable: '#f8f8f2',
    property: '#f8f8f2',
    operator: '#f92672',
    punctuation: '#f8f8f2',
    attribute: '#a6e22e',
    tag: '#f92672',
    meta: '#ae81ff',
    params: '#fd971f',
  },
  'nord': {
    default: '#d8dee9',
    keyword: '#81a1c1',
    builtin: '#88c0d0',
    type: '#8fbcbb',
    number: '#b48ead',
    string: '#a3be8c',
    regex: '#ebcb8b',
    comment: '#616e88',
    function: '#88c0d0',
    class: '#8fbcbb',
    variable: '#d8dee9',
    property: '#d8dee9',
    operator: '#81a1c1',
    punctuation: '#eceff4',
    attribute: '#8fbcbb',
    tag: '#81a1c1',
    meta: '#5e81ac',
    params: '#d8dee9',
  },
  'solarized-dark': {
    default: '#839496',
    keyword: '#859900',
    builtin: '#268bd2',
    type: '#b58900',
    number: '#d33682',
    string: '#2aa198',
    regex: '#dc322f',
    comment: '#586e75',
    function: '#268bd2',
    class: '#b58900',
    variable: '#839496',
    property: '#839496',
    operator: '#859900',
    punctuation: '#839496',
    attribute: '#93a1a1',
    tag: '#268bd2',
    meta: '#cb4b16',
    params: '#839496',
  },
  'gruvbox-dark': {
    default: '#ebdbb2',
    keyword: '#fb4934',
    builtin: '#83a598',
    type: '#fabd2f',
    number: '#d3869b',
    string: '#b8bb26',
    regex: '#fe8019',
    comment: '#928374',
    function: '#8ec07c',
    class: '#fabd2f',
    variable: '#ebdbb2',
    property: '#ebdbb2',
    operator: '#fb4934',
    punctuation: '#ebdbb2',
    attribute: '#8ec07c',
    tag: '#fb4934',
    meta: '#fe8019',
    params: '#ebdbb2',
  },
  'tokyo-night': {
    default: '#a9b1d6',
    keyword: '#bb9af7',
    builtin: '#7dcfff',
    type: '#2ac3de',
    number: '#ff9e64',
    string: '#9ece6a',
    regex: '#89ddff',
    comment: '#565f89',
    function: '#7aa2f7',
    class: '#2ac3de',
    variable: '#c0caf5',
    property: '#c0caf5',
    operator: '#89ddff',
    punctuation: '#a9b1d6',
    attribute: '#bb9af7',
    tag: '#f7768e',
    meta: '#ff9e64',
    params: '#e0af68',
  },
};

export const availableThemes: { value: CodeTheme; label: string }[] = [
  { value: 'vscode-dark', label: 'VS Code Dark+' },
  { value: 'one-dark', label: 'One Dark' },
  { value: 'github-dark', label: 'GitHub Dark' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'nord', label: 'Nord' },
  { value: 'solarized-dark', label: 'Solarized Dark' },
  { value: 'gruvbox-dark', label: 'Gruvbox Dark' },
  { value: 'tokyo-night', label: 'Tokyo Night' },
];
