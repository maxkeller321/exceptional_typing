// Supported languages for code syntax highlighting
export type CodeLanguage =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'rust'
  | 'go'
  | 'java'
  | 'c'
  | 'cpp'
  | 'csharp'
  | 'html'
  | 'css'
  | 'json'
  | 'sql'
  | 'bash'
  | 'markdown';

// Lesson and Task types - mirrors Rust backend
export interface Task {
  id: string;
  instruction: string;
  targetText: string;
  timeLimit?: number; // seconds
  minAccuracy: number; // 0.0 - 1.0
  language?: CodeLanguage; // for code lessons with syntax highlighting
}

export interface Lesson {
  id: string;
  name: string;
  description: string;
  category: LessonCategory;
  difficulty: Difficulty;
  tasks: Task[];
}

export type LessonCategory =
  | 'home_row'
  | 'top_row'
  | 'bottom_row'
  | 'numbers'
  | 'symbols'
  | 'words'
  | 'sentences'
  | 'code'
  | 'commands'
  | 'shortcuts'
  | 'custom';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Typing session state
export interface TypingState {
  currentIndex: number;
  typed: string;
  errors: ErrorInfo[];
  startTime: number | null;
  endTime: number | null;
  isComplete: boolean;
  isPaused: boolean;
}

export interface ErrorInfo {
  index: number;
  expected: string;
  typed: string;
  timestamp: number;
}

// Results and metrics
export interface TaskResult {
  taskId: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  trueAccuracy?: number; // accuracy including backspaces
  totalKeystrokes?: number; // all keypresses including corrections
  backspaceCount?: number; // number of backspaces used
  errors: ErrorInfo[];
  duration: number; // ms
  completedAt: number;
  passed: boolean;
}

export interface LessonProgress {
  lessonId: string;
  completedTasks: number;
  totalTasks: number;
  taskResults: TaskResult[];
  bestWpm: number;
  averageAccuracy: number;
}

export interface UserStats {
  totalPracticeTime: number; // ms
  totalWordsTyped: number;
  averageWpm: number;
  averageAccuracy: number;
  averageTrueAccuracy: number; // accuracy including backspaces
  totalKeystrokes: number; // all keypresses including corrections
  totalBackspaces: number; // total backspaces used
  totalCorrectKeystrokes: number; // keystrokes that advanced position
  lessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  problemKeys: Map<string, number>; // key -> error count
}

// App state
export type AppView = 'home' | 'lesson' | 'practice' | 'stats' | 'settings' | 'daily' | 'course';

export interface AppState {
  currentView: AppView;
  selectedLesson: Lesson | null;
  currentTaskIndex: number;
  userStats: UserStats;
}

// ============================================
// User Profile Types
// ============================================

export type AvatarType =
  | 'cat'
  | 'dog'
  | 'fox'
  | 'owl'
  | 'rabbit'
  | 'bear'
  | 'penguin'
  | 'koala'
  | 'robot'
  | 'alien';

export interface AvatarOption {
  id: AvatarType;
  emoji: string;
  label: string;
  color: string;
}

export interface UserProfile {
  id: number;
  name: string;
  avatar: AvatarType;
  createdAt: string;
  lastActiveAt: string | null;
}

// ============================================
// User Settings Types
// ============================================

export type TypingMode = 'coder' | 'normal';

export type KeyboardLayoutId =
  | 'qwerty-us'
  | 'qwerty-uk'
  | 'qwerty-de'
  | 'azerty-fr'
  | 'dvorak'
  | 'colemak';

export type Locale = 'en' | 'de';

export type AppTheme = 'dark-gold' | 'dark-blue' | 'light' | 'midnight';

export interface UserSettings {
  // Display
  showVirtualKeyboard: boolean;
  showHandGuides: boolean;
  showSyntaxHighlighting: boolean;
  showProgressPercentage: boolean;
  fontSize: number; // 16-40px

  // Mode
  typingMode: TypingMode;

  // Theme
  appTheme: AppTheme;

  // Code
  codeTheme: string; // CodeTheme from highlight.ts
  autoFormatCode: boolean;

  // Other
  soundEffectsEnabled: boolean;
  keyboardLayout: KeyboardLayoutId;
  locale: Locale;

  // Onboarding
  hasCompletedOnboarding: boolean;
}

// ============================================
// Custom Practice / Snippet Types
// ============================================

export type PracticeMode = 'text' | 'code';

export interface CustomSnippet {
  id: string;
  userId: number;
  name: string;
  content: string;
  language: CodeLanguage | null;
  mode: PracticeMode;
  createdAt: string;
  practiceCount: number;
  bestWpm: number | null;
  bestAccuracy: number | null;
}

// ============================================
// Daily Test Types
// ============================================

export interface DailyTestResult {
  userId: number;
  date: string; // YYYY-MM-DD
  wpm: number;
  accuracy: number;
  trueAccuracy: number;
  duration: number;
  completedAt: number;
}

// ============================================
// Course Types
// ============================================

export interface CourseStage {
  id: string;
  name: string;
  description: string;
  lessons: string[]; // lesson IDs
  unlockCriteria: {
    previousStageComplete: boolean;
    minWpm?: number;
    minAccuracy?: number;
  };
}

export interface Course {
  id: string;
  name: string;
  description: string;
  stages: CourseStage[];
}

export interface CourseProgress {
  courseId: string;
  currentStageId: string | null;
  completedStages: string[];
  skippedStages: string[]; // Stages that were skipped/jumped over
  enrolledAt: string;
  completedAt: string | null;
}

// Analytics types for detailed performance analysis
export interface KeystrokeEvent {
  char: string;
  timestamp: number;
  index: number;
  isCorrect: boolean;
}

export interface WordAnalysis {
  word: string;
  count: number;
  avgTime: number; // ms per word
  wpm: number;
  errors: number;
  accuracy: number;
}

export interface BigramAnalysis {
  bigram: string; // e.g., "th", "he"
  chars: [string, string];
  count: number;
  avgTime: number; // ms between the two keystrokes
  errors: number;
}

export interface TrigramAnalysis {
  trigram: string; // e.g., "the", "ing"
  chars: [string, string, string];
  count: number;
  avgTime: number; // ms for all three keystrokes
  errors: number;
}

export interface TypingAnalytics {
  keystrokes: KeystrokeEvent[];
  words: WordAnalysis[];
  bigrams: BigramAnalysis[];
  trigrams: TrigramAnalysis[];
  fingers: FingerAnalysis[];
  hands: HandAnalysis;
  characters: CharacterAnalysis[];
  characterTypes: CharacterTypeAnalysis[];
  totalTime: number;
  totalChars: number;
}

// Finger names: 1-5 left hand (pinky to thumb), 6-10 right hand (thumb to pinky)
export type FingerName = 'leftPinky' | 'leftRing' | 'leftMiddle' | 'leftIndex' | 'leftThumb'
  | 'rightThumb' | 'rightIndex' | 'rightMiddle' | 'rightRing' | 'rightPinky';

export interface FingerAnalysis {
  finger: FingerName;
  fingerNum: number;
  hand: 'left' | 'right';
  count: number;
  avgDelay: number; // ms
  wpm: number;
  errors: number;
  accuracy: number;
}

export interface HandAnalysis {
  left: {
    count: number;
    wpm: number;
    accuracy: number;
  };
  right: {
    count: number;
    wpm: number;
    accuracy: number;
  };
}

export interface CharacterAnalysis {
  char: string;
  count: number;
  avgDelay: number; // ms
  wpm: number;
  errors: number;
  mistypes: string[]; // what was typed instead
}

export type CharacterType = 'lowercase' | 'uppercase' | 'numbers' | 'punctuation' | 'whitespace';

export interface CharacterTypeAnalysis {
  type: CharacterType;
  label: string;
  count: number;
  avgDelay: number;
  wpm: number;
  chars: string[];
}

// ============================================
// IDE Shortcuts / Keyboard Efficiency Types
// ============================================

export type ShortcutCategory =
  | 'navigation'
  | 'editing'
  | 'selection'
  | 'search'
  | 'code_actions'
  | 'terminal'
  | 'file_management'
  | 'debugging'
  | 'view'
  | 'refactoring';

export type IDEType = 'vscode' | 'jetbrains' | 'vim' | 'emacs' | 'sublime' | 'universal';

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  category: ShortcutCategory;
  keys: {
    windows: string;
    mac: string;
  };
  ide: IDEType[];
  difficulty: Difficulty;
}

export interface ShortcutPreset {
  id: string;
  name: string;
  ide: IDEType;
  platform: 'windows' | 'mac';
}
