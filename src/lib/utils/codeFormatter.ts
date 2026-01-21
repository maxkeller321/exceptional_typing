import type { CodeLanguage } from '../types';

/**
 * Code formatter utility for standardizing code formatting
 * across different programming languages
 */

export interface FormatOptions {
  indentSize: number;
  useTabs: boolean;
  maxLineLength: number;
}

const defaultOptions: FormatOptions = {
  indentSize: 2,
  useTabs: false,
  maxLineLength: 80,
};

/**
 * Format code according to standard rules for the given language
 */
export function formatCode(code: string, language: CodeLanguage, options: Partial<FormatOptions> = {}): string {
  const opts = { ...defaultOptions, ...options };

  switch (language) {
    case 'javascript':
    case 'typescript':
      return formatJavaScript(code, opts);
    case 'rust':
      return formatRust(code, opts);
    case 'python':
      return formatPython(code, opts);
    case 'go':
      return formatGo(code, opts);
    case 'java':
    case 'csharp':
    case 'cpp':
    case 'c':
      return formatCStyle(code, opts);
    case 'html':
      return formatHtml(code, opts);
    case 'css':
      return formatCss(code, opts);
    case 'json':
      return formatJson(code, opts);
    case 'sql':
      return formatSql(code, opts);
    case 'bash':
      return formatBash(code, opts);
    default:
      return normalizeWhitespace(code);
  }
}

/**
 * Normalize whitespace: collapse multiple spaces, trim lines
 */
function normalizeWhitespace(code: string): string {
  return code
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Get indent string based on options
 */
function getIndent(level: number, opts: FormatOptions): string {
  const char = opts.useTabs ? '\t' : ' '.repeat(opts.indentSize);
  return char.repeat(level);
}

/**
 * Format JavaScript/TypeScript code
 */
function formatJavaScript(code: string, opts: FormatOptions): string {
  let result = code;

  // Normalize spaces around operators
  result = result.replace(/\s*([=+\-*/%<>!&|^]+=?)\s*/g, ' $1 ');
  result = result.replace(/\s*([,;])\s*/g, '$1 ');

  // Fix double spaces
  result = result.replace(/  +/g, ' ');

  // Space after keywords
  result = result.replace(/\b(if|for|while|switch|catch|function|return|const|let|var)\(/g, '$1 (');

  // Space before opening brace
  result = result.replace(/\)\s*\{/g, ') {');

  // Arrow function spacing
  result = result.replace(/\s*=>\s*/g, ' => ');

  // Fix spacing around colons in objects
  result = result.replace(/:\s*/g, ': ');
  result = result.replace(/\s*:/g, ':');

  // Multi-line formatting
  if (result.includes('{') && result.includes('}')) {
    result = formatBraces(result, opts);
  }

  return result.trim();
}

/**
 * Format Rust code
 */
function formatRust(code: string, opts: FormatOptions): string {
  let result = code;

  // Normalize spaces around operators
  result = result.replace(/\s*([=+\-*/%<>!&|^]+=?)\s*/g, ' $1 ');
  result = result.replace(/\s*([,;])\s*/g, '$1 ');

  // Fix double spaces
  result = result.replace(/  +/g, ' ');

  // Space after keywords
  result = result.replace(/\b(fn|let|mut|if|for|while|match|impl|struct|enum|pub|use|mod|return)\s+/g, '$1 ');

  // Fix function definitions
  result = result.replace(/fn\s+(\w+)\s*\(/g, 'fn $1(');

  // Space before opening brace
  result = result.replace(/\)\s*\{/g, ') {');
  result = result.replace(/(\w)\s*\{/g, '$1 {');

  // Match arm formatting
  result = result.replace(/\s*=>\s*/g, ' => ');

  // Type annotations
  result = result.replace(/:\s*/g, ': ');
  result = result.replace(/\s*:/g, ':');

  // Turbofish operator
  result = result.replace(/::\s*</g, '::<');

  // Multi-line formatting
  if (result.includes('{') && result.includes('}')) {
    result = formatBraces(result, opts);
  }

  return result.trim();
}

/**
 * Format Python code
 */
function formatPython(code: string, opts: FormatOptions): string {
  let result = code;

  // PEP 8 style formatting
  // Spaces around operators
  result = result.replace(/\s*([=+\-*/%<>!&|^]+=?)\s*/g, ' $1 ');
  result = result.replace(/\s*([,])\s*/g, '$1 ');

  // Fix double spaces
  result = result.replace(/  +/g, ' ');

  // Space after keywords
  result = result.replace(/\b(def|class|if|elif|else|for|while|return|import|from|as|with|try|except|finally|raise|yield|lambda)\s+/g, '$1 ');

  // No space before colon in function definitions and control statements
  result = result.replace(/\s+:/g, ':');

  // Space after colon (except for slices)
  result = result.replace(/:(?![\d\]])/g, ': ');
  result = result.replace(/:\s+(?=[\d\]])/g, ':');

  return result.trim();
}

/**
 * Format Go code
 */
function formatGo(code: string, opts: FormatOptions): string {
  // Go uses tabs by default
  const goOpts = { ...opts, useTabs: true, indentSize: 1 };
  let result = code;

  // Normalize spaces around operators
  result = result.replace(/\s*([=+\-*/%<>!&|^]+=?)\s*/g, ' $1 ');
  result = result.replace(/\s*([,;])\s*/g, '$1 ');

  // Fix double spaces
  result = result.replace(/  +/g, ' ');

  // Space after keywords
  result = result.replace(/\b(func|if|for|switch|case|return|var|const|type|struct|interface|package|import)\s+/g, '$1 ');

  // Space before opening brace (Go style: same line)
  result = result.replace(/\)\s*\{/g, ') {');

  // Short variable declaration
  result = result.replace(/\s*:=\s*/g, ' := ');

  // Multi-line formatting
  if (result.includes('{') && result.includes('}')) {
    result = formatBraces(result, goOpts);
  }

  return result.trim();
}

/**
 * Format C-style languages (C, C++, Java, C#)
 */
function formatCStyle(code: string, opts: FormatOptions): string {
  let result = code;

  // Normalize spaces around operators
  result = result.replace(/\s*([=+\-*/%<>!&|^]+=?)\s*/g, ' $1 ');
  result = result.replace(/\s*([,;])\s*/g, '$1 ');

  // Fix double spaces
  result = result.replace(/  +/g, ' ');

  // Space after keywords
  result = result.replace(/\b(if|for|while|switch|catch|return|class|public|private|protected|static|void|int|float|double|char|bool|string)\s+/g, '$1 ');

  // Space before opening brace
  result = result.replace(/\)\s*\{/g, ') {');

  // Multi-line formatting
  if (result.includes('{') && result.includes('}')) {
    result = formatBraces(result, opts);
  }

  return result.trim();
}

/**
 * Format HTML code
 */
function formatHtml(code: string, opts: FormatOptions): string {
  let result = code;

  // Normalize attribute spacing
  result = result.replace(/\s*=\s*"/g, '="');
  result = result.replace(/"\s*>/g, '">');

  // Single space between attributes
  result = result.replace(/"\s+(\w)/g, '" $1');

  return result.trim();
}

/**
 * Format CSS code
 */
function formatCss(code: string, opts: FormatOptions): string {
  let result = code;

  // Space after colon in properties
  result = result.replace(/:\s*/g, ': ');

  // Space before opening brace
  result = result.replace(/\s*\{/g, ' {');

  // Semicolon spacing
  result = result.replace(/\s*;/g, ';');

  return result.trim();
}

/**
 * Format JSON
 */
function formatJson(code: string, opts: FormatOptions): string {
  try {
    const parsed = JSON.parse(code);
    return JSON.stringify(parsed, null, opts.indentSize);
  } catch {
    // If invalid JSON, just normalize whitespace
    let result = code;
    result = result.replace(/:\s*/g, ': ');
    result = result.replace(/,\s*/g, ', ');
    return result.trim();
  }
}

/**
 * Format SQL
 */
function formatSql(code: string, opts: FormatOptions): string {
  let result = code.toUpperCase();

  // Keywords on their own lines for readability
  const keywords = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER BY', 'GROUP BY', 'HAVING', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'ON', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'];

  // Normalize spaces
  result = result.replace(/\s+/g, ' ');

  // Space around operators
  result = result.replace(/\s*([=<>])\s*/g, ' $1 ');

  return result.trim();
}

/**
 * Format Bash/Shell
 */
function formatBash(code: string, opts: FormatOptions): string {
  let result = code;

  // Space around operators
  result = result.replace(/\s*=\s*/g, '='); // No space around = in variable assignment
  result = result.replace(/\s*([|&;])\s*/g, ' $1 ');

  // Fix double spaces
  result = result.replace(/  +/g, ' ');

  return result.trim();
}

/**
 * Format braces with proper indentation
 */
function formatBraces(code: string, opts: FormatOptions): string {
  // For single-line code snippets, keep on one line but ensure proper spacing
  if (!code.includes('\n')) {
    let result = code;

    // Ensure space before opening brace
    result = result.replace(/(\S)\{/g, '$1 {');

    // Ensure space after opening brace if followed by content
    result = result.replace(/\{\s*(\S)/g, '{ $1');

    // Ensure space before closing brace if preceded by content
    result = result.replace(/(\S)\s*\}/g, '$1 }');

    // Fix multiple spaces
    result = result.replace(/  +/g, ' ');

    return result;
  }

  // Multi-line formatting
  const lines = code.split('\n');
  let indentLevel = 0;
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Decrease indent for closing braces
    if (trimmed.startsWith('}') || trimmed.startsWith(')') || trimmed.startsWith(']')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add line with proper indentation
    if (trimmed) {
      result.push(getIndent(indentLevel, opts) + trimmed);
    } else {
      result.push('');
    }

    // Increase indent after opening braces
    if (trimmed.endsWith('{') || trimmed.endsWith('(') || trimmed.endsWith('[')) {
      indentLevel++;
    }
  }

  return result.join('\n');
}

/**
 * Check if formatting would significantly change the code
 */
export function wouldFormat(code: string, language: CodeLanguage): boolean {
  const formatted = formatCode(code, language);
  return formatted !== code;
}

/**
 * Get a preview of formatting changes
 */
export function getFormatPreview(code: string, language: CodeLanguage): { original: string; formatted: string } {
  return {
    original: code,
    formatted: formatCode(code, language),
  };
}
