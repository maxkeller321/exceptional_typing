import type { CodeLanguage } from '../types';

interface LanguagePattern {
  language: CodeLanguage;
  patterns: RegExp[];
  keywords: string[];
  weight: number;
}

const languagePatterns: LanguagePattern[] = [
  {
    language: 'typescript',
    patterns: [
      /:\s*(string|number|boolean|any|void|never|unknown)\b/,
      /interface\s+\w+/,
      /type\s+\w+\s*=/,
      /<[A-Z]\w*>/,
      /as\s+(string|number|boolean|any)/,
    ],
    keywords: ['interface', 'type', 'enum', 'namespace', 'declare', 'readonly', 'keyof', 'typeof'],
    weight: 1.2,
  },
  {
    language: 'javascript',
    patterns: [
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /function\s+\w+\s*\(/,
      /=>\s*{/,
      /console\.(log|error|warn)/,
      /require\s*\(/,
      /module\.exports/,
    ],
    keywords: ['const', 'let', 'var', 'function', 'async', 'await', 'import', 'export', 'class'],
    weight: 1.0,
  },
  {
    language: 'python',
    patterns: [
      /def\s+\w+\s*\(/,
      /class\s+\w+.*:/,
      /import\s+\w+/,
      /from\s+\w+\s+import/,
      /if\s+__name__\s*==\s*['"]__main__['"]/,
      /print\s*\(/,
      /:\s*$/m,
    ],
    keywords: ['def', 'class', 'import', 'from', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'with', 'lambda', 'self', 'None', 'True', 'False'],
    weight: 1.0,
  },
  {
    language: 'rust',
    patterns: [
      /fn\s+\w+\s*\(/,
      /let\s+mut\s+\w+/,
      /impl\s+\w+/,
      /pub\s+(fn|struct|enum)/,
      /use\s+\w+::/,
      /->\s*(i32|u32|String|bool|&str)/,
      /println!\s*\(/,
    ],
    keywords: ['fn', 'let', 'mut', 'pub', 'impl', 'struct', 'enum', 'trait', 'use', 'mod', 'match', 'Option', 'Result', 'Some', 'None', 'Ok', 'Err'],
    weight: 1.0,
  },
  {
    language: 'go',
    patterns: [
      /func\s+\w+\s*\(/,
      /package\s+\w+/,
      /import\s+\(/,
      /fmt\.(Print|Sprintf)/,
      /:=\s*/,
      /func\s+\(.*\)\s+\w+/,
    ],
    keywords: ['func', 'package', 'import', 'var', 'const', 'type', 'struct', 'interface', 'map', 'chan', 'go', 'defer', 'range'],
    weight: 1.0,
  },
  {
    language: 'java',
    patterns: [
      /public\s+class\s+\w+/,
      /private\s+(static\s+)?\w+\s+\w+/,
      /System\.out\.print/,
      /public\s+static\s+void\s+main/,
      /@Override/,
      /new\s+\w+\s*\(/,
    ],
    keywords: ['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'static', 'final', 'void', 'new', 'this', 'super'],
    weight: 1.0,
  },
  {
    language: 'c',
    patterns: [
      /#include\s*<\w+\.h>/,
      /int\s+main\s*\(/,
      /printf\s*\(/,
      /malloc\s*\(/,
      /sizeof\s*\(/,
      /\*\w+\s*=/,
    ],
    keywords: ['int', 'char', 'float', 'double', 'void', 'struct', 'typedef', 'enum', 'union', 'sizeof', 'return', 'if', 'else', 'for', 'while'],
    weight: 0.9,
  },
  {
    language: 'cpp',
    patterns: [
      /#include\s*<iostream>/,
      /std::/,
      /cout\s*<</,
      /cin\s*>>/,
      /class\s+\w+\s*{/,
      /template\s*</,
      /nullptr/,
    ],
    keywords: ['class', 'public', 'private', 'protected', 'virtual', 'override', 'template', 'namespace', 'using', 'new', 'delete', 'nullptr', 'std'],
    weight: 1.0,
  },
  {
    language: 'csharp',
    patterns: [
      /using\s+System/,
      /namespace\s+\w+/,
      /public\s+class\s+\w+/,
      /Console\.(Write|ReadLine)/,
      /\[.*\]/,
      /async\s+Task/,
    ],
    keywords: ['using', 'namespace', 'class', 'public', 'private', 'protected', 'static', 'void', 'var', 'async', 'await', 'new', 'this', 'base'],
    weight: 1.0,
  },
  {
    language: 'html',
    patterns: [
      /<html/i,
      /<head/i,
      /<body/i,
      /<div/i,
      /<\/\w+>/,
      /<!DOCTYPE/i,
    ],
    keywords: ['html', 'head', 'body', 'div', 'span', 'class', 'id', 'href', 'src'],
    weight: 1.0,
  },
  {
    language: 'css',
    patterns: [
      /\.\w+\s*{/,
      /#\w+\s*{/,
      /:\s*(flex|grid|block|none)/,
      /@media/,
      /background(-color)?:/,
      /margin:|padding:/,
    ],
    keywords: ['color', 'background', 'margin', 'padding', 'border', 'display', 'position', 'flex', 'grid'],
    weight: 1.0,
  },
  {
    language: 'json',
    patterns: [
      /^\s*{/,
      /"[^"]+"\s*:/,
      /:\s*\[/,
      /:\s*(true|false|null)/,
    ],
    keywords: [],
    weight: 0.8,
  },
  {
    language: 'sql',
    patterns: [
      /SELECT\s+.*\s+FROM/i,
      /INSERT\s+INTO/i,
      /UPDATE\s+\w+\s+SET/i,
      /CREATE\s+TABLE/i,
      /WHERE\s+\w+/i,
      /JOIN\s+\w+\s+ON/i,
    ],
    keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'TABLE', 'INDEX', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'GROUP', 'ORDER', 'BY'],
    weight: 1.0,
  },
  {
    language: 'bash',
    patterns: [
      /^#!/,
      /\$\{?\w+\}?/,
      /echo\s+/,
      /if\s+\[\[?/,
      /for\s+\w+\s+in/,
      /\|\s*(grep|awk|sed)/,
    ],
    keywords: ['echo', 'if', 'then', 'else', 'fi', 'for', 'do', 'done', 'while', 'case', 'esac', 'function', 'export', 'source'],
    weight: 1.0,
  },
  {
    language: 'markdown',
    patterns: [
      /^#\s+\w/m,
      /^\*\s+\w/m,
      /^\d+\.\s+\w/m,
      /\[.*\]\(.*\)/,
      /```\w*/,
      /\*\*\w+\*\*/,
    ],
    keywords: [],
    weight: 0.7,
  },
];

export function detectLanguage(code: string): CodeLanguage | null {
  if (!code || code.trim().length === 0) return null;

  const scores: Map<CodeLanguage, number> = new Map();

  for (const lang of languagePatterns) {
    let score = 0;

    // Check patterns
    for (const pattern of lang.patterns) {
      if (pattern.test(code)) {
        score += 2;
      }
    }

    // Check keywords (case-insensitive for SQL)
    const codeWords = code.split(/\s+/);
    for (const keyword of lang.keywords) {
      const regex = lang.language === 'sql'
        ? new RegExp(`\\b${keyword}\\b`, 'i')
        : new RegExp(`\\b${keyword}\\b`);
      if (regex.test(code)) {
        score += 1;
      }
    }

    // Apply weight
    score *= lang.weight;

    if (score > 0) {
      scores.set(lang.language, score);
    }
  }

  // Find the highest scoring language
  let bestLanguage: CodeLanguage | null = null;
  let bestScore = 0;

  for (const [language, score] of scores) {
    if (score > bestScore) {
      bestScore = score;
      bestLanguage = language;
    }
  }

  // Require minimum confidence
  if (bestScore < 3) return null;

  return bestLanguage;
}

// Map of file extensions to languages
const extensionMap: Record<string, CodeLanguage> = {
  'js': 'javascript',
  'jsx': 'javascript',
  'ts': 'typescript',
  'tsx': 'typescript',
  'py': 'python',
  'rs': 'rust',
  'go': 'go',
  'java': 'java',
  'c': 'c',
  'h': 'c',
  'cpp': 'cpp',
  'cc': 'cpp',
  'hpp': 'cpp',
  'cs': 'csharp',
  'html': 'html',
  'htm': 'html',
  'css': 'css',
  'json': 'json',
  'sql': 'sql',
  'sh': 'bash',
  'bash': 'bash',
  'md': 'markdown',
  'markdown': 'markdown',
};

export function getLanguageFromExtension(filename: string): CodeLanguage | null {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (!ext) return null;
  return extensionMap[ext] || null;
}

export function getLanguageDisplayName(language: CodeLanguage): string {
  const names: Record<CodeLanguage, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    rust: 'Rust',
    go: 'Go',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    csharp: 'C#',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    sql: 'SQL',
    bash: 'Bash',
    markdown: 'Markdown',
  };
  return names[language] || language;
}
