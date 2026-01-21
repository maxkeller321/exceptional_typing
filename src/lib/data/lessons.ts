import type { Lesson } from '../types';
import { commandLessons } from './commandLessons';
import { shortcutLessons } from './shortcutLessons';

export const lessons: Lesson[] = [
  // Home Row Lessons
  {
    id: 'home-row-basics',
    name: 'Home Row Basics',
    description: 'Master the foundation of touch typing with the home row keys.',
    category: 'home_row',
    difficulty: 'beginner',
    tasks: [
      {
        id: 'hr-1',
        instruction: 'Place your fingers on the home row. Type the left hand keys.',
        targetText: 'asdf asdf asdf asdf',
        minAccuracy: 0.9,
      },
      {
        id: 'hr-2',
        instruction: 'Now practice the right hand home row keys.',
        targetText: 'jkl; jkl; jkl; jkl;',
        minAccuracy: 0.9,
      },
      {
        id: 'hr-3',
        instruction: 'Combine both hands on the home row.',
        targetText: 'asdf jkl; asdf jkl; asdf jkl;',
        minAccuracy: 0.9,
      },
      {
        id: 'hr-4',
        instruction: 'Practice alternating between hands.',
        targetText: 'aj sk dl f; aj sk dl f; aj sk dl f;',
        minAccuracy: 0.9,
      },
      {
        id: 'hr-5',
        instruction: 'Type common home row patterns.',
        targetText: 'sad dad fall salad flask ask lads',
        minAccuracy: 0.85,
      },
    ],
  },
  {
    id: 'home-row-words',
    name: 'Home Row Words',
    description: 'Practice real words using only home row keys.',
    category: 'home_row',
    difficulty: 'beginner',
    tasks: [
      {
        id: 'hrw-1',
        instruction: 'Type these simple home row words.',
        targetText: 'as a sad lad adds salads',
        minAccuracy: 0.9,
      },
      {
        id: 'hrw-2',
        instruction: 'Continue with more home row vocabulary.',
        targetText: 'all fall flasklasslass ska',
        minAccuracy: 0.9,
      },
      {
        id: 'hrw-3',
        instruction: 'Practice longer home row phrases.',
        targetText: 'a sad lad falls as a lass asks dad',
        minAccuracy: 0.85,
      },
    ],
  },

  // Top Row Lessons
  {
    id: 'top-row-intro',
    name: 'Top Row Introduction',
    description: 'Learn to reach up to the top row while maintaining home position.',
    category: 'top_row',
    difficulty: 'beginner',
    tasks: [
      {
        id: 'tr-1',
        instruction: 'Practice the left hand top row keys.',
        targetText: 'qwer qwer qwer qwer',
        minAccuracy: 0.85,
      },
      {
        id: 'tr-2',
        instruction: 'Practice the right hand top row keys.',
        targetText: 'uiop uiop uiop uiop',
        minAccuracy: 0.85,
      },
      {
        id: 'tr-3',
        instruction: 'Combine top row with home row.',
        targetText: 'we are quite ripe to type',
        minAccuracy: 0.85,
      },
      {
        id: 'tr-4',
        instruction: 'Practice common top row words.',
        targetText: 'write quote power require were you',
        minAccuracy: 0.85,
      },
    ],
  },

  // Bottom Row Lessons
  {
    id: 'bottom-row-intro',
    name: 'Bottom Row Introduction',
    description: 'Master the bottom row keys with proper finger positioning.',
    category: 'bottom_row',
    difficulty: 'beginner',
    tasks: [
      {
        id: 'br-1',
        instruction: 'Practice the left hand bottom row.',
        targetText: 'zxcv zxcv zxcv zxcv',
        minAccuracy: 0.85,
      },
      {
        id: 'br-2',
        instruction: 'Practice the right hand bottom row.',
        targetText: 'nm,. nm,. nm,. nm,.',
        minAccuracy: 0.85,
      },
      {
        id: 'br-3',
        instruction: 'Combine bottom row with home row.',
        targetText: 'can van man ban calm clam',
        minAccuracy: 0.85,
      },
    ],
  },

  // Full Keyboard
  {
    id: 'all-rows-basic',
    name: 'Full Keyboard Basics',
    description: 'Combine all rows for complete keyboard coverage.',
    category: 'words',
    difficulty: 'intermediate',
    tasks: [
      {
        id: 'arb-1',
        instruction: 'Type words using all three rows.',
        targetText: 'the quick brown fox jumps over',
        minAccuracy: 0.85,
      },
      {
        id: 'arb-2',
        instruction: 'Continue with the classic pangram.',
        targetText: 'the lazy dog packs my box with',
        minAccuracy: 0.85,
      },
      {
        id: 'arb-3',
        instruction: 'Complete the pangram phrase.',
        targetText: 'five dozen liquor jugs amazingly',
        minAccuracy: 0.85,
      },
    ],
  },

  // Common Words
  {
    id: 'common-words-100',
    name: 'Top 100 Words',
    description: 'Practice the most frequently used English words.',
    category: 'words',
    difficulty: 'intermediate',
    tasks: [
      {
        id: 'cw-1',
        instruction: 'Type these common words accurately.',
        targetText: 'the be to of and a in that have I',
        minAccuracy: 0.9,
      },
      {
        id: 'cw-2',
        instruction: 'Continue with more common words.',
        targetText: 'it for not on with he as you do at',
        minAccuracy: 0.9,
      },
      {
        id: 'cw-3',
        instruction: 'Practice these frequent words.',
        targetText: 'this but his by from they we say her she',
        minAccuracy: 0.9,
      },
      {
        id: 'cw-4',
        instruction: 'More essential vocabulary.',
        targetText: 'or an will my one all would there their what',
        minAccuracy: 0.9,
      },
    ],
  },

  // Sentences
  {
    id: 'simple-sentences',
    name: 'Simple Sentences',
    description: 'Practice typing complete sentences with proper punctuation.',
    category: 'sentences',
    difficulty: 'intermediate',
    tasks: [
      {
        id: 'ss-1',
        instruction: 'Type this sentence with correct capitalization.',
        targetText: 'The quick brown fox jumps over the lazy dog.',
        minAccuracy: 0.9,
      },
      {
        id: 'ss-2',
        instruction: 'Practice sentences with commas.',
        targetText: 'Hello, how are you doing today?',
        minAccuracy: 0.9,
      },
      {
        id: 'ss-3',
        instruction: 'Type a longer sentence.',
        targetText: 'Practice makes perfect, so keep typing every day.',
        minAccuracy: 0.85,
      },
    ],
  },

  // Numbers
  {
    id: 'numbers-intro',
    name: 'Number Row',
    description: 'Master the number keys above the top row.',
    category: 'numbers',
    difficulty: 'intermediate',
    tasks: [
      {
        id: 'num-1',
        instruction: 'Practice typing numbers.',
        targetText: '1234567890 1234567890 1234567890',
        minAccuracy: 0.9,
      },
      {
        id: 'num-2',
        instruction: 'Mix numbers with words.',
        targetText: 'I have 5 apples and 3 oranges.',
        minAccuracy: 0.9,
      },
      {
        id: 'num-3',
        instruction: 'Practice dates and times.',
        targetText: 'Meet me at 3:45 on December 25, 2024.',
        minAccuracy: 0.85,
      },
    ],
  },

  // Symbols
  {
    id: 'symbols-basic',
    name: 'Basic Symbols',
    description: 'Learn common punctuation and symbols.',
    category: 'symbols',
    difficulty: 'advanced',
    tasks: [
      {
        id: 'sym-1',
        instruction: 'Practice basic punctuation.',
        targetText: 'Hello! How are you? I\'m fine, thanks.',
        minAccuracy: 0.85,
      },
      {
        id: 'sym-2',
        instruction: 'Type special characters.',
        targetText: 'Email: test@example.com #hashtag $100',
        minAccuracy: 0.85,
      },
      {
        id: 'sym-3',
        instruction: 'Practice brackets and quotes.',
        targetText: '"Hello," she said. [Note: (important)]',
        minAccuracy: 0.8,
      },
    ],
  },

  // Code Typing
  {
    id: 'code-javascript',
    name: 'JavaScript Basics',
    description: 'Practice typing common JavaScript code patterns.',
    category: 'code',
    difficulty: 'advanced',
    tasks: [
      {
        id: 'js-1',
        instruction: 'Type a function declaration.',
        targetText: 'function greet(name) { return "Hello, " + name; }',
        minAccuracy: 0.85,
        language: 'javascript',
      },
      {
        id: 'js-2',
        instruction: 'Practice arrow functions.',
        targetText: 'const add = (a, b) => a + b;',
        minAccuracy: 0.85,
        language: 'javascript',
      },
      {
        id: 'js-3',
        instruction: 'Type a conditional statement.',
        targetText: 'if (x > 0) { console.log("positive"); }',
        minAccuracy: 0.85,
        language: 'javascript',
      },
      {
        id: 'js-4',
        instruction: 'Practice array methods.',
        targetText: 'const nums = [1, 2, 3].map(n => n * 2);',
        minAccuracy: 0.8,
        language: 'javascript',
      },
    ],
  },
  {
    id: 'code-rust',
    name: 'Rust Basics',
    description: 'Practice typing common Rust code patterns.',
    category: 'code',
    difficulty: 'expert',
    tasks: [
      {
        id: 'rs-1',
        instruction: 'Type a function definition.',
        targetText: 'fn main() { println!("Hello, world!"); }',
        minAccuracy: 0.85,
        language: 'rust',
      },
      {
        id: 'rs-2',
        instruction: 'Practice variable declarations.',
        targetText: 'let mut count: i32 = 0;',
        minAccuracy: 0.85,
        language: 'rust',
      },
      {
        id: 'rs-3',
        instruction: 'Type a struct definition.',
        targetText: 'struct Point { x: f64, y: f64 }',
        minAccuracy: 0.85,
        language: 'rust',
      },
      {
        id: 'rs-4',
        instruction: 'Practice match expressions.',
        targetText: 'match x { Some(n) => n, None => 0 }',
        minAccuracy: 0.8,
        language: 'rust',
      },
    ],
  },

  // Speed Drills
  {
    id: 'speed-drill-easy',
    name: 'Speed Drill - Easy',
    description: 'Build speed with simple, repetitive patterns.',
    category: 'words',
    difficulty: 'intermediate',
    tasks: [
      {
        id: 'sde-1',
        instruction: 'Type as fast as you can!',
        targetText: 'the the the the the the the the the the',
        timeLimit: 30,
        minAccuracy: 0.95,
      },
      {
        id: 'sde-2',
        instruction: 'Keep up the speed!',
        targetText: 'and and and and and and and and and and',
        timeLimit: 30,
        minAccuracy: 0.95,
      },
      {
        id: 'sde-3',
        instruction: 'Alternate common words.',
        targetText: 'the and the and the and the and the and',
        timeLimit: 30,
        minAccuracy: 0.95,
      },
    ],
  },
  {
    id: 'speed-drill-advanced',
    name: 'Speed Drill - Advanced',
    description: 'Challenge yourself with complex text at high speed.',
    category: 'sentences',
    difficulty: 'expert',
    tasks: [
      {
        id: 'sda-1',
        instruction: 'Type this paragraph quickly and accurately.',
        targetText: 'The five boxing wizards jump quickly. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!',
        timeLimit: 60,
        minAccuracy: 0.9,
      },
      {
        id: 'sda-2',
        instruction: 'Another speed challenge.',
        targetText: 'Sphinx of black quartz, judge my vow. Two driven jocks help fax my big quiz. The jay, pig, fox, zebra and my wolves quack!',
        timeLimit: 60,
        minAccuracy: 0.9,
      },
    ],
  },
];

// Combine all lessons including command and shortcut lessons for coder mode
export const allLessons: Lesson[] = [...lessons, ...commandLessons, ...shortcutLessons];

export function getLessonsByCategory(category: string): Lesson[] {
  return allLessons.filter((l) => l.category === category);
}

export function getLessonsByDifficulty(difficulty: string): Lesson[] {
  return allLessons.filter((l) => l.difficulty === difficulty);
}

export function getLessonById(id: string): Lesson | undefined {
  return allLessons.find((l) => l.id === id);
}

// Re-export lesson utilities
export { commandLessons } from './commandLessons';
export { shortcutLessons, keyboardShortcuts, getShortcutsByCategory, getShortcutsByIDE } from './shortcutLessons';
