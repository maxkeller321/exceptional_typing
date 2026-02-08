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
  const cliLesson = cliCourseLessons.find(l => l.id === lessonId);
  if (cliLesson) return cliLesson;
  // Then check Claude Code course
  const ccLesson = ccCourseLessons.find(l => l.id === lessonId);
  if (ccLesson) return ccLesson;
  // Then check SQL course
  return sqlCourseLessons.find(l => l.id === lessonId);
}

// Get stage by ID (searches all courses)
export function getCourseStage(stageId: string): CourseStage | undefined {
  // First check ten-finger course
  const tenFingerStage = tenFingerCourse.stages.find(s => s.id === stageId);
  if (tenFingerStage) return tenFingerStage;
  // Then check CLI course
  const cliStage = cliCourse.stages.find(s => s.id === stageId);
  if (cliStage) return cliStage;
  // Then check Claude Code course
  const ccStage = claudeCodeCourse.stages.find(s => s.id === stageId);
  if (ccStage) return ccStage;
  // Then check SQL course
  return sqlCourse.stages.find(s => s.id === stageId);
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
      task('cli-b1-1', 'Learn pwd (Print Working Directory)', 'pwd - print working directory'),
      task('cli-b1-2', 'Learn ls (List files)', 'ls - list directory contents'),
      task('cli-b1-3', 'Learn clear (Clear screen)', 'clear - clear the terminal screen'),
      task('cli-b1-4', 'Practice basic commands', 'pwd - print working directory\nls - list directory contents\nclear - clear the terminal screen'),
    ]
  ),
  lesson(
    'cli-basics-2',
    'Getting Help',
    'Learn how to find help for any command',
    'commands',
    'beginner',
    [
      task('cli-b2-1', 'Use --help flag', 'ls --help - display help information for ls'),
      task('cli-b2-2', 'Read a manual page', 'man ls - display the manual page for ls'),
      task('cli-b2-3', 'Find command location', 'which python - show the full path of a command'),
      task('cli-b2-4', 'Check command type', 'type ls - display how a command name is interpreted'),
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
      task('cli-n1-1', 'Go to home directory', 'cd ~ - change directory to home'),
      task('cli-n1-2', 'Go up one level', 'cd .. - move up one directory level'),
      task('cli-n1-3', 'Go to specific path', 'cd /home/user - change to a specific directory'),
      task('cli-n1-4', 'Return to previous directory', 'cd - - switch to the previous directory'),
    ]
  ),
  lesson(
    'cli-nav-2',
    'Listing Files',
    'Learn different ways to list files',
    'commands',
    'beginner',
    [
      task('cli-n2-1', 'List all files', 'ls -a - list all entries including hidden files'),
      task('cli-n2-2', 'Long format with details', 'ls -l - list in long format with permissions and size'),
      task('cli-n2-3', 'Human readable sizes', 'ls -lh - long format with human-readable file sizes'),
      task('cli-n2-4', 'Combined options', 'ls -la - list all files in long format'),
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
      task('cli-f1-1', 'Create empty file', 'touch newfile.txt - create an empty file or update timestamp'),
      task('cli-f1-2', 'Create directory', 'mkdir projects - make a new directory'),
      task('cli-f1-3', 'Create nested directories', 'mkdir -p parent/child/grandchild - create parent directories as needed'),
      task('cli-f1-4', 'Create multiple files', 'touch file1.txt file2.txt file3.txt - create multiple files at once'),
    ]
  ),
  lesson(
    'cli-file-2',
    'Copy, Move, Delete',
    'Essential file manipulation commands',
    'commands',
    'beginner',
    [
      task('cli-f2-1', 'Copy a file', 'cp source.txt dest.txt - copy files and directories'),
      task('cli-f2-2', 'Copy directory recursively', 'cp -r folder/ backup/ - copy directories recursively'),
      task('cli-f2-3', 'Move or rename', 'mv old.txt new.txt - move or rename files'),
      task('cli-f2-4', 'Remove file', 'rm unwanted.txt - remove files permanently'),
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
      task('cli-r1-1', 'Display entire file', 'cat readme.txt - concatenate and print file contents'),
      task('cli-r1-2', 'View first lines', 'head -n 10 file.txt - output the first 10 lines of a file'),
      task('cli-r1-3', 'View last lines', 'tail -n 20 log.txt - output the last 20 lines of a file'),
      task('cli-r1-4', 'Paginated view', 'less largefile.txt - view file contents with scrollable pagination'),
    ]
  ),
  lesson(
    'cli-read-2',
    'Following Logs',
    'Monitor files in real-time',
    'commands',
    'intermediate',
    [
      task('cli-r2-1', 'Follow log updates', 'tail -f app.log - follow file output in real-time'),
      task('cli-r2-2', 'Count lines in file', 'wc -l data.txt - print the number of lines in a file'),
      task('cli-r2-3', 'Count words', 'wc -w document.txt - print the number of words in a file'),
      task('cli-r2-4', 'Count with cat', 'cat file.txt | wc -l - pipe file contents to count lines'),
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
      task('cli-s1-1', 'Find by name', 'find . -name "*.txt" - search for files by name pattern'),
      task('cli-s1-2', 'Find by type', 'find . -type f - find only regular files'),
      task('cli-s1-3', 'Find directories', 'find . -type d -name "src" - find directories by name'),
      task('cli-s1-4', 'Find by modification time', 'find . -mtime -7 - find files modified in the last 7 days'),
    ]
  ),
  lesson(
    'cli-search-2',
    'Searching Content with grep',
    'Search text patterns in files',
    'commands',
    'intermediate',
    [
      task('cli-s2-1', 'Basic grep', 'grep "error" log.txt - print lines matching a pattern'),
      task('cli-s2-2', 'Case insensitive', 'grep -i "warning" file.txt - ignore case when matching'),
      task('cli-s2-3', 'Recursive search', 'grep -r "TODO" ./src - search recursively in directories'),
      task('cli-s2-4', 'Show line numbers', 'grep -n "function" *.js - prefix output with line numbers'),
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
      task('cli-t1-1', 'Sort alphabetically', 'sort names.txt - sort lines of text alphabetically'),
      task('cli-t1-2', 'Sort numerically', 'sort -n numbers.txt - sort lines by numeric value'),
      task('cli-t1-3', 'Reverse sort', 'sort -r data.txt - sort in reverse order'),
      task('cli-t1-4', 'Find unique lines', 'sort file.txt | uniq - filter out repeated adjacent lines'),
    ]
  ),
  lesson(
    'cli-text-2',
    'Text Extraction',
    'Extract specific parts of text',
    'commands',
    'intermediate',
    [
      task('cli-t2-1', 'Extract columns with cut', 'cut -d"," -f1 data.csv - remove sections from each line'),
      task('cli-t2-2', 'Print first field with awk', 'awk "{print $1}" file.txt - pattern scanning and processing'),
      task('cli-t2-3', 'Simple substitution', 'sed "s/old/new/g" file.txt - stream editor for text transformation'),
      task('cli-t2-4', 'Count occurrences', 'uniq -c sorted.txt - report or omit repeated lines with counts'),
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
      task('cli-p1-1', 'Pipe to grep', 'ls -la | grep ".txt" - pipe output to filter results'),
      task('cli-p1-2', 'Pipe to wc', 'cat file.txt | wc -l - pipe file contents to count lines'),
      task('cli-p1-3', 'Multiple pipes', 'cat log.txt | grep ERROR | wc -l - chain multiple filters'),
      task('cli-p1-4', 'Sort and unique', 'cat data.txt | sort | uniq - sort and remove duplicates'),
    ]
  ),
  lesson(
    'cli-pipe-2',
    'Redirection',
    'Control input and output',
    'commands',
    'intermediate',
    [
      task('cli-p2-1', 'Redirect to file', 'echo "Hello" > file.txt - redirect output, overwrite file'),
      task('cli-p2-2', 'Append to file', 'echo "World" >> file.txt - redirect output, append to file'),
      task('cli-p2-3', 'Input redirection', 'sort < unsorted.txt - read input from a file'),
      task('cli-p2-4', 'Combined redirection', 'sort < input.txt > output.txt - redirect both input and output'),
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
      task('cli-sys1-1', 'List all processes', 'ps aux - report a snapshot of all running processes'),
      task('cli-sys1-2', 'Interactive viewer', 'top - display real-time system process information'),
      task('cli-sys1-3', 'Find specific process', 'ps aux | grep node - filter processes by name'),
      task('cli-sys1-4', 'Better process viewer', 'htop - interactive process viewer with color display'),
    ]
  ),
  lesson(
    'cli-sys-2',
    'Disk and Memory',
    'Check system resources',
    'commands',
    'intermediate',
    [
      task('cli-sys2-1', 'Check disk space', 'df -h - report file system disk space usage'),
      task('cli-sys2-2', 'Directory size', 'du -sh ./folder - estimate file and directory space usage'),
      task('cli-sys2-3', 'Memory usage', 'free -h - display amount of free and used memory'),
      task('cli-sys2-4', 'System info', 'uname -a - print system information'),
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
      task('cli-git1-1', 'Initialize repository', 'git init - create an empty Git repository'),
      task('cli-git1-2', 'Check status', 'git status - show the working tree status'),
      task('cli-git1-3', 'Stage changes', 'git add . - add all changes to the staging area'),
      task('cli-git1-4', 'Commit changes', 'git commit -m "Initial commit" - record changes to the repository'),
    ]
  ),
  lesson(
    'cli-git-2',
    'Git Workflow',
    'Common Git operations',
    'commands',
    'intermediate',
    [
      task('cli-git2-1', 'Clone repository', 'git clone https://github.com/user/repo.git - clone a remote repository'),
      task('cli-git2-2', 'Push changes', 'git push origin main - update remote refs with local commits'),
      task('cli-git2-3', 'Pull updates', 'git pull origin main - fetch and integrate remote changes'),
      task('cli-git2-4', 'View history', 'git log --oneline - show commit logs in compact format'),
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
      task('cli-perm1-1', 'Make executable', 'chmod +x script.sh - change file mode bits to add execute'),
      task('cli-perm1-2', 'Set octal permissions', 'chmod 755 file.sh - set permissions using octal notation'),
      task('cli-perm1-3', 'View permissions', 'ls -l file.txt - list file with permission details'),
      task('cli-perm1-4', 'Change owner', 'chown user:group file.txt - change file owner and group'),
    ]
  ),
  lesson(
    'cli-perm-2',
    'User Commands',
    'User and group management',
    'commands',
    'advanced',
    [
      task('cli-perm2-1', 'Current user', 'whoami - print the current username'),
      task('cli-perm2-2', 'User ID info', 'id - print user and group IDs'),
      task('cli-perm2-3', 'User groups', 'groups - print group memberships for a user'),
      task('cli-perm2-4', 'Switch user', 'sudo su - username - switch to another user account'),
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
      task('cli-net1-1', 'Test connection', 'ping -c 4 google.com - send ICMP echo requests to a host'),
      task('cli-net1-2', 'HTTP request', 'curl https://api.example.com - transfer data from a URL'),
      task('cli-net1-3', 'Download file', 'wget https://example.com/file.zip - non-interactive network downloader'),
      task('cli-net1-4', 'View IP address', 'ip addr show - display IP addresses and network interfaces'),
    ]
  ),
  lesson(
    'cli-net-2',
    'Remote Access',
    'Connect to remote servers',
    'commands',
    'advanced',
    [
      task('cli-net2-1', 'SSH connection', 'ssh user@hostname - open a secure shell to a remote host'),
      task('cli-net2-2', 'Copy to remote', 'scp file.txt user@host:/path/ - secure copy files over SSH'),
      task('cli-net2-3', 'Check listening ports', 'ss -tuln - investigate sockets and listening ports'),
      task('cli-net2-4', 'DNS lookup', 'dig example.com - DNS lookup utility'),
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
      task('cli-arch1-1', 'Create tar archive', 'tar -cvf archive.tar folder/ - create a tar archive'),
      task('cli-arch1-2', 'Create gzipped tar', 'tar -czvf archive.tar.gz folder/ - create a gzip compressed archive'),
      task('cli-arch1-3', 'Create zip', 'zip -r archive.zip folder/ - package and compress files into a zip'),
      task('cli-arch1-4', 'List archive contents', 'tar -tvf archive.tar - list the contents of a tar archive'),
    ]
  ),
  lesson(
    'cli-arch-2',
    'Extracting Archives',
    'Unpack compressed files',
    'commands',
    'advanced',
    [
      task('cli-arch2-1', 'Extract tar', 'tar -xvf archive.tar - extract files from a tar archive'),
      task('cli-arch2-2', 'Extract gzipped tar', 'tar -xzvf archive.tar.gz - extract a gzip compressed archive'),
      task('cli-arch2-3', 'Extract to directory', 'unzip archive.zip -d output/ - extract zip to a directory'),
      task('cli-arch2-4', 'Extract specific file', 'tar -xvf archive.tar file.txt - extract a single file from archive'),
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
      task('cli-proc1-1', 'Kill by PID', 'kill 1234 - send a signal to a process by ID'),
      task('cli-proc1-2', 'Force kill', 'kill -9 1234 - forcefully terminate a process'),
      task('cli-proc1-3', 'Kill by name', 'pkill -f "python script.py" - signal processes by name pattern'),
      task('cli-proc1-4', 'List jobs', 'jobs - list active jobs in the current shell'),
    ]
  ),
  lesson(
    'cli-proc-2',
    'Background Tasks',
    'Run processes in background',
    'commands',
    'advanced',
    [
      task('cli-proc2-1', 'Run in background', 'nohup ./script.sh & - run immune to hangups in background'),
      task('cli-proc2-2', 'Bring to foreground', 'fg %1 - move a background job to the foreground'),
      task('cli-proc2-3', 'Send to background', 'bg %1 - resume a suspended job in the background'),
      task('cli-proc2-4', 'Disown process', 'disown %1 - remove job from the shell job table'),
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
      task('cli-docker1-1', 'Pull image', 'docker pull nginx - download an image from a registry'),
      task('cli-docker1-2', 'List images', 'docker images - list all downloaded container images'),
      task('cli-docker1-3', 'Run container', 'docker run -d -p 80:80 nginx - create and start a container'),
      task('cli-docker1-4', 'List containers', 'docker ps -a - list all containers including stopped'),
    ]
  ),
  lesson(
    'cli-docker-2',
    'Docker Management',
    'Advanced container operations',
    'commands',
    'expert',
    [
      task('cli-docker2-1', 'Enter container', 'docker exec -it container /bin/bash - run a command in a running container'),
      task('cli-docker2-2', 'View logs', 'docker logs -f container - fetch and follow container logs'),
      task('cli-docker2-3', 'Build image', 'docker build -t myapp . - build an image from a Dockerfile'),
      task('cli-docker2-4', 'Docker Compose', 'docker-compose up -d - start multi-container applications'),
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
      task('test-b1', 'Navigate to home and list', 'cd ~ && ls -la - go home and list all files'),
      task('test-b2', 'Create dir and file', 'mkdir test && touch test/file.txt - create directory and file'),
      task('test-b3', 'Copy and view', 'cp file.txt backup.txt && cat backup.txt - copy then display'),
      task('test-b4', 'Find text files', 'find . -name "*.txt" -type f - search for text files recursively'),
      task('test-b5', 'Search in file', 'grep -n "error" app.log - search with line numbers'),
    ]
  ),
  lesson(
    'cli-test-intermediate',
    'Intermediate Commands Test',
    'Test pipes, redirection, and text processing',
    'commands',
    'advanced',
    [
      task('test-i1', 'Count error lines', 'grep "ERROR" log.txt | wc -l - count lines matching ERROR'),
      task('test-i2', 'Sort and unique', 'cat data.txt | sort | uniq -c | sort -rn - count unique occurrences'),
      task('test-i3', 'Extract column', 'cut -d"," -f2 users.csv | sort - extract and sort a CSV column'),
      task('test-i4', 'Replace text in file', 'sed "s/http/https/g" urls.txt > secure.txt - find and replace text'),
      task('test-i5', 'Git workflow', 'git add . && git commit -m "Update" && git push - stage, commit, push'),
    ]
  ),
  lesson(
    'cli-test-advanced',
    'Advanced Commands Test',
    'Test system admin and DevOps commands',
    'commands',
    'expert',
    [
      task('test-a1', 'Find large files', 'find . -type f -size +100M -exec ls -lh {} + - find files over 100MB'),
      task('test-a2', 'Monitor process memory', 'ps aux | grep node | awk "{sum += $6} END {print sum/1024}" - sum memory usage'),
      task('test-a3', 'Create and extract archive', 'tar -czvf backup.tar.gz ./data && tar -xzvf backup.tar.gz - archive round-trip'),
      task('test-a4', 'Docker cleanup', 'docker system prune -a --volumes - remove all unused Docker data'),
      task('test-a5', 'Network check', 'ss -tuln | grep LISTEN | wc -l - count listening ports'),
    ]
  ),
  lesson(
    'cli-test-master',
    'CLI Mastery Final Test',
    'Comprehensive command line challenge',
    'commands',
    'expert',
    [
      task('test-m1', 'Complex pipeline', 'find . -name "*.log" -mtime -7 | xargs grep -l "ERROR" | wc -l - count error log files'),
      task('test-m2', 'Process management', 'ps aux | sort -nrk 4 | head -5 - top 5 memory-consuming processes'),
      task('test-m3', 'Archive with exclusion', 'tar --exclude="node_modules" -czvf project.tar.gz ./ - archive excluding node_modules'),
      task('test-m4', 'Real-time log filter', 'tail -f /var/log/syslog | grep --line-buffered "error" - follow logs for errors'),
      task('test-m5', 'Full Git workflow', 'git checkout -b feature && git add . && git commit -m "Add feature" && git push -u origin feature - branch, commit, push'),
      task('test-m6', 'Docker deploy', 'docker build -t app:v1 . && docker run -d -p 3000:3000 --name myapp app:v1 - build and run container'),
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

// ============================================
// Claude Code Course - Master the AI Coding Assistant
// ============================================

// Stage 1: Getting Started
const ccStage1Lessons: Lesson[] = [
  lesson(
    'cc-start-1',
    'First Steps',
    'Launch Claude Code and learn the basics',
    'commands',
    'beginner',
    [
      task('cc-s1-1', 'Type the command to start Claude Code', 'claude - Start an interactive Claude Code session in your terminal'),
      task('cc-s1-2', 'Type the command to start with a prompt', 'claude "explain this project" - Start a session with an initial prompt'),
      task('cc-s1-3', 'Type the command to check the version', 'claude -v - Output the current version number of Claude Code'),
      task('cc-s1-4', 'Type the command to update', 'claude update - Update Claude Code to the latest version'),
    ]
  ),
  lesson(
    'cc-start-2',
    'Getting Help',
    'Learn how to find help and check status',
    'commands',
    'beginner',
    [
      task('cc-s2-1', 'Type the help command', '/help - Get usage help and list all available slash commands'),
      task('cc-s2-2', 'Type the status command', '/status - Open Settings interface showing version, model, and account info'),
      task('cc-s2-3', 'Type the doctor command', '/doctor - Check the health of your Claude Code installation'),
      task('cc-s2-4', 'Type the cost command', '/cost - Show token usage statistics for the current session'),
    ]
  ),
];

// Stage 2: Print Mode & Piping
const ccStage2Lessons: Lesson[] = [
  lesson(
    'cc-print-1',
    'Print Mode Basics',
    'Use Claude Code for one-shot queries and scripting',
    'commands',
    'beginner',
    [
      task('cc-p1-1', 'Type the print mode flag', 'claude -p "explain this function" - Print response without interactive mode'),
      task('cc-p1-2', 'Type a piped command', 'cat logs.txt | claude -p "explain these errors" - Process piped content'),
      task('cc-p1-3', 'Type the JSON output flag', 'claude -p --output-format json "analyze this" - Get structured JSON output'),
      task('cc-p1-4', 'Type the stream JSON flag', 'claude -p --output-format stream-json "query" - Stream JSON events'),
    ]
  ),
  lesson(
    'cc-print-2',
    'Budget & Limits',
    'Control spending and turn limits in print mode',
    'commands',
    'beginner',
    [
      task('cc-p2-1', 'Type the budget flag', 'claude -p --max-budget-usd 5.00 "query" - Set maximum dollar spend'),
      task('cc-p2-2', 'Type the max turns flag', 'claude -p --max-turns 3 "query" - Limit the number of agentic turns'),
      task('cc-p2-3', 'Type a scripting workflow', 'cat build-error.txt | claude -p "explain the root cause" > output.txt'),
      task('cc-p2-4', 'Type a linting workflow', 'claude -p "look at changes vs main and report issues"'),
    ]
  ),
];

// Stage 3: Session Management
const ccStage3Lessons: Lesson[] = [
  lesson(
    'cc-session-1',
    'Continue & Resume',
    'Pick up where you left off',
    'commands',
    'intermediate',
    [
      task('cc-se1-1', 'Type the continue flag', 'claude -c - Continue the most recent conversation in the current directory'),
      task('cc-se1-2', 'Type the continue with print flag', 'claude -c -p "check for type errors" - Continue in print mode'),
      task('cc-se1-3', 'Type the resume flag', 'claude -r "auth-refactor" "finish this PR" - Resume a session by name'),
      task('cc-se1-4', 'Type the fork session flag', 'claude --resume abc123 --fork-session - Fork a session into a new one'),
    ]
  ),
  lesson(
    'cc-session-2',
    'Session Slash Commands',
    'Manage sessions from inside the REPL',
    'commands',
    'intermediate',
    [
      task('cc-se2-1', 'Type the rename command', '/rename auth-refactor - Rename the current session for easy identification'),
      task('cc-se2-2', 'Type the resume command', '/resume - Open the session picker to resume a previous conversation'),
      task('cc-se2-3', 'Type the export command', '/export conversation.md - Export the current conversation to a file'),
      task('cc-se2-4', 'Type the clear command', '/clear - Clear conversation history and start fresh'),
    ]
  ),
];

// Stage 4: Context & Memory
const ccStage4Lessons: Lesson[] = [
  lesson(
    'cc-ctx-1',
    'Context Management',
    'Control what Claude knows about your project',
    'commands',
    'intermediate',
    [
      task('cc-c1-1', 'Type the compact command', '/compact - Compress conversation to free up context window space'),
      task('cc-c1-2', 'Type compact with focus', '/compact "focus on authentication" - Compact with focus instructions'),
      task('cc-c1-3', 'Type the context command', '/context - Visualize current context usage as a colored grid'),
      task('cc-c1-4', 'Type the rewind command', '/rewind - Rewind the conversation and code to a previous state'),
    ]
  ),
  lesson(
    'cc-ctx-2',
    'Memory & CLAUDE.md',
    'Set up persistent project memory',
    'commands',
    'intermediate',
    [
      task('cc-c2-1', 'Type the init command', '/init - Initialize project with a CLAUDE.md guide file'),
      task('cc-c2-2', 'Type the memory command', '/memory - Edit CLAUDE.md memory files for persistent instructions'),
      task('cc-c2-3', 'Type a file reference', '@src/utils/auth.js - Reference a file to add it to context'),
      task('cc-c2-4', 'Type a directory reference', '@src/components/ - Reference a directory listing for context'),
    ]
  ),
];

// Stage 5: Model & Thinking
const ccStage5Lessons: Lesson[] = [
  lesson(
    'cc-model-1',
    'Model Selection',
    'Choose and configure AI models',
    'commands',
    'intermediate',
    [
      task('cc-m1-1', 'Type the model flag', 'claude --model sonnet - Set the model for the session'),
      task('cc-m1-2', 'Type the model slash command', '/model - Select or change the AI model interactively'),
      task('cc-m1-3', 'Type the fallback model flag', 'claude -p --fallback-model sonnet "query" - Auto-fallback when overloaded'),
      task('cc-m1-4', 'Type the effort level env var', 'CLAUDE_CODE_EFFORT_LEVEL=high claude - Set reasoning effort level'),
    ]
  ),
  lesson(
    'cc-model-2',
    'Extended Thinking',
    'Enable deeper reasoning for complex tasks',
    'commands',
    'intermediate',
    [
      task('cc-m2-1', 'Type the verbose flag', 'claude --verbose - Enable verbose logging with full turn-by-turn output'),
      task('cc-m2-2', 'Type the plan mode command', '/plan - Enter plan mode for read-only analysis before coding'),
      task('cc-m2-3', 'Type the thinking env var', 'MAX_THINKING_TOKENS=16000 - Override the extended thinking token budget'),
      task('cc-m2-4', 'Type the output tokens env var', 'CLAUDE_CODE_MAX_OUTPUT_TOKENS=64000 - Set maximum output token limit'),
    ]
  ),
];

// Stage 6: Permissions & Security
const ccStage6Lessons: Lesson[] = [
  lesson(
    'cc-perm-1',
    'Permission Modes',
    'Control what Claude can do automatically',
    'commands',
    'intermediate',
    [
      task('cc-pe1-1', 'Type the permissions command', '/permissions - View or update current permission settings'),
      task('cc-pe1-2', 'Type the permission mode flag', 'claude --permission-mode plan - Start in plan mode (read-only)'),
      task('cc-pe1-3', 'Type the allowed tools flag', 'claude --allowedTools "Bash(git log *)" "Read" - Allow specific tools'),
      task('cc-pe1-4', 'Type the disallowed tools flag', 'claude --disallowedTools "Bash(curl *)" - Block specific tools'),
    ]
  ),
  lesson(
    'cc-perm-2',
    'Settings Configuration',
    'Configure Claude Code behavior',
    'commands',
    'intermediate',
    [
      task('cc-pe2-1', 'Type the config command', '/config - Open the Settings interface to configure Claude Code'),
      task('cc-pe2-2', 'Type the theme command', '/theme - Change the color theme of the interface'),
      task('cc-pe2-3', 'Type the settings flag', 'claude --settings ./settings.json - Load settings from a JSON file'),
      task('cc-pe2-4', 'Type the add dir flag', 'claude --add-dir ../apps ../lib - Add extra working directories'),
    ]
  ),
];

// Stage 7: MCP Servers
const ccStage7Lessons: Lesson[] = [
  lesson(
    'cc-mcp-1',
    'MCP Basics',
    'Add and manage Model Context Protocol servers',
    'commands',
    'advanced',
    [
      task('cc-mc1-1', 'Type the MCP list command', 'claude mcp list - List all configured MCP servers'),
      task('cc-mc1-2', 'Type the MCP add command', 'claude mcp add --transport http notion https://mcp.notion.com/mcp'),
      task('cc-mc1-3', 'Type the MCP remove command', 'claude mcp remove github - Remove a configured MCP server'),
      task('cc-mc1-4', 'Type the MCP get command', 'claude mcp get github - Get details for a specific MCP server'),
    ]
  ),
  lesson(
    'cc-mcp-2',
    'MCP Advanced',
    'Advanced MCP configuration and scoping',
    'commands',
    'advanced',
    [
      task('cc-mc2-1', 'Type the MCP scope flag', 'claude mcp add --scope user my-server - Add server with user scope'),
      task('cc-mc2-2', 'Type the MCP serve command', 'claude mcp serve - Start Claude Code itself as an MCP server'),
      task('cc-mc2-3', 'Type the MCP config flag', 'claude --mcp-config ./mcp.json - Load MCP servers from a config file'),
      task('cc-mc2-4', 'Type the MCP import command', 'claude mcp add-from-claude-desktop - Import servers from Claude Desktop'),
    ]
  ),
];

// Stage 8: Keyboard Shortcuts
const ccStage8Lessons: Lesson[] = [
  lesson(
    'cc-keys-1',
    'Essential Shortcuts',
    'Core keyboard shortcuts for the REPL',
    'commands',
    'intermediate',
    [
      task('cc-k1-1', 'Type the cancel shortcut', 'Ctrl+C - Cancel current input or generation'),
      task('cc-k1-2', 'Type the exit shortcut', 'Ctrl+D - Exit the Claude Code session'),
      task('cc-k1-3', 'Type the clear screen shortcut', 'Ctrl+L - Clear terminal screen while keeping conversation'),
      task('cc-k1-4', 'Type the verbose toggle', 'Ctrl+O - Toggle verbose output to show thinking'),
    ]
  ),
  lesson(
    'cc-keys-2',
    'Advanced Shortcuts',
    'Power user keyboard shortcuts',
    'commands',
    'intermediate',
    [
      task('cc-k2-1', 'Type the background shortcut', 'Ctrl+B - Background running tasks'),
      task('cc-k2-2', 'Type the task list toggle', 'Ctrl+T - Toggle task list display'),
      task('cc-k2-3', 'Type the editor shortcut', 'Ctrl+G - Open current prompt in your default text editor'),
      task('cc-k2-4', 'Type the model switch shortcut', 'Option+P - Switch model without clearing the current prompt'),
    ]
  ),
];

// Stage 9: System Prompts & Agents
const ccStage9Lessons: Lesson[] = [
  lesson(
    'cc-sys-1',
    'Custom System Prompts',
    'Override and extend the system prompt',
    'commands',
    'advanced',
    [
      task('cc-sy1-1', 'Type the system prompt flag', 'claude --system-prompt "You are a code reviewer" - Replace system prompt'),
      task('cc-sy1-2', 'Type the append system prompt flag', 'claude --append-system-prompt "Always use TypeScript" - Extend prompt'),
      task('cc-sy1-3', 'Type the system prompt file flag', 'claude -p --system-prompt-file prompt.txt "query" - Load prompt from file'),
      task('cc-sy1-4', 'Type the append file flag', 'claude -p --append-system-prompt-file rules.txt "query" - Append from file'),
    ]
  ),
  lesson(
    'cc-sys-2',
    'Agents & Tasks',
    'Create and manage custom agents',
    'commands',
    'advanced',
    [
      task('cc-sy2-1', 'Type the agents command', '/agents - Manage subagents: view, create, and edit them'),
      task('cc-sy2-2', 'Type the agent flag', 'claude --agent my-custom-agent - Use a specific agent for the session'),
      task('cc-sy2-3', 'Type the tasks command', '/tasks - List and manage background tasks'),
      task('cc-sy2-4', 'Type the todos command', '/todos - List current TODO items being tracked'),
    ]
  ),
];

// Stage 10: Git & GitHub Integration
const ccStage10Lessons: Lesson[] = [
  lesson(
    'cc-git-1',
    'GitHub Workflows',
    'Use Claude Code with GitHub',
    'commands',
    'advanced',
    [
      task('cc-g1-1', 'Type the from-pr flag', 'claude --from-pr 123 - Resume sessions linked to a specific GitHub PR'),
      task('cc-g1-2', 'Type the install github app command', '/install-github-app - Set up GitHub Actions for auto PR reviews'),
      task('cc-g1-3', 'Type a bash mode command', '!git status - Run shell commands directly with output added to context'),
      task('cc-g1-4', 'Type the copy command', '/copy - Copy the last assistant response to clipboard'),
    ]
  ),
  lesson(
    'cc-git-2',
    'Remote Sessions',
    'Work with Claude Code across environments',
    'commands',
    'advanced',
    [
      task('cc-g2-1', 'Type the remote flag', 'claude --remote "Fix the login bug" - Create a web session on claude.ai'),
      task('cc-g2-2', 'Type the teleport flag', 'claude --teleport - Resume a web session in your local terminal'),
      task('cc-g2-3', 'Type the teleport slash command', '/teleport - Resume a remote session from inside the REPL'),
      task('cc-g2-4', 'Type the IDE flag', 'claude --ide - Auto-connect to IDE on startup if available'),
    ]
  ),
];

// Stage 11: Environment Variables
const ccStage11Lessons: Lesson[] = [
  lesson(
    'cc-env-1',
    'Core Environment Variables',
    'Configure Claude Code with environment variables',
    'commands',
    'advanced',
    [
      task('cc-e1-1', 'Type the API key variable', 'ANTHROPIC_API_KEY=sk-ant-... claude - Authenticate with an API key'),
      task('cc-e1-2', 'Type the model variable', 'ANTHROPIC_MODEL=claude-sonnet-4-5-20250929 claude - Override default model'),
      task('cc-e1-3', 'Type the shell variable', 'CLAUDE_CODE_SHELL=/bin/zsh claude - Override shell detection'),
      task('cc-e1-4', 'Type the tmpdir variable', 'CLAUDE_CODE_TMPDIR=/custom/tmp claude - Override temp directory'),
    ]
  ),
  lesson(
    'cc-env-2',
    'Advanced Variables',
    'Fine-tune behavior with environment variables',
    'commands',
    'advanced',
    [
      task('cc-e2-1', 'Type the MCP timeout variable', 'MCP_TIMEOUT=10000 claude - Set MCP server startup timeout in ms'),
      task('cc-e2-2', 'Type the MCP output variable', 'MAX_MCP_OUTPUT_TOKENS=25000 - Set max tokens for MCP tool output'),
      task('cc-e2-3', 'Type the telemetry variable', 'DISABLE_TELEMETRY=1 claude - Opt out of telemetry collection'),
      task('cc-e2-4', 'Type the auto-update variable', 'DISABLE_AUTOUPDATER=1 claude - Disable automatic updates'),
    ]
  ),
];

// Stage 12: Configuration Files
const ccStage12Lessons: Lesson[] = [
  lesson(
    'cc-cfg-1',
    'Settings Files',
    'Understand the Claude Code configuration hierarchy',
    'commands',
    'advanced',
    [
      task('cc-cf1-1', 'Type the user settings path', '~/.claude/settings.json - User-level global settings file'),
      task('cc-cf1-2', 'Type the project settings path', '.claude/settings.json - Project-level team-shared settings file'),
      task('cc-cf1-3', 'Type the local settings path', '.claude/settings.local.json - Project-level personal settings (gitignored)'),
      task('cc-cf1-4', 'Type the MCP config path', '.mcp.json - Project-scoped MCP server configuration file'),
    ]
  ),
  lesson(
    'cc-cfg-2',
    'Skills & Commands',
    'Create custom slash commands and skills',
    'commands',
    'advanced',
    [
      task('cc-cf2-1', 'Type the project skills path', '.claude/skills/ - Project-specific skills directory'),
      task('cc-cf2-2', 'Type the personal skills path', '~/.claude/skills/ - Personal skills directory for all projects'),
      task('cc-cf2-3', 'Type the project commands path', '.claude/commands/ - Project-specific custom slash commands'),
      task('cc-cf2-4', 'Type the agents path', '.claude/agents/ - Project-specific subagent definitions'),
    ]
  ),
];

// Stage 13: Advanced Workflows
const ccStage13Lessons: Lesson[] = [
  lesson(
    'cc-adv-1',
    'Multiline & Editing',
    'Master multiline input and editing modes',
    'commands',
    'advanced',
    [
      task('cc-a1-1', 'Type the multiline escape', 'Press \\ then Enter to start a new line in the prompt'),
      task('cc-a1-2', 'Type the vim command', '/vim - Enable vim-style editing mode in the REPL'),
      task('cc-a1-3', 'Type the terminal setup command', '/terminal-setup - Install Shift+Enter binding for multiline input'),
      task('cc-a1-4', 'Type the stats command', '/stats - Visualize daily usage, session history, and streaks'),
    ]
  ),
  lesson(
    'cc-adv-2',
    'Hooks & Lifecycle',
    'Run custom commands at lifecycle events',
    'commands',
    'expert',
    [
      task('cc-a2-1', 'Type the PreToolUse hook', 'PreToolUse - Hook that fires before a tool is executed'),
      task('cc-a2-2', 'Type the PostToolUse hook', 'PostToolUse - Hook that fires after a tool completes'),
      task('cc-a2-3', 'Type the UserPromptSubmit hook', 'UserPromptSubmit - Hook that fires when the user submits a prompt'),
      task('cc-a2-4', 'Type the SessionStart hook', 'SessionStart - Hook that fires when a new session begins'),
    ]
  ),
];

// Stage 14: Mastery Test
const ccMasteryTest: Lesson[] = [
  lesson(
    'cc-test-1',
    'Claude Code Mastery Test',
    'Prove your Claude Code knowledge',
    'commands',
    'expert',
    [
      task('cc-t1-1', 'Type a complete print mode workflow', 'cat error.log | claude -p --output-format json "diagnose this"'),
      task('cc-t1-2', 'Type a session management workflow', 'claude -r "feature-auth" --fork-session "continue from here"'),
      task('cc-t1-3', 'Type an MCP configuration command', 'claude mcp add --transport http --scope user github https://mcp.github.com'),
      task('cc-t1-4', 'Type a full flags combo', 'claude --model opus --permission-mode plan --add-dir ../shared --verbose'),
      task('cc-t1-5', 'Type environment setup', 'ANTHROPIC_API_KEY=sk-ant-key CLAUDE_CODE_EFFORT_LEVEL=high claude'),
      task('cc-t1-6', 'Type all essential slash commands', '/compact /context /model /permissions /memory /config'),
    ]
  ),
];

// All Claude Code course lessons
export const ccCourseLessons: Lesson[] = [
  ...ccStage1Lessons,
  ...ccStage2Lessons,
  ...ccStage3Lessons,
  ...ccStage4Lessons,
  ...ccStage5Lessons,
  ...ccStage6Lessons,
  ...ccStage7Lessons,
  ...ccStage8Lessons,
  ...ccStage9Lessons,
  ...ccStage10Lessons,
  ...ccStage11Lessons,
  ...ccStage12Lessons,
  ...ccStage13Lessons,
  ...ccMasteryTest,
];

// Create the Claude Code course
export const claudeCodeCourse: Course = {
  id: 'claude-code',
  name: 'Claude Code Mastery',
  description: 'Master Claude Code from basic commands to advanced workflows and MCP configuration',
  stages: [
    {
      id: 'cc-stage-1',
      name: 'Getting Started',
      description: 'Launch Claude Code and learn the essential first commands',
      lessons: ccStage1Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: false },
    },
    {
      id: 'cc-stage-2',
      name: 'Print Mode & Piping',
      description: 'Use Claude Code for scripting, one-shot queries, and CI/CD',
      lessons: ccStage2Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cc-stage-3',
      name: 'Session Management',
      description: 'Continue, resume, and manage conversations',
      lessons: ccStage3Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cc-stage-4',
      name: 'Context & Memory',
      description: 'Manage context, compact conversations, and set up CLAUDE.md',
      lessons: ccStage4Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cc-stage-5',
      name: 'Model & Thinking',
      description: 'Choose models, configure reasoning depth, and use plan mode',
      lessons: ccStage5Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cc-stage-6',
      name: 'Permissions & Security',
      description: 'Control permissions, tool access, and settings',
      lessons: ccStage6Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cc-stage-7',
      name: 'MCP Servers',
      description: 'Add, configure, and manage Model Context Protocol servers',
      lessons: ccStage7Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cc-stage-8',
      name: 'Keyboard Shortcuts',
      description: 'Essential and advanced keyboard shortcuts for the REPL',
      lessons: ccStage8Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cc-stage-9',
      name: 'System Prompts & Agents',
      description: 'Customize system prompts and work with subagents',
      lessons: ccStage9Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cc-stage-10',
      name: 'Git & GitHub',
      description: 'GitHub integration, remote sessions, and IDE connection',
      lessons: ccStage10Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cc-stage-11',
      name: 'Environment Variables',
      description: 'Configure Claude Code with environment variables',
      lessons: ccStage11Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true, minWpm: 20 },
    },
    {
      id: 'cc-stage-12',
      name: 'Configuration Files',
      description: 'Understand settings hierarchy, skills, and custom commands',
      lessons: ccStage12Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cc-stage-13',
      name: 'Advanced Workflows',
      description: 'Multiline editing, vim mode, and lifecycle hooks',
      lessons: ccStage13Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'cc-stage-test',
      name: 'Claude Code Mastery Test',
      description: 'Prove your Claude Code expertise',
      lessons: ccMasteryTest.map(l => l.id),
      unlockCriteria: { previousStageComplete: true, minWpm: 25, minAccuracy: 0.90 },
    },
  ],
};

// ============================================
// SQL Course - Master SQL from basics to advanced
// ============================================

// Stage 1: Your First Queries
const sqlStage1Lessons: Lesson[] = [
  lesson(
    'sql-basics-1',
    'SELECT Fundamentals',
    'Learn to retrieve data from tables',
    'commands',
    'beginner',
    [
      task('sql-b1-1', 'Select all columns from a table', 'SELECT * FROM users; -- select all columns from a table'),
      task('sql-b1-2', 'Select specific columns', 'SELECT name, email FROM users; -- choose only the columns you need'),
      task('sql-b1-3', 'Select with alias', 'SELECT name AS full_name FROM users; -- rename a column in the output'),
      task('sql-b1-4', 'Select distinct values', 'SELECT DISTINCT city FROM users; -- remove duplicate rows'),
    ]
  ),
  lesson(
    'sql-basics-2',
    'Filtering with WHERE',
    'Filter rows using conditions',
    'commands',
    'beginner',
    [
      task('sql-b2-1', 'Filter by equality', 'SELECT * FROM users WHERE active = true; -- filter rows by condition'),
      task('sql-b2-2', 'Filter by comparison', 'SELECT * FROM products WHERE price > 100; -- compare column values'),
      task('sql-b2-3', 'Filter with LIKE', "SELECT * FROM users WHERE name LIKE 'J%'; -- pattern matching with wildcards"),
      task('sql-b2-4', 'Filter with IN', "SELECT * FROM users WHERE city IN ('NYC', 'LA'); -- match against a list"),
    ]
  ),
];

// Stage 2: Sorting & Limiting
const sqlStage2Lessons: Lesson[] = [
  lesson(
    'sql-sort-1',
    'ORDER BY & LIMIT',
    'Sort and limit your query results',
    'commands',
    'beginner',
    [
      task('sql-so1-1', 'Sort ascending', 'SELECT * FROM users ORDER BY name ASC; -- sort results A to Z'),
      task('sql-so1-2', 'Sort descending', 'SELECT * FROM users ORDER BY created_at DESC; -- newest first'),
      task('sql-so1-3', 'Limit results', 'SELECT * FROM products ORDER BY price DESC LIMIT 10; -- return only 10 rows'),
      task('sql-so1-4', 'Offset results', 'SELECT * FROM products ORDER BY id LIMIT 10 OFFSET 20; -- skip rows for pagination'),
    ]
  ),
  lesson(
    'sql-sort-2',
    'Combining Conditions',
    'Use AND, OR, NOT, and BETWEEN',
    'commands',
    'beginner',
    [
      task('sql-so2-1', 'AND operator', 'SELECT * FROM users WHERE active = true AND age > 18; -- both conditions must be true'),
      task('sql-so2-2', 'OR operator', "SELECT * FROM products WHERE category = 'books' OR category = 'music'; -- either condition"),
      task('sql-so2-3', 'NOT operator', 'SELECT * FROM users WHERE NOT deleted; -- negate a condition'),
      task('sql-so2-4', 'BETWEEN operator', 'SELECT * FROM orders WHERE total BETWEEN 50 AND 200; -- inclusive range check'),
    ]
  ),
];

// Stage 3: INSERT, UPDATE, DELETE
const sqlStage3Lessons: Lesson[] = [
  lesson(
    'sql-write-1',
    'Inserting Data',
    'Add new rows to tables',
    'commands',
    'beginner',
    [
      task('sql-w1-1', 'Insert a single row', "INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com'); -- add a new row"),
      task('sql-w1-2', 'Insert multiple rows', "INSERT INTO tags (name) VALUES ('sql'), ('python'), ('rust'); -- batch insert"),
      task('sql-w1-3', 'Insert with default values', 'INSERT INTO orders (user_id, total) VALUES (1, 99.99); -- omitted columns use defaults'),
      task('sql-w1-4', 'Insert from select', 'INSERT INTO archive SELECT * FROM logs WHERE created_at < NOW() - INTERVAL 1 YEAR; -- copy rows from another table'),
    ]
  ),
  lesson(
    'sql-write-2',
    'Updating & Deleting',
    'Modify and remove existing data',
    'commands',
    'beginner',
    [
      task('sql-w2-1', 'Update a row', "UPDATE users SET email = 'new@example.com' WHERE id = 1; -- modify existing data"),
      task('sql-w2-2', 'Update multiple columns', "UPDATE products SET price = 19.99, stock = 50 WHERE id = 42; -- change several fields at once"),
      task('sql-w2-3', 'Delete a row', 'DELETE FROM sessions WHERE expired_at < NOW(); -- remove rows matching condition'),
      task('sql-w2-4', 'Truncate a table', 'TRUNCATE TABLE temp_logs; -- remove all rows instantly'),
    ]
  ),
];

// Stage 4: Aggregate Functions
const sqlStage4Lessons: Lesson[] = [
  lesson(
    'sql-agg-1',
    'COUNT, SUM, AVG',
    'Summarize data with aggregate functions',
    'commands',
    'intermediate',
    [
      task('sql-a1-1', 'Count rows', 'SELECT COUNT(*) FROM users; -- count the number of rows'),
      task('sql-a1-2', 'Count with condition', 'SELECT COUNT(*) FROM orders WHERE status = \'completed\'; -- count filtered rows'),
      task('sql-a1-3', 'Sum values', 'SELECT SUM(total) FROM orders; -- add up all values in a column'),
      task('sql-a1-4', 'Average value', 'SELECT AVG(price) FROM products WHERE category = \'electronics\'; -- compute the mean'),
    ]
  ),
  lesson(
    'sql-agg-2',
    'MIN, MAX & GROUP BY',
    'Find extremes and group results',
    'commands',
    'intermediate',
    [
      task('sql-a2-1', 'Find minimum', 'SELECT MIN(price) FROM products; -- find the smallest value'),
      task('sql-a2-2', 'Find maximum', 'SELECT MAX(created_at) FROM users; -- find the largest value'),
      task('sql-a2-3', 'Group by column', 'SELECT city, COUNT(*) FROM users GROUP BY city; -- aggregate rows by group'),
      task('sql-a2-4', 'Group with HAVING', 'SELECT city, COUNT(*) FROM users GROUP BY city HAVING COUNT(*) > 5; -- filter groups'),
    ]
  ),
];

// Stage 5: INNER & LEFT JOINs
const sqlStage5Lessons: Lesson[] = [
  lesson(
    'sql-join-1',
    'INNER JOIN',
    'Combine rows from related tables',
    'commands',
    'intermediate',
    [
      task('sql-j1-1', 'Basic inner join', 'SELECT * FROM orders INNER JOIN users ON orders.user_id = users.id; -- combine matching rows'),
      task('sql-j1-2', 'Join with aliases', 'SELECT o.id, u.name FROM orders o INNER JOIN users u ON o.user_id = u.id; -- use short table aliases'),
      task('sql-j1-3', 'Join with filter', 'SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id WHERE o.total > 100; -- join then filter'),
      task('sql-j1-4', 'Multi-table join', 'SELECT u.name, p.title FROM users u JOIN orders o ON u.id = o.user_id JOIN products p ON o.product_id = p.id; -- chain multiple joins'),
    ]
  ),
  lesson(
    'sql-join-2',
    'LEFT & RIGHT JOIN',
    'Include unmatched rows from one side',
    'commands',
    'intermediate',
    [
      task('sql-j2-1', 'Left join', 'SELECT u.name, o.id FROM users u LEFT JOIN orders o ON u.id = o.user_id; -- keep all left rows'),
      task('sql-j2-2', 'Find unmatched rows', 'SELECT u.name FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE o.id IS NULL; -- find rows with no match'),
      task('sql-j2-3', 'Right join', 'SELECT o.id, u.name FROM orders o RIGHT JOIN users u ON o.user_id = u.id; -- keep all right rows'),
      task('sql-j2-4', 'Left join with aggregation', 'SELECT u.name, COUNT(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.name; -- count per user'),
    ]
  ),
];

// Stage 6: Advanced JOINs
const sqlStage6Lessons: Lesson[] = [
  lesson(
    'sql-join-3',
    'FULL & CROSS JOIN',
    'All join types and self-joins',
    'commands',
    'intermediate',
    [
      task('sql-j3-1', 'Full outer join', 'SELECT * FROM employees e FULL OUTER JOIN departments d ON e.dept_id = d.id; -- keep all rows from both sides'),
      task('sql-j3-2', 'Cross join', 'SELECT colors.name, sizes.label FROM colors CROSS JOIN sizes; -- every combination of rows'),
      task('sql-j3-3', 'Self join', 'SELECT e.name AS employee, m.name AS manager FROM employees e JOIN employees m ON e.manager_id = m.id; -- join a table to itself'),
      task('sql-j3-4', 'Natural join', 'SELECT * FROM orders NATURAL JOIN users; -- join on columns with matching names'),
    ]
  ),
  lesson(
    'sql-join-4',
    'JOIN Patterns',
    'Common real-world join patterns',
    'commands',
    'intermediate',
    [
      task('sql-j4-1', 'Many-to-many join', 'SELECT s.name, c.title FROM students s JOIN enrollments e ON s.id = e.student_id JOIN courses c ON e.course_id = c.id; -- bridge table pattern'),
      task('sql-j4-2', 'Join with subquery', 'SELECT u.name, t.total FROM users u JOIN (SELECT user_id, SUM(amount) AS total FROM payments GROUP BY user_id) t ON u.id = t.user_id; -- join to a derived table'),
      task('sql-j4-3', 'Conditional join', 'SELECT * FROM products p JOIN discounts d ON p.category = d.category AND p.price > d.min_price; -- multi-condition join'),
      task('sql-j4-4', 'Anti-join pattern', 'SELECT p.title FROM products p LEFT JOIN order_items oi ON p.id = oi.product_id WHERE oi.id IS NULL; -- find never-ordered products'),
    ]
  ),
];

// Stage 7: Subqueries
const sqlStage7Lessons: Lesson[] = [
  lesson(
    'sql-sub-1',
    'Basic Subqueries',
    'Use queries inside queries',
    'commands',
    'intermediate',
    [
      task('sql-sq1-1', 'Subquery in WHERE', 'SELECT * FROM users WHERE id IN (SELECT user_id FROM orders WHERE total > 500); -- filter using a subquery'),
      task('sql-sq1-2', 'Scalar subquery', 'SELECT name, price, (SELECT AVG(price) FROM products) AS avg_price FROM products; -- embed a single-value query'),
      task('sql-sq1-3', 'EXISTS subquery', 'SELECT u.name FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id); -- check if related rows exist'),
      task('sql-sq1-4', 'NOT EXISTS subquery', 'SELECT u.name FROM users u WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id); -- find rows with no match'),
    ]
  ),
  lesson(
    'sql-sub-2',
    'Correlated Subqueries',
    'Subqueries that reference the outer query',
    'commands',
    'intermediate',
    [
      task('sql-sq2-1', 'Correlated subquery', 'SELECT p.title, p.price FROM products p WHERE p.price > (SELECT AVG(price) FROM products WHERE category = p.category); -- reference outer query'),
      task('sql-sq2-2', 'Subquery in FROM', 'SELECT dept, avg_salary FROM (SELECT department AS dept, AVG(salary) AS avg_salary FROM employees GROUP BY department) sub; -- derived table'),
      task('sql-sq2-3', 'ALL operator', 'SELECT * FROM products WHERE price >= ALL (SELECT price FROM products WHERE category = \'premium\'); -- compare against every row'),
      task('sql-sq2-4', 'ANY operator', 'SELECT * FROM users WHERE age > ANY (SELECT age FROM users WHERE city = \'NYC\'); -- compare against any row'),
    ]
  ),
];

// Stage 8: String & Date Functions
const sqlStage8Lessons: Lesson[] = [
  lesson(
    'sql-func-1',
    'String Functions',
    'Manipulate text data in queries',
    'commands',
    'intermediate',
    [
      task('sql-fn1-1', 'Concatenate strings', "SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users; -- join strings together"),
      task('sql-fn1-2', 'Uppercase and lowercase', 'SELECT UPPER(name), LOWER(email) FROM users; -- change text case'),
      task('sql-fn1-3', 'Substring extraction', 'SELECT SUBSTRING(phone, 1, 3) AS area_code FROM contacts; -- extract part of a string'),
      task('sql-fn1-4', 'Replace and trim', "SELECT TRIM(name), REPLACE(email, 'old.com', 'new.com') FROM users; -- clean and transform text"),
    ]
  ),
  lesson(
    'sql-func-2',
    'Date & Time Functions',
    'Work with dates and timestamps',
    'commands',
    'intermediate',
    [
      task('sql-fn2-1', 'Current date and time', 'SELECT NOW(), CURRENT_DATE, CURRENT_TIMESTAMP; -- get the current date and time'),
      task('sql-fn2-2', 'Extract date parts', 'SELECT EXTRACT(YEAR FROM created_at), EXTRACT(MONTH FROM created_at) FROM orders; -- pull out year or month'),
      task('sql-fn2-3', 'Date arithmetic', "SELECT * FROM subscriptions WHERE end_date > NOW() + INTERVAL '30 days'; -- add or subtract time"),
      task('sql-fn2-4', 'Format dates', "SELECT TO_CHAR(created_at, 'YYYY-MM-DD') AS date_str FROM events; -- format a timestamp as text"),
    ]
  ),
];

// Stage 9: CASE, COALESCE & Type Casting
const sqlStage9Lessons: Lesson[] = [
  lesson(
    'sql-case-1',
    'CASE Expressions',
    'Add conditional logic to queries',
    'commands',
    'intermediate',
    [
      task('sql-cs1-1', 'Simple CASE', "SELECT name, CASE status WHEN 'active' THEN 'Active' WHEN 'inactive' THEN 'Inactive' END FROM users; -- value-based branching"),
      task('sql-cs1-2', 'Searched CASE', "SELECT name, CASE WHEN age < 18 THEN 'minor' WHEN age < 65 THEN 'adult' ELSE 'senior' END AS group_label FROM users; -- condition-based branching"),
      task('sql-cs1-3', 'CASE in aggregate', "SELECT COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed FROM orders; -- conditional counting"),
      task('sql-cs1-4', 'CASE in ORDER BY', "SELECT * FROM tasks ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END; -- custom sort order"),
    ]
  ),
  lesson(
    'sql-case-2',
    'COALESCE & NULL Handling',
    'Handle NULL values gracefully',
    'commands',
    'intermediate',
    [
      task('sql-cs2-1', 'COALESCE function', "SELECT COALESCE(nickname, first_name, 'Anonymous') AS display_name FROM users; -- return first non-null value"),
      task('sql-cs2-2', 'NULLIF function', "SELECT NULLIF(status, 'unknown') FROM records; -- return null if values are equal"),
      task('sql-cs2-3', 'IS NULL check', 'SELECT * FROM users WHERE deleted_at IS NULL; -- test for null values'),
      task('sql-cs2-4', 'Cast types', 'SELECT CAST(price AS INTEGER), CAST(created_at AS DATE) FROM products; -- convert between data types'),
    ]
  ),
];

// Stage 10: Table DDL
const sqlStage10Lessons: Lesson[] = [
  lesson(
    'sql-ddl-1',
    'CREATE TABLE',
    'Define new tables with constraints',
    'commands',
    'advanced',
    [
      task('sql-d1-1', 'Create a table', 'CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(255) UNIQUE); -- define a new table'),
      task('sql-d1-2', 'Add foreign key', 'CREATE TABLE orders (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), total DECIMAL(10,2)); -- reference another table'),
      task('sql-d1-3', 'Add check constraint', 'CREATE TABLE products (id SERIAL PRIMARY KEY, price DECIMAL(10,2) CHECK (price > 0), stock INTEGER DEFAULT 0); -- enforce data rules'),
      task('sql-d1-4', 'Create with timestamp', 'CREATE TABLE posts (id SERIAL PRIMARY KEY, title TEXT NOT NULL, created_at TIMESTAMP DEFAULT NOW()); -- auto-set creation time'),
    ]
  ),
  lesson(
    'sql-ddl-2',
    'ALTER & DROP TABLE',
    'Modify and remove table structures',
    'commands',
    'advanced',
    [
      task('sql-d2-1', 'Add a column', 'ALTER TABLE users ADD COLUMN phone VARCHAR(20); -- add a new column to a table'),
      task('sql-d2-2', 'Drop a column', 'ALTER TABLE users DROP COLUMN phone; -- remove a column from a table'),
      task('sql-d2-3', 'Rename a column', 'ALTER TABLE users RENAME COLUMN name TO full_name; -- change a column name'),
      task('sql-d2-4', 'Drop table safely', 'DROP TABLE IF EXISTS temp_data CASCADE; -- delete a table if it exists'),
    ]
  ),
];

// Stage 11: Indexes & Performance
const sqlStage11Lessons: Lesson[] = [
  lesson(
    'sql-idx-1',
    'Creating Indexes',
    'Speed up queries with indexes',
    'commands',
    'advanced',
    [
      task('sql-i1-1', 'Create an index', 'CREATE INDEX idx_users_email ON users (email); -- speed up lookups on a column'),
      task('sql-i1-2', 'Create unique index', 'CREATE UNIQUE INDEX idx_users_username ON users (username); -- enforce uniqueness with an index'),
      task('sql-i1-3', 'Composite index', 'CREATE INDEX idx_orders_user_date ON orders (user_id, created_at); -- index on multiple columns'),
      task('sql-i1-4', 'Drop an index', 'DROP INDEX IF EXISTS idx_users_email; -- remove an index'),
    ]
  ),
  lesson(
    'sql-idx-2',
    'EXPLAIN & Query Plans',
    'Analyze and optimize query performance',
    'commands',
    'advanced',
    [
      task('sql-i2-1', 'Explain a query', 'EXPLAIN SELECT * FROM users WHERE email = \'test@example.com\'; -- show the query execution plan'),
      task('sql-i2-2', 'Explain analyze', 'EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42; -- run and measure actual performance'),
      task('sql-i2-3', 'Partial index', 'CREATE INDEX idx_active_users ON users (email) WHERE active = true; -- index only matching rows'),
      task('sql-i2-4', 'Expression index', 'CREATE INDEX idx_lower_email ON users (LOWER(email)); -- index on a computed expression'),
    ]
  ),
];

// Stage 12: Window Functions
const sqlStage12Lessons: Lesson[] = [
  lesson(
    'sql-win-1',
    'ROW_NUMBER & RANK',
    'Assign row numbers and rankings',
    'commands',
    'advanced',
    [
      task('sql-wn1-1', 'ROW_NUMBER', 'SELECT name, salary, ROW_NUMBER() OVER (ORDER BY salary DESC) AS rank FROM employees; -- assign sequential numbers'),
      task('sql-wn1-2', 'RANK with ties', 'SELECT name, score, RANK() OVER (ORDER BY score DESC) AS rank FROM students; -- rank with gaps for ties'),
      task('sql-wn1-3', 'DENSE_RANK', 'SELECT name, score, DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank FROM students; -- rank without gaps'),
      task('sql-wn1-4', 'Partition by', 'SELECT dept, name, salary, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS dept_rank FROM employees; -- rank within groups'),
    ]
  ),
  lesson(
    'sql-win-2',
    'LAG, LEAD & Aggregates',
    'Access adjacent rows and running totals',
    'commands',
    'advanced',
    [
      task('sql-wn2-1', 'LAG function', 'SELECT date, revenue, LAG(revenue) OVER (ORDER BY date) AS prev_revenue FROM daily_sales; -- access the previous row'),
      task('sql-wn2-2', 'LEAD function', 'SELECT date, price, LEAD(price) OVER (ORDER BY date) AS next_price FROM stocks; -- access the next row'),
      task('sql-wn2-3', 'Running total', 'SELECT date, amount, SUM(amount) OVER (ORDER BY date) AS running_total FROM transactions; -- cumulative sum'),
      task('sql-wn2-4', 'Moving average', 'SELECT date, value, AVG(value) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg FROM metrics; -- 7-day rolling average'),
    ]
  ),
];

// Stage 13: CTEs & Transactions
const sqlStage13Lessons: Lesson[] = [
  lesson(
    'sql-cte-1',
    'Common Table Expressions',
    'Write readable queries with WITH clauses',
    'commands',
    'advanced',
    [
      task('sql-ct1-1', 'Basic CTE', 'WITH active_users AS (SELECT * FROM users WHERE active = true) SELECT * FROM active_users WHERE created_at > NOW() - INTERVAL \'30 days\'; -- named temporary result set'),
      task('sql-ct1-2', 'Multiple CTEs', 'WITH buyers AS (SELECT DISTINCT user_id FROM orders), active AS (SELECT id FROM users WHERE active = true) SELECT * FROM buyers JOIN active ON buyers.user_id = active.id; -- chain CTEs'),
      task('sql-ct1-3', 'Recursive CTE', 'WITH RECURSIVE tree AS (SELECT id, name, parent_id, 0 AS depth FROM categories WHERE parent_id IS NULL UNION ALL SELECT c.id, c.name, c.parent_id, t.depth + 1 FROM categories c JOIN tree t ON c.parent_id = t.id) SELECT * FROM tree; -- traverse hierarchies'),
      task('sql-ct1-4', 'CTE with aggregation', 'WITH monthly AS (SELECT DATE_TRUNC(\'month\', created_at) AS month, SUM(total) AS revenue FROM orders GROUP BY 1) SELECT month, revenue FROM monthly ORDER BY month; -- summarize by month'),
    ]
  ),
  lesson(
    'sql-cte-2',
    'Transactions & Locks',
    'Ensure data integrity with transactions',
    'commands',
    'advanced',
    [
      task('sql-ct2-1', 'Begin a transaction', 'BEGIN; UPDATE accounts SET balance = balance - 100 WHERE id = 1; UPDATE accounts SET balance = balance + 100 WHERE id = 2; COMMIT; -- atomic transfer'),
      task('sql-ct2-2', 'Rollback on error', 'BEGIN; DELETE FROM orders WHERE id = 99; ROLLBACK; -- undo all changes'),
      task('sql-ct2-3', 'Savepoints', 'BEGIN; SAVEPOINT sp1; UPDATE users SET name = \'test\'; ROLLBACK TO sp1; COMMIT; -- partial rollback'),
      task('sql-ct2-4', 'Select for update', 'SELECT * FROM inventory WHERE product_id = 1 FOR UPDATE; -- lock rows for update'),
    ]
  ),
];

// Stage 14: Views & Stored Procedures
const sqlStage14Lessons: Lesson[] = [
  lesson(
    'sql-view-1',
    'Views',
    'Create reusable virtual tables',
    'commands',
    'advanced',
    [
      task('sql-v1-1', 'Create a view', 'CREATE VIEW active_users AS SELECT id, name, email FROM users WHERE active = true; -- define a reusable virtual table'),
      task('sql-v1-2', 'Query a view', 'SELECT * FROM active_users WHERE name LIKE \'A%\'; -- query a view like a table'),
      task('sql-v1-3', 'Materialized view', 'CREATE MATERIALIZED VIEW monthly_revenue AS SELECT DATE_TRUNC(\'month\', created_at) AS month, SUM(total) AS revenue FROM orders GROUP BY 1; -- cached query result'),
      task('sql-v1-4', 'Refresh materialized view', 'REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_revenue; -- update cached data'),
    ]
  ),
  lesson(
    'sql-view-2',
    'Functions & Procedures',
    'Encapsulate logic in the database',
    'commands',
    'expert',
    [
      task('sql-v2-1', 'Create a function', 'CREATE FUNCTION get_user_count() RETURNS INTEGER AS $$ SELECT COUNT(*) FROM users; $$ LANGUAGE SQL; -- reusable logic'),
      task('sql-v2-2', 'Function with parameter', 'CREATE FUNCTION get_order_total(uid INTEGER) RETURNS DECIMAL AS $$ SELECT SUM(total) FROM orders WHERE user_id = uid; $$ LANGUAGE SQL; -- parameterized function'),
      task('sql-v2-3', 'Create a trigger', 'CREATE TRIGGER update_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at(); -- auto-run on changes'),
      task('sql-v2-4', 'Drop function safely', 'DROP FUNCTION IF EXISTS get_user_count(); -- remove a function if it exists'),
    ]
  ),
];

// Stage 15: SQL Mastery Test
const sqlMasteryTest: Lesson[] = [
  lesson(
    'sql-test-basic',
    'Fundamentals Test',
    'Test your core SQL knowledge',
    'commands',
    'intermediate',
    [
      task('sql-tb1', 'Select with filter and sort', "SELECT name, email FROM users WHERE active = true ORDER BY created_at DESC LIMIT 20; -- filter, sort, limit"),
      task('sql-tb2', 'Insert and update', "INSERT INTO users (name, email) VALUES ('Bob', 'bob@test.com'); UPDATE users SET active = true WHERE email = 'bob@test.com'; -- insert then update"),
      task('sql-tb3', 'Group and aggregate', "SELECT category, COUNT(*) AS cnt, AVG(price) AS avg_price FROM products GROUP BY category HAVING COUNT(*) > 3; -- group with filter"),
      task('sql-tb4', 'Inner join with filter', "SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id WHERE o.total > 100 ORDER BY o.total DESC; -- join and filter"),
      task('sql-tb5', 'Subquery in WHERE', "SELECT * FROM products WHERE price > (SELECT AVG(price) FROM products); -- above-average prices"),
    ]
  ),
  lesson(
    'sql-test-intermediate',
    'Intermediate Test',
    'Test joins, subqueries, and functions',
    'commands',
    'advanced',
    [
      task('sql-ti1', 'Left join with NULL check', 'SELECT u.name FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE o.id IS NULL; -- users without orders'),
      task('sql-ti2', 'CTE with aggregation', "WITH monthly AS (SELECT DATE_TRUNC('month', created_at) AS m, SUM(total) AS rev FROM orders GROUP BY 1) SELECT m, rev FROM monthly ORDER BY m; -- monthly revenue"),
      task('sql-ti3', 'Window function ranking', 'SELECT name, salary, RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank FROM employees; -- rank per department'),
      task('sql-ti4', 'CASE with aggregation', "SELECT COUNT(CASE WHEN status = 'active' THEN 1 END) AS active, COUNT(CASE WHEN status = 'inactive' THEN 1 END) AS inactive FROM users; -- pivot counts"),
      task('sql-ti5', 'Correlated subquery', 'SELECT p.title FROM products p WHERE p.price > (SELECT AVG(price) FROM products WHERE category = p.category); -- above category average'),
    ]
  ),
  lesson(
    'sql-test-advanced',
    'Advanced Test',
    'Test DDL, transactions, and optimization',
    'commands',
    'expert',
    [
      task('sql-ta1', 'Create table with constraints', 'CREATE TABLE reviews (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id), rating INTEGER CHECK (rating BETWEEN 1 AND 5), body TEXT, created_at TIMESTAMP DEFAULT NOW()); -- full DDL'),
      task('sql-ta2', 'Transaction with savepoint', "BEGIN; UPDATE inventory SET stock = stock - 1 WHERE product_id = 1; SAVEPOINT check_stock; SELECT stock FROM inventory WHERE product_id = 1; COMMIT; -- safe stock update"),
      task('sql-ta3', 'Recursive CTE', 'WITH RECURSIVE chain AS (SELECT id, name, manager_id FROM employees WHERE manager_id IS NULL UNION ALL SELECT e.id, e.name, e.manager_id FROM employees e JOIN chain c ON e.manager_id = c.id) SELECT * FROM chain; -- org chart'),
      task('sql-ta4', 'Create index and explain', "CREATE INDEX idx_orders_date ON orders (created_at); EXPLAIN ANALYZE SELECT * FROM orders WHERE created_at > '2024-01-01'; -- index then measure"),
      task('sql-ta5', 'Complex window function', 'SELECT date, revenue, SUM(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS weekly_total, LAG(revenue, 7) OVER (ORDER BY date) AS last_week FROM daily_sales; -- weekly comparison'),
    ]
  ),
  lesson(
    'sql-test-master',
    'SQL Mastery Final Test',
    'Comprehensive SQL challenge',
    'commands',
    'expert',
    [
      task('sql-tm1', 'Multi-join aggregation', 'SELECT c.name, COUNT(o.id) AS order_count, SUM(o.total) AS total_spent FROM customers c JOIN orders o ON c.id = o.customer_id JOIN order_items oi ON o.id = oi.order_id GROUP BY c.name HAVING SUM(o.total) > 1000 ORDER BY total_spent DESC; -- top customer report'),
      task('sql-tm2', 'Window + CTE combo', 'WITH ranked AS (SELECT name, department, salary, DENSE_RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank FROM employees) SELECT * FROM ranked WHERE rank <= 3; -- top 3 per department'),
      task('sql-tm3', 'Upsert pattern', "INSERT INTO user_stats (user_id, login_count) VALUES (1, 1) ON CONFLICT (user_id) DO UPDATE SET login_count = user_stats.login_count + 1; -- insert or increment"),
      task('sql-tm4', 'Materialized view with index', "CREATE MATERIALIZED VIEW top_products AS SELECT p.id, p.title, SUM(oi.quantity) AS total_sold FROM products p JOIN order_items oi ON p.id = oi.product_id GROUP BY p.id, p.title; CREATE INDEX idx_top_products_sold ON top_products (total_sold DESC); -- cached ranking"),
      task('sql-tm5', 'Full reporting query', "SELECT DATE_TRUNC('month', o.created_at) AS month, COUNT(DISTINCT o.user_id) AS unique_buyers, COUNT(o.id) AS total_orders, SUM(o.total) AS revenue, AVG(o.total) AS avg_order_value FROM orders o WHERE o.created_at >= NOW() - INTERVAL '12 months' GROUP BY 1 ORDER BY 1; -- monthly dashboard"),
    ]
  ),
];

// All SQL course lessons
export const sqlCourseLessons: Lesson[] = [
  ...sqlStage1Lessons,
  ...sqlStage2Lessons,
  ...sqlStage3Lessons,
  ...sqlStage4Lessons,
  ...sqlStage5Lessons,
  ...sqlStage6Lessons,
  ...sqlStage7Lessons,
  ...sqlStage8Lessons,
  ...sqlStage9Lessons,
  ...sqlStage10Lessons,
  ...sqlStage11Lessons,
  ...sqlStage12Lessons,
  ...sqlStage13Lessons,
  ...sqlStage14Lessons,
  ...sqlMasteryTest,
];

// Create the SQL course
export const sqlCourse: Course = {
  id: 'sql-mastery',
  name: 'SQL Mastery',
  description: 'Master SQL from basic queries to advanced window functions, CTEs, and database design',
  stages: [
    {
      id: 'sql-stage-1',
      name: 'Your First Queries',
      description: 'SELECT, WHERE, and filtering fundamentals',
      lessons: sqlStage1Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: false },
    },
    {
      id: 'sql-stage-2',
      name: 'Sorting & Limiting',
      description: 'ORDER BY, LIMIT, and combining conditions',
      lessons: sqlStage2Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'sql-stage-3',
      name: 'Data Manipulation',
      description: 'INSERT, UPDATE, DELETE, and TRUNCATE',
      lessons: sqlStage3Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'sql-stage-4',
      name: 'Aggregate Functions',
      description: 'COUNT, SUM, AVG, MIN, MAX, and GROUP BY',
      lessons: sqlStage4Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'sql-stage-5',
      name: 'INNER & LEFT JOINs',
      description: 'Combine data from multiple tables',
      lessons: sqlStage5Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'sql-stage-6',
      name: 'Advanced JOINs',
      description: 'FULL, CROSS, self-joins, and join patterns',
      lessons: sqlStage6Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'sql-stage-7',
      name: 'Subqueries',
      description: 'Nested queries, EXISTS, and correlated subqueries',
      lessons: sqlStage7Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'sql-stage-8',
      name: 'String & Date Functions',
      description: 'Text manipulation and date/time operations',
      lessons: sqlStage8Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'sql-stage-9',
      name: 'CASE & NULL Handling',
      description: 'Conditional logic, COALESCE, and type casting',
      lessons: sqlStage9Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'sql-stage-10',
      name: 'Table Design (DDL)',
      description: 'CREATE, ALTER, DROP tables with constraints',
      lessons: sqlStage10Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true, minWpm: 20 },
    },
    {
      id: 'sql-stage-11',
      name: 'Indexes & Performance',
      description: 'Create indexes and analyze query plans with EXPLAIN',
      lessons: sqlStage11Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'sql-stage-12',
      name: 'Window Functions',
      description: 'ROW_NUMBER, RANK, LAG, LEAD, and running totals',
      lessons: sqlStage12Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'sql-stage-13',
      name: 'CTEs & Transactions',
      description: 'Common Table Expressions, recursive CTEs, and transaction control',
      lessons: sqlStage13Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true },
    },
    {
      id: 'sql-stage-14',
      name: 'Views & Procedures',
      description: 'Views, materialized views, functions, and triggers',
      lessons: sqlStage14Lessons.map(l => l.id),
      unlockCriteria: { previousStageComplete: true, minWpm: 25 },
    },
    {
      id: 'sql-stage-test',
      name: 'SQL Mastery Test',
      description: 'Prove your SQL expertise',
      lessons: sqlMasteryTest.map(l => l.id),
      unlockCriteria: { previousStageComplete: true, minWpm: 30, minAccuracy: 0.90 },
    },
  ],
};

// All available courses
export const allCourses: Course[] = [tenFingerCourse, cliCourse, claudeCodeCourse, sqlCourse];
