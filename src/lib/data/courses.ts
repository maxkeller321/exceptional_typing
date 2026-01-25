import type { Course, CourseStage, Lesson, Task } from '../types';

// Helper to create a task
function task(id: string, instruction: string, targetText: string, minAccuracy: number = 0.9): Task {
  return { id, instruction, targetText, minAccuracy };
}

// Helper to create a lesson
function lesson(
  id: string,
  name: string,
  description: string,
  category: Lesson['category'],
  difficulty: Lesson['difficulty'],
  tasks: Task[]
): Lesson {
  return { id, name, description, category, difficulty, tasks };
}

// ===== Stage 1: Foundation (Home Row ASDF JKL;) =====
const stage1Lessons: Lesson[] = [
  lesson(
    'home-1',
    'Meet the Home Row',
    'Position your fingers on A S D F and J K L ;',
    'home_row',
    'beginner',
    [
      task('h1-1', 'Rest your fingers on the home row. Type: asdf', 'asdf asdf asdf asdf'),
      task('h1-2', 'Now the right hand: jkl;', 'jkl; jkl; jkl; jkl;'),
      task('h1-3', 'Alternate hands', 'asdf jkl; asdf jkl; asdf jkl;'),
      task('h1-4', 'Mix it up', 'asjk dfkl asjk dfkl'),
    ]
  ),
  lesson(
    'home-2',
    'Home Row Patterns',
    'Practice common letter combinations',
    'home_row',
    'beginner',
    [
      task('h2-1', 'Practice: as', 'as as as as as as as as'),
      task('h2-2', 'Practice: add', 'add add add add add'),
      task('h2-3', 'Practice: fall', 'fall fall fall fall'),
      task('h2-4', 'Practice: ask', 'ask ask ask ask ask'),
    ]
  ),
  lesson(
    'home-3',
    'Home Row Words',
    'Type simple words using only home row keys',
    'home_row',
    'beginner',
    [
      task('h3-1', 'Type: sad', 'sad sad sad sad sad sad'),
      task('h3-2', 'Type: dad', 'dad dad dad dad dad dad'),
      task('h3-3', 'Type: add', 'add add add add add add'),
      task('h3-4', 'Type: salad', 'salad salad salad salad'),
    ]
  ),
];

// ===== Stage 2: Home Row Mastery =====
const stage2Lessons: Lesson[] = [
  lesson(
    'home-4',
    'Home Row G and H',
    'Extend to G and H with your index fingers',
    'home_row',
    'beginner',
    [
      task('h4-1', 'Practice: g with left index', 'fgf fgf fgf gag gag gag'),
      task('h4-2', 'Practice: h with right index', 'jhj jhj jhj hah hah hah'),
      task('h4-3', 'Combine g and h', 'gh gh gh hg hg hg'),
      task('h4-4', 'Words with g and h', 'gash gash flash flash'),
    ]
  ),
  lesson(
    'home-5',
    'Full Home Row',
    'Use all home row keys including G and H',
    'home_row',
    'beginner',
    [
      task('h5-1', 'All letters', 'asdfghjkl; asdfghjkl;'),
      task('h5-2', 'Words: glad', 'glad glad glad glad'),
      task('h5-3', 'Words: hall', 'hall hall hall hall'),
      task('h5-4', 'Sentence', 'a lad had a glass flask'),
    ]
  ),
];

// ===== Stage 3: Top Row Left (QWERT) =====
const stage3Lessons: Lesson[] = [
  lesson(
    'top-1',
    'Q W E',
    'Reach up to Q, W, and E',
    'top_row',
    'beginner',
    [
      task('t1-1', 'Practice: q with pinky', 'aqa aqa aqa qaq qaq'),
      task('t1-2', 'Practice: w with ring', 'sws sws sws wsw wsw'),
      task('t1-3', 'Practice: e with middle', 'ded ded ded ede ede'),
      task('t1-4', 'Combine', 'qwe qwe qwe ewq ewq'),
    ]
  ),
  lesson(
    'top-2',
    'R and T',
    'Complete the left top row with R and T',
    'top_row',
    'beginner',
    [
      task('t2-1', 'Practice: r with index', 'frf frf frf rfr rfr'),
      task('t2-2', 'Practice: t with index', 'ftf ftf ftf tft tft'),
      task('t2-3', 'Combine r and t', 'rt rt rt tr tr tr'),
      task('t2-4', 'Words', 'wet wet tree tree'),
    ]
  ),
  lesson(
    'top-3',
    'Left Top Row Words',
    'Practice words using left side top row',
    'top_row',
    'beginner',
    [
      task('t3-1', 'Type: tree', 'tree tree tree tree'),
      task('t3-2', 'Type: west', 'west west west west'),
      task('t3-3', 'Type: read', 'read read read read'),
      task('t3-4', 'Type: great', 'great great great'),
    ]
  ),
];

// ===== Stage 4: Top Row Right (YUIOP) =====
const stage4Lessons: Lesson[] = [
  lesson(
    'top-4',
    'Y U I',
    'Learn the right top row: Y, U, I',
    'top_row',
    'beginner',
    [
      task('t4-1', 'Practice: y with index', 'jyj jyj jyj yjy yjy'),
      task('t4-2', 'Practice: u with index', 'juj juj juj uju uju'),
      task('t4-3', 'Practice: i with middle', 'kik kik kik iki iki'),
      task('t4-4', 'Combine', 'yui yui yui iuy iuy'),
    ]
  ),
  lesson(
    'top-5',
    'O and P',
    'Complete the top row with O and P',
    'top_row',
    'beginner',
    [
      task('t5-1', 'Practice: o with ring', 'lol lol lol olo olo'),
      task('t5-2', 'Practice: p with pinky', ';p; ;p; ;p; p;p p;p'),
      task('t5-3', 'Combine o and p', 'op op op po po po'),
      task('t5-4', 'Words', 'type type your your'),
    ]
  ),
];

// ===== Stage 5: Top Row Integration =====
const stage5Lessons: Lesson[] = [
  lesson(
    'top-6',
    'Full Top Row',
    'Practice the entire top row',
    'top_row',
    'intermediate',
    [
      task('t6-1', 'All top row', 'qwertyuiop qwertyuiop'),
      task('t6-2', 'Mixed with home', 'the the this this'),
      task('t6-3', 'Words', 'write write quite quite'),
      task('t6-4', 'Sentence', 'the quick red tiger'),
    ]
  ),
  lesson(
    'top-7',
    'Top and Home Practice',
    'Fluent switching between rows',
    'top_row',
    'intermediate',
    [
      task('t7-1', 'Type: their', 'their their their'),
      task('t7-2', 'Type: question', 'question question'),
      task('t7-3', 'Type: poetry', 'poetry poetry poetry'),
      task('t7-4', 'Sentence', 'type with all your fingers'),
    ]
  ),
];

// ===== Stage 6: Bottom Row Left (ZXCVB) =====
const stage6Lessons: Lesson[] = [
  lesson(
    'bot-1',
    'Z X C',
    'Reach down to Z, X, and C',
    'bottom_row',
    'intermediate',
    [
      task('b1-1', 'Practice: z with pinky', 'aza aza aza zaz zaz'),
      task('b1-2', 'Practice: x with ring', 'sxs sxs sxs xsx xsx'),
      task('b1-3', 'Practice: c with middle', 'dcd dcd dcd cdc cdc'),
      task('b1-4', 'Combine', 'zxc zxc zxc cxz cxz'),
    ]
  ),
  lesson(
    'bot-2',
    'V and B',
    'Complete the left bottom row',
    'bottom_row',
    'intermediate',
    [
      task('b2-1', 'Practice: v with index', 'fvf fvf fvf vfv vfv'),
      task('b2-2', 'Practice: b with index', 'fbf fbf fbf bfb bfb'),
      task('b2-3', 'Combine', 'vb vb vb bv bv bv'),
      task('b2-4', 'Words', 'cave cave verb verb'),
    ]
  ),
];

// ===== Stage 7: Bottom Row Right (NM,.) =====
const stage7Lessons: Lesson[] = [
  lesson(
    'bot-3',
    'N and M',
    'Learn N and M with your index finger',
    'bottom_row',
    'intermediate',
    [
      task('b3-1', 'Practice: n with index', 'jnj jnj jnj njn njn'),
      task('b3-2', 'Practice: m with index', 'jmj jmj jmj mjm mjm'),
      task('b3-3', 'Combine', 'nm nm nm mn mn mn'),
      task('b3-4', 'Words', 'name name main main'),
    ]
  ),
  lesson(
    'bot-4',
    'Comma and Period',
    'Essential punctuation marks',
    'bottom_row',
    'intermediate',
    [
      task('b4-1', 'Practice comma', 'k,k k,k a, b, c, d,'),
      task('b4-2', 'Practice period', 'l.l l.l end. stop. go.'),
      task('b4-3', 'Both', 'yes, no. maybe, ok.'),
      task('b4-4', 'In sentences', 'hello, world. hi, there.'),
    ]
  ),
];

// ===== Stage 8: Full Alphabet =====
const stage8Lessons: Lesson[] = [
  lesson(
    'full-1',
    'All Letters',
    'Practice using the complete alphabet',
    'words',
    'intermediate',
    [
      task('f1-1', 'Pangram', 'the quick brown fox jumps over the lazy dog'),
      task('f1-2', 'Common words', 'the and you that with have'),
      task('f1-3', 'More words', 'from this will your they what'),
      task('f1-4', 'Longer words', 'example through between another'),
    ]
  ),
  lesson(
    'full-2',
    'Word Practice',
    'Build speed with common words',
    'words',
    'intermediate',
    [
      task('f2-1', 'Short words', 'is it an to be or as at by do go'),
      task('f2-2', 'Medium words', 'time work life make just know take'),
      task('f2-3', 'Longer words', 'different important something government'),
      task('f2-4', 'Mixed', 'the important thing is to keep trying'),
    ]
  ),
];

// ===== Stage 9: Shift and Capitals =====
const stage9Lessons: Lesson[] = [
  lesson(
    'shift-1',
    'Capital Letters',
    'Use Shift for uppercase letters',
    'words',
    'intermediate',
    [
      task('s1-1', 'Left hand capitals', 'A S D F G a s d f g'),
      task('s1-2', 'Right hand capitals', 'J K L H J k l h j'),
      task('s1-3', 'Mixed', 'The Quick Brown Fox'),
      task('s1-4', 'Names', 'Alice Bob Carol Dave'),
    ]
  ),
  lesson(
    'shift-2',
    'Sentences',
    'Proper capitalization in sentences',
    'sentences',
    'intermediate',
    [
      task('s2-1', 'Simple', 'Hello. Goodbye. Yes. No.'),
      task('s2-2', 'Questions', 'How are you? What is this?'),
      task('s2-3', 'Statements', 'This is a test. I can type.'),
      task('s2-4', 'Mixed', 'Hello! How are you today?'),
    ]
  ),
];

// ===== Stage 10: Numbers =====
const stage10Lessons: Lesson[] = [
  lesson(
    'num-1',
    'Numbers 1-5',
    'Learn the left side number row',
    'numbers',
    'intermediate',
    [
      task('n1-1', 'Practice 1 2 3', '123 123 321 321 132 132'),
      task('n1-2', 'Practice 4 5', '45 45 54 54 1234 1234'),
      task('n1-3', 'Mixed', '12345 54321 13524 24531'),
      task('n1-4', 'In context', 'I have 5 apples and 3 oranges'),
    ]
  ),
  lesson(
    'num-2',
    'Numbers 6-0',
    'Complete the number row',
    'numbers',
    'intermediate',
    [
      task('n2-1', 'Practice 6 7 8', '678 678 876 876 768 768'),
      task('n2-2', 'Practice 9 0', '90 90 09 09 0987 0987'),
      task('n2-3', 'All numbers', '1234567890 0987654321'),
      task('n2-4', 'In context', 'The code is 4829 or 7156'),
    ]
  ),
];

// ===== Stage 11: Common Symbols =====
const stage11Lessons: Lesson[] = [
  lesson(
    'sym-1',
    'Basic Punctuation',
    'Common punctuation marks',
    'symbols',
    'advanced',
    [
      task('sym1-1', 'Question and exclamation', 'What? Why! How? Yes!'),
      task('sym1-2', 'Apostrophe', "it's don't won't can't"),
      task('sym1-3', 'Quotation marks', '"Hello" "World" "Test"'),
      task('sym1-4', 'Mixed', '"What?" she asked. "I don\'t know!"'),
    ]
  ),
  lesson(
    'sym-2',
    'Programming Symbols',
    'Symbols used in coding',
    'symbols',
    'advanced',
    [
      task('sym2-1', 'Brackets', '[] {} () <> []{}()<>'),
      task('sym2-2', 'Operators', '+ - * / = += -= *= /='),
      task('sym2-3', 'Special', '@ # $ % ^ & _ | \\ ~'),
      task('sym2-4', 'Combined', 'arr[0] = (a + b) * c;'),
    ]
  ),
];

// ===== Stage 12: Advanced Symbols =====
const stage12Lessons: Lesson[] = [
  lesson(
    'sym-3',
    'Code Syntax',
    'Practice programming syntax patterns',
    'code',
    'advanced',
    [
      task('sym3-1', 'Variables', 'const x = 10; let y = 20;'),
      task('sym3-2', 'Functions', 'function add(a, b) { return a + b; }'),
      task('sym3-3', 'Objects', '{ name: "test", value: 42 }'),
      task('sym3-4', 'Arrays', '[1, 2, 3].map(x => x * 2)'),
    ]
  ),
  lesson(
    'sym-4',
    'More Code Patterns',
    'Common code structures',
    'code',
    'advanced',
    [
      task('sym4-1', 'Conditionals', 'if (x > 0) { return true; }'),
      task('sym4-2', 'Loops', 'for (let i = 0; i < n; i++) {}'),
      task('sym4-3', 'Classes', 'class User { constructor() {} }'),
      task('sym4-4', 'Imports', 'import { useState } from "react";'),
    ]
  ),
];

// ===== Stage 13: Speed Building =====
const stage13Lessons: Lesson[] = [
  lesson(
    'speed-1',
    'Common Phrases',
    'Build speed with frequent phrases',
    'sentences',
    'advanced',
    [
      task('sp1-1', 'Greetings', 'Hello, how are you? I am fine, thank you.'),
      task('sp1-2', 'Business', 'Please let me know if you have any questions.'),
      task('sp1-3', 'Casual', 'That sounds great! I would love to help.'),
      task('sp1-4', 'Technical', 'The function returns a boolean value.'),
    ]
  ),
  lesson(
    'speed-2',
    'Paragraphs',
    'Type longer passages fluently',
    'sentences',
    'advanced',
    [
      task('sp2-1', 'Short paragraph', 'Practice makes perfect. The more you type, the better you become.'),
      task('sp2-2', 'Medium paragraph', 'Touch typing is a valuable skill that allows you to type without looking at the keyboard. This frees your mind to focus on what you are writing.'),
    ]
  ),
];

// ===== Stage 14: Final Mastery =====
const stage14Lessons: Lesson[] = [
  lesson(
    'master-1',
    'Advanced Text',
    'Challenge yourself with complex text',
    'sentences',
    'expert',
    [
      task('m1-1', 'Technical', 'The algorithm processes data with O(n log n) complexity.'),
      task('m1-2', 'Mixed case', 'JavaScript, TypeScript, Python, and Rust are popular languages.'),
      task('m1-3', 'Numbers and symbols', 'The price is $99.99 (20% off from $124.99).'),
    ]
  ),
  lesson(
    'master-2',
    'Code Mastery',
    'Type real code snippets',
    'code',
    'expert',
    [
      task('m2-1', 'JavaScript', 'const add = (a, b) => a + b;\nconsole.log(add(2, 3));', 0.85, 'typescript'),
      task('m2-2', 'Python', 'def greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("World"))', 0.85, 'python'),
      task('m2-3', 'HTML', '<div class="container">\n  <h1>Title</h1>\n  <p>Content</p>\n</div>', 0.85, 'html'),
    ]
  ),
];

// Create the main course
export const tenFingerCourse: Course = {
  id: 'ten-finger',
  name: '10 Fingers (touch typing)',
  description: 'A comprehensive course to master touch typing from beginner to expert',
  stages: [
    {
      id: 'stage-1',
      name: 'Foundation',
      description: 'Learn the home row keys: A S D F and J K L ;',
      lessons: stage1Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: false },
    },
    {
      id: 'stage-2',
      name: 'Home Row Mastery',
      description: 'Master the complete home row including G and H',
      lessons: stage2Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'stage-3',
      name: 'Top Row Left',
      description: 'Learn Q W E R T',
      lessons: stage3Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'stage-4',
      name: 'Top Row Right',
      description: 'Learn Y U I O P',
      lessons: stage4Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'stage-5',
      name: 'Top Row Integration',
      description: 'Practice the full top row',
      lessons: stage5Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'stage-6',
      name: 'Bottom Row Left',
      description: 'Learn Z X C V B',
      lessons: stage6Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'stage-7',
      name: 'Bottom Row Right',
      description: 'Learn N M , .',
      lessons: stage7Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'stage-8',
      name: 'Full Alphabet',
      description: 'Practice using all letters',
      lessons: stage8Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'stage-9',
      name: 'Shift & Capitals',
      description: 'Master uppercase letters',
      lessons: stage9Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'stage-10',
      name: 'Numbers',
      description: 'Learn the number row',
      lessons: stage10Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'stage-11',
      name: 'Common Symbols',
      description: 'Basic punctuation and symbols',
      lessons: stage11Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'stage-12',
      name: 'Advanced Symbols',
      description: 'Programming symbols and syntax',
      lessons: stage12Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'stage-13',
      name: 'Speed Building',
      description: 'Build typing speed with longer texts',
      lessons: stage13Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true, minWpm: 30 },
    },
    {
      id: 'stage-14',
      name: 'Final Mastery',
      description: 'Advanced challenges for experts',
      lessons: stage14Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true, minWpm: 40, minAccuracy: 0.95 },
    },
  ],
};

// Export all lessons
export const courseLessons: Lesson[] = [
  ...stage1Lessons,
  ...stage2Lessons,
  ...stage3Lessons,
  ...stage4Lessons,
  ...stage5Lessons,
  ...stage6Lessons,
  ...stage7Lessons,
  ...stage8Lessons,
  ...stage9Lessons,
  ...stage10Lessons,
  ...stage11Lessons,
  ...stage12Lessons,
  ...stage13Lessons,
  ...stage14Lessons,
];

// Get lesson by ID (searches all courses)
export function getCourseLesson(lessonId: string): Lesson | undefined {
  // First check ten-finger course
  const tenFingerLesson = courseLessons.find(l => l.id === lessonId);
  if (tenFingerLesson) return tenFingerLesson;
  // Then check CLI course
  return cliCourseLessons.find(l => l.id === lessonId);
}

// Get stage by ID (searches all courses)
export function getCourseStage(stageId: string): CourseStage | undefined {
  // First check ten-finger course
  const tenFingerStage = tenFingerCourse.stages.find(s => s.id === stageId);
  if (tenFingerStage) return tenFingerStage;
  // Then check CLI course
  return cliCourse.stages.find(s => s.id === stageId);
}

// ============================================
// CLI Course - Command Line Mastery
// ============================================

// Stage 1: Basic Navigation & Help
const cliStage1Lessons: Lesson[] = [
  lesson(
    'cli-basics-1',
    'First Commands',
    'Learn your very first terminal commands',
    'commands',
    'beginner',
    [
      task('cli-b1-1', 'Learn pwd (Print Working Directory)', 'pwd'),
      task('cli-b1-2', 'Learn ls (List files)', 'ls'),
      task('cli-b1-3', 'Learn clear (Clear screen)', 'clear'),
      task('cli-b1-4', 'Practice basic commands', 'pwd\nls\nclear'),
    ]
  ),
  lesson(
    'cli-basics-2',
    'Getting Help',
    'Learn how to find help for any command',
    'commands',
    'beginner',
    [
      task('cli-b2-1', 'Use --help flag', 'ls --help'),
      task('cli-b2-2', 'Read a manual page', 'man ls'),
      task('cli-b2-3', 'Find command location', 'which python'),
      task('cli-b2-4', 'Check command type', 'type ls'),
    ]
  ),
];

// Stage 2: File Navigation
const cliStage2Lessons: Lesson[] = [
  lesson(
    'cli-nav-1',
    'Directory Navigation',
    'Navigate the filesystem with cd',
    'commands',
    'beginner',
    [
      task('cli-n1-1', 'Go to home directory', 'cd ~'),
      task('cli-n1-2', 'Go up one level', 'cd ..'),
      task('cli-n1-3', 'Go to specific path', 'cd /home/user'),
      task('cli-n1-4', 'Return to previous directory', 'cd -'),
    ]
  ),
  lesson(
    'cli-nav-2',
    'Listing Files',
    'Learn different ways to list files',
    'commands',
    'beginner',
    [
      task('cli-n2-1', 'List all files', 'ls -a'),
      task('cli-n2-2', 'Long format with details', 'ls -l'),
      task('cli-n2-3', 'Human readable sizes', 'ls -lh'),
      task('cli-n2-4', 'Combined options', 'ls -la'),
    ]
  ),
];

// Stage 3: File Operations
const cliStage3Lessons: Lesson[] = [
  lesson(
    'cli-file-1',
    'Creating Files & Directories',
    'Learn to create files and folders',
    'commands',
    'beginner',
    [
      task('cli-f1-1', 'Create empty file', 'touch newfile.txt'),
      task('cli-f1-2', 'Create directory', 'mkdir projects'),
      task('cli-f1-3', 'Create nested directories', 'mkdir -p parent/child/grandchild'),
      task('cli-f1-4', 'Create multiple files', 'touch file1.txt file2.txt file3.txt'),
    ]
  ),
  lesson(
    'cli-file-2',
    'Copy, Move, Delete',
    'Essential file manipulation commands',
    'commands',
    'beginner',
    [
      task('cli-f2-1', 'Copy a file', 'cp source.txt dest.txt'),
      task('cli-f2-2', 'Copy directory recursively', 'cp -r folder/ backup/'),
      task('cli-f2-3', 'Move or rename', 'mv old.txt new.txt'),
      task('cli-f2-4', 'Remove file', 'rm unwanted.txt'),
    ]
  ),
];

// Stage 4: Reading Files
const cliStage4Lessons: Lesson[] = [
  lesson(
    'cli-read-1',
    'Viewing File Contents',
    'Different ways to read files',
    'commands',
    'beginner',
    [
      task('cli-r1-1', 'Display entire file', 'cat readme.txt'),
      task('cli-r1-2', 'View first lines', 'head -n 10 file.txt'),
      task('cli-r1-3', 'View last lines', 'tail -n 20 log.txt'),
      task('cli-r1-4', 'Paginated view', 'less largefile.txt'),
    ]
  ),
  lesson(
    'cli-read-2',
    'Following Logs',
    'Monitor files in real-time',
    'commands',
    'intermediate',
    [
      task('cli-r2-1', 'Follow log updates', 'tail -f app.log'),
      task('cli-r2-2', 'Count lines in file', 'wc -l data.txt'),
      task('cli-r2-3', 'Count words', 'wc -w document.txt'),
      task('cli-r2-4', 'Count with cat', 'cat file.txt | wc -l'),
    ]
  ),
];

// Stage 5: Search Commands
const cliStage5Lessons: Lesson[] = [
  lesson(
    'cli-search-1',
    'Finding Files',
    'Locate files on your system',
    'commands',
    'intermediate',
    [
      task('cli-s1-1', 'Find by name', 'find . -name "*.txt"'),
      task('cli-s1-2', 'Find by type', 'find . -type f'),
      task('cli-s1-3', 'Find directories', 'find . -type d -name "src"'),
      task('cli-s1-4', 'Find by modification time', 'find . -mtime -7'),
    ]
  ),
  lesson(
    'cli-search-2',
    'Searching Content with grep',
    'Search text patterns in files',
    'commands',
    'intermediate',
    [
      task('cli-s2-1', 'Basic grep', 'grep "error" log.txt'),
      task('cli-s2-2', 'Case insensitive', 'grep -i "warning" file.txt'),
      task('cli-s2-3', 'Recursive search', 'grep -r "TODO" ./src'),
      task('cli-s2-4', 'Show line numbers', 'grep -n "function" *.js'),
    ]
  ),
];

// Stage 6: Text Processing
const cliStage6Lessons: Lesson[] = [
  lesson(
    'cli-text-1',
    'Sorting and Filtering',
    'Process and organize text data',
    'commands',
    'intermediate',
    [
      task('cli-t1-1', 'Sort alphabetically', 'sort names.txt'),
      task('cli-t1-2', 'Sort numerically', 'sort -n numbers.txt'),
      task('cli-t1-3', 'Reverse sort', 'sort -r data.txt'),
      task('cli-t1-4', 'Find unique lines', 'sort file.txt | uniq'),
    ]
  ),
  lesson(
    'cli-text-2',
    'Text Extraction',
    'Extract specific parts of text',
    'commands',
    'intermediate',
    [
      task('cli-t2-1', 'Extract columns with cut', 'cut -d"," -f1 data.csv'),
      task('cli-t2-2', 'Print first field with awk', 'awk "{print $1}" file.txt'),
      task('cli-t2-3', 'Simple substitution', 'sed "s/old/new/g" file.txt'),
      task('cli-t2-4', 'Count occurrences', 'uniq -c sorted.txt'),
    ]
  ),
];

// Stage 7: Pipes and Redirection
const cliStage7Lessons: Lesson[] = [
  lesson(
    'cli-pipe-1',
    'Basic Pipes',
    'Chain commands together',
    'commands',
    'intermediate',
    [
      task('cli-p1-1', 'Pipe to grep', 'ls -la | grep ".txt"'),
      task('cli-p1-2', 'Pipe to wc', 'cat file.txt | wc -l'),
      task('cli-p1-3', 'Multiple pipes', 'cat log.txt | grep ERROR | wc -l'),
      task('cli-p1-4', 'Sort and unique', 'cat data.txt | sort | uniq'),
    ]
  ),
  lesson(
    'cli-pipe-2',
    'Redirection',
    'Control input and output',
    'commands',
    'intermediate',
    [
      task('cli-p2-1', 'Redirect to file', 'echo "Hello" > file.txt'),
      task('cli-p2-2', 'Append to file', 'echo "World" >> file.txt'),
      task('cli-p2-3', 'Input redirection', 'sort < unsorted.txt'),
      task('cli-p2-4', 'Combined redirection', 'sort < input.txt > output.txt'),
    ]
  ),
];

// Stage 8: System Information
const cliStage8Lessons: Lesson[] = [
  lesson(
    'cli-sys-1',
    'Process Information',
    'View running processes',
    'commands',
    'intermediate',
    [
      task('cli-sys1-1', 'List all processes', 'ps aux'),
      task('cli-sys1-2', 'Interactive viewer', 'top'),
      task('cli-sys1-3', 'Find specific process', 'ps aux | grep node'),
      task('cli-sys1-4', 'Better process viewer', 'htop'),
    ]
  ),
  lesson(
    'cli-sys-2',
    'Disk and Memory',
    'Check system resources',
    'commands',
    'intermediate',
    [
      task('cli-sys2-1', 'Check disk space', 'df -h'),
      task('cli-sys2-2', 'Directory size', 'du -sh ./folder'),
      task('cli-sys2-3', 'Memory usage', 'free -h'),
      task('cli-sys2-4', 'System info', 'uname -a'),
    ]
  ),
];

// Stage 9: Git Commands
const cliStage9Lessons: Lesson[] = [
  lesson(
    'cli-git-1',
    'Git Basics',
    'Essential version control commands',
    'commands',
    'intermediate',
    [
      task('cli-git1-1', 'Initialize repository', 'git init'),
      task('cli-git1-2', 'Check status', 'git status'),
      task('cli-git1-3', 'Stage changes', 'git add .'),
      task('cli-git1-4', 'Commit changes', 'git commit -m "Initial commit"'),
    ]
  ),
  lesson(
    'cli-git-2',
    'Git Workflow',
    'Common Git operations',
    'commands',
    'intermediate',
    [
      task('cli-git2-1', 'Clone repository', 'git clone https://github.com/user/repo.git'),
      task('cli-git2-2', 'Push changes', 'git push origin main'),
      task('cli-git2-3', 'Pull updates', 'git pull origin main'),
      task('cli-git2-4', 'View history', 'git log --oneline'),
    ]
  ),
];

// Stage 10: Permissions
const cliStage10Lessons: Lesson[] = [
  lesson(
    'cli-perm-1',
    'File Permissions',
    'Manage file access rights',
    'commands',
    'advanced',
    [
      task('cli-perm1-1', 'Make executable', 'chmod +x script.sh'),
      task('cli-perm1-2', 'Set octal permissions', 'chmod 755 file.sh'),
      task('cli-perm1-3', 'View permissions', 'ls -l file.txt'),
      task('cli-perm1-4', 'Change owner', 'chown user:group file.txt'),
    ]
  ),
  lesson(
    'cli-perm-2',
    'User Commands',
    'User and group management',
    'commands',
    'advanced',
    [
      task('cli-perm2-1', 'Current user', 'whoami'),
      task('cli-perm2-2', 'User ID info', 'id'),
      task('cli-perm2-3', 'User groups', 'groups'),
      task('cli-perm2-4', 'Switch user', 'sudo su - username'),
    ]
  ),
];

// Stage 11: Networking
const cliStage11Lessons: Lesson[] = [
  lesson(
    'cli-net-1',
    'Network Basics',
    'Test connectivity and download',
    'commands',
    'advanced',
    [
      task('cli-net1-1', 'Test connection', 'ping -c 4 google.com'),
      task('cli-net1-2', 'HTTP request', 'curl https://api.example.com'),
      task('cli-net1-3', 'Download file', 'wget https://example.com/file.zip'),
      task('cli-net1-4', 'View IP address', 'ip addr show'),
    ]
  ),
  lesson(
    'cli-net-2',
    'Remote Access',
    'Connect to remote servers',
    'commands',
    'advanced',
    [
      task('cli-net2-1', 'SSH connection', 'ssh user@hostname'),
      task('cli-net2-2', 'Copy to remote', 'scp file.txt user@host:/path/'),
      task('cli-net2-3', 'Check listening ports', 'ss -tuln'),
      task('cli-net2-4', 'DNS lookup', 'dig example.com'),
    ]
  ),
];

// Stage 12: Archives
const cliStage12Lessons: Lesson[] = [
  lesson(
    'cli-arch-1',
    'Creating Archives',
    'Compress files and folders',
    'commands',
    'advanced',
    [
      task('cli-arch1-1', 'Create tar archive', 'tar -cvf archive.tar folder/'),
      task('cli-arch1-2', 'Create gzipped tar', 'tar -czvf archive.tar.gz folder/'),
      task('cli-arch1-3', 'Create zip', 'zip -r archive.zip folder/'),
      task('cli-arch1-4', 'List archive contents', 'tar -tvf archive.tar'),
    ]
  ),
  lesson(
    'cli-arch-2',
    'Extracting Archives',
    'Unpack compressed files',
    'commands',
    'advanced',
    [
      task('cli-arch2-1', 'Extract tar', 'tar -xvf archive.tar'),
      task('cli-arch2-2', 'Extract gzipped tar', 'tar -xzvf archive.tar.gz'),
      task('cli-arch2-3', 'Extract to directory', 'unzip archive.zip -d output/'),
      task('cli-arch2-4', 'Extract specific file', 'tar -xvf archive.tar file.txt'),
    ]
  ),
];

// Stage 13: Process Management
const cliStage13Lessons: Lesson[] = [
  lesson(
    'cli-proc-1',
    'Process Control',
    'Manage running processes',
    'commands',
    'advanced',
    [
      task('cli-proc1-1', 'Kill by PID', 'kill 1234'),
      task('cli-proc1-2', 'Force kill', 'kill -9 1234'),
      task('cli-proc1-3', 'Kill by name', 'pkill -f "python script.py"'),
      task('cli-proc1-4', 'List jobs', 'jobs'),
    ]
  ),
  lesson(
    'cli-proc-2',
    'Background Tasks',
    'Run processes in background',
    'commands',
    'advanced',
    [
      task('cli-proc2-1', 'Run in background', 'nohup ./script.sh &'),
      task('cli-proc2-2', 'Bring to foreground', 'fg %1'),
      task('cli-proc2-3', 'Send to background', 'bg %1'),
      task('cli-proc2-4', 'Disown process', 'disown %1'),
    ]
  ),
];

// Stage 14: Docker
const cliStage14Lessons: Lesson[] = [
  lesson(
    'cli-docker-1',
    'Docker Basics',
    'Container fundamentals',
    'commands',
    'expert',
    [
      task('cli-docker1-1', 'Pull image', 'docker pull nginx'),
      task('cli-docker1-2', 'List images', 'docker images'),
      task('cli-docker1-3', 'Run container', 'docker run -d -p 80:80 nginx'),
      task('cli-docker1-4', 'List containers', 'docker ps -a'),
    ]
  ),
  lesson(
    'cli-docker-2',
    'Docker Management',
    'Advanced container operations',
    'commands',
    'expert',
    [
      task('cli-docker2-1', 'Enter container', 'docker exec -it container /bin/bash'),
      task('cli-docker2-2', 'View logs', 'docker logs -f container'),
      task('cli-docker2-3', 'Build image', 'docker build -t myapp .'),
      task('cli-docker2-4', 'Docker Compose', 'docker-compose up -d'),
    ]
  ),
];

// Stage 15: CLI Mastery Test
const cliMasteryTest: Lesson[] = [
  lesson(
    'cli-test-basic',
    'Basic Commands Test',
    'Test your knowledge of fundamental commands',
    'commands',
    'intermediate',
    [
      task('test-b1', 'Navigate to home and list', 'cd ~ && ls -la'),
      task('test-b2', 'Create dir and file', 'mkdir test && touch test/file.txt'),
      task('test-b3', 'Copy and view', 'cp file.txt backup.txt && cat backup.txt'),
      task('test-b4', 'Find text files', 'find . -name "*.txt" -type f'),
      task('test-b5', 'Search in file', 'grep -n "error" app.log'),
    ]
  ),
  lesson(
    'cli-test-intermediate',
    'Intermediate Commands Test',
    'Test pipes, redirection, and text processing',
    'commands',
    'advanced',
    [
      task('test-i1', 'Count error lines', 'grep "ERROR" log.txt | wc -l'),
      task('test-i2', 'Sort and unique', 'cat data.txt | sort | uniq -c | sort -rn'),
      task('test-i3', 'Extract column', 'cut -d"," -f2 users.csv | sort'),
      task('test-i4', 'Replace text in file', 'sed "s/http/https/g" urls.txt > secure.txt'),
      task('test-i5', 'Git workflow', 'git add . && git commit -m "Update" && git push'),
    ]
  ),
  lesson(
    'cli-test-advanced',
    'Advanced Commands Test',
    'Test system admin and DevOps commands',
    'commands',
    'expert',
    [
      task('test-a1', 'Find large files', 'find . -type f -size +100M -exec ls -lh {} +'),
      task('test-a2', 'Monitor process memory', 'ps aux | grep node | awk "{sum += $6} END {print sum/1024}"'),
      task('test-a3', 'Create and extract archive', 'tar -czvf backup.tar.gz ./data && tar -xzvf backup.tar.gz'),
      task('test-a4', 'Docker cleanup', 'docker system prune -a --volumes'),
      task('test-a5', 'Network check', 'ss -tuln | grep LISTEN | wc -l'),
    ]
  ),
  lesson(
    'cli-test-master',
    'CLI Mastery Final Test',
    'Comprehensive command line challenge',
    'commands',
    'expert',
    [
      task('test-m1', 'Complex pipeline', 'find . -name "*.log" -mtime -7 | xargs grep -l "ERROR" | wc -l'),
      task('test-m2', 'Process management', 'ps aux | sort -nrk 4 | head -5'),
      task('test-m3', 'Archive with exclusion', 'tar --exclude="node_modules" -czvf project.tar.gz ./'),
      task('test-m4', 'Real-time log filter', 'tail -f /var/log/syslog | grep --line-buffered "error"'),
      task('test-m5', 'Full Git workflow', 'git checkout -b feature && git add . && git commit -m "Add feature" && git push -u origin feature'),
      task('test-m6', 'Docker deploy', 'docker build -t app:v1 . && docker run -d -p 3000:3000 --name myapp app:v1'),
    ]
  ),
];

// All CLI course lessons
export const cliCourseLessons: Lesson[] = [
  ...cliStage1Lessons,
  ...cliStage2Lessons,
  ...cliStage3Lessons,
  ...cliStage4Lessons,
  ...cliStage5Lessons,
  ...cliStage6Lessons,
  ...cliStage7Lessons,
  ...cliStage8Lessons,
  ...cliStage9Lessons,
  ...cliStage10Lessons,
  ...cliStage11Lessons,
  ...cliStage12Lessons,
  ...cliStage13Lessons,
  ...cliStage14Lessons,
  ...cliMasteryTest,
];

// Create the CLI course
export const cliCourse: Course = {
  id: 'cli-mastery',
  name: 'Command Line Mastery',
  description: 'Master the terminal from basic navigation to advanced DevOps commands',
  stages: [
    {
      id: 'cli-stage-1',
      name: 'Getting Started',
      description: 'Your first terminal commands and how to get help',
      lessons: cliStage1Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: false },
    },
    {
      id: 'cli-stage-2',
      name: 'File Navigation',
      description: 'Navigate directories and list files',
      lessons: cliStage2Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cli-stage-3',
      name: 'File Operations',
      description: 'Create, copy, move, and delete files',
      lessons: cliStage3Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cli-stage-4',
      name: 'Reading Files',
      description: 'View and monitor file contents',
      lessons: cliStage4Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cli-stage-5',
      name: 'Search Commands',
      description: 'Find files and search content with find & grep',
      lessons: cliStage5Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cli-stage-6',
      name: 'Text Processing',
      description: 'Sort, filter, and transform text data',
      lessons: cliStage6Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cli-stage-7',
      name: 'Pipes & Redirection',
      description: 'Chain commands and control I/O',
      lessons: cliStage7Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cli-stage-8',
      name: 'System Information',
      description: 'Monitor processes and system resources',
      lessons: cliStage8Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cli-stage-9',
      name: 'Git Version Control',
      description: 'Essential Git commands for developers',
      lessons: cliStage9Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cli-stage-10',
      name: 'Permissions & Users',
      description: 'Manage file permissions and users',
      lessons: cliStage10Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true, minWpm: 20 },
    },
    {
      id: 'cli-stage-11',
      name: 'Networking',
      description: 'Network commands and remote access',
      lessons: cliStage11Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cli-stage-12',
      name: 'Archives & Compression',
      description: 'Create and extract archives',
      lessons: cliStage12Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cli-stage-13',
      name: 'Process Management',
      description: 'Control and manage running processes',
      lessons: cliStage13Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cli-stage-14',
      name: 'Docker',
      description: 'Container management essentials',
      lessons: cliStage14Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true, minWpm: 25 },
    },
    {
      id: 'cli-stage-test',
      name: 'CLI Mastery Test',
      description: 'Prove your command line skills',
      lessons: cliMasteryTest.map(l => l.id),
      unlockCriteria: { previousStageComplete: true, minWpm: 30, minAccuracy: 0.90 },
    },
  ],
};

// Get CLI course lesson by ID
export function getCliCourseLesson(lessonId: string): Lesson | undefined {
  return cliCourseLessons.find(l => l.id === lessonId);
}

// Get CLI course stage by ID
export function getCliCourseStage(stageId: string): CourseStage | undefined {
  return cliCourse.stages.find(s => s.id === stageId);
}

// All available courses
export const allCourses: Course[] = [tenFingerCourse, cliCourse];
