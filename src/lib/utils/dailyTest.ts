import type { DailyTestResult } from '../types';

// Collection of standardized paragraphs for daily tests
// These are designed to be challenging but fair, with common English words
const dailyTexts: string[] = [
  "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is often used to test keyboards and fonts. Typography enthusiasts have used this pangram for over a century to display font samples.",

  "Programming requires patience and attention to detail. Every line of code should be written with purpose and clarity. Good developers understand that readable code is more valuable than clever code that no one else can understand.",

  "The art of typing quickly comes from consistent practice and proper finger placement. Touch typing allows you to focus on your thoughts rather than looking at the keyboard. With dedication, anyone can improve their typing speed significantly.",

  "Technology continues to advance at an unprecedented rate. What seemed like science fiction just decades ago is now commonplace in our daily lives. From smartphones to artificial intelligence, innovation shapes our world in remarkable ways.",

  "Writing clean code is like writing a good story. It should have a clear beginning, middle, and end. Each function should do one thing well, and variable names should describe their purpose without needing additional comments.",

  "The best way to learn is through practice and repetition. Making mistakes is part of the learning process. Every error is an opportunity to understand something better and improve your skills for the future.",

  "Effective communication is essential in software development. Teams that communicate well can solve problems faster and build better products. Clear documentation helps others understand your code and your intentions.",

  "Debugging is twice as hard as writing code in the first place. Therefore, if you write code as cleverly as possible, you are by definition not smart enough to debug it. Keep your solutions simple and straightforward.",

  "The keyboard is an extension of your thoughts when you type fluently. Muscle memory allows your fingers to find the right keys automatically. This frees your mind to focus on creativity and problem-solving.",

  "Software engineering is about making trade-offs and finding the right balance. Performance versus readability, flexibility versus simplicity. The best engineers know when each approach is appropriate.",

  "Practice makes progress, not perfection. The goal is continuous improvement, not flawless execution. Every typing session builds upon the last, gradually increasing your speed and accuracy over time.",

  "Version control systems like Git have revolutionized software development. They allow teams to collaborate effectively and track changes throughout a project's history. Learning Git is essential for modern developers.",

  "The command line interface offers powerful tools for developers. While graphical interfaces are user-friendly, the terminal provides speed and flexibility that cannot be matched by clicking buttons.",

  "Reading code written by others is a valuable skill to develop. You can learn new techniques and patterns by studying how experienced developers solve problems. Open source projects are excellent resources for learning.",

  "Testing your code is just as important as writing it. Automated tests catch bugs before they reach production and give you confidence when making changes. A good test suite is a project's safety net.",

  "Data structures and algorithms form the foundation of computer science. Understanding how to choose the right data structure for a problem can dramatically improve your program's efficiency and performance.",

  "The internet has connected people across the globe in ways previously unimaginable. Information flows freely, enabling collaboration and communication that transcends geographical boundaries.",

  "Learning to type without looking at the keyboard opens up a world of productivity. Your eyes can stay focused on the screen while your fingers dance across the keys with practiced precision.",

  "Good software is never truly finished. It evolves over time to meet new requirements and fix discovered issues. Maintaining code requires the same care and attention as writing it initially.",

  "The semicolon is both a powerful punctuation mark and a common source of bugs. In many programming languages, forgetting this small character can cause hours of debugging frustration.",

  "Functional programming emphasizes immutability and pure functions. These concepts lead to code that is easier to test and reason about. Many modern languages incorporate functional programming features.",

  "Documentation is a gift to your future self and others who will work with your code. Taking the time to explain complex logic or unusual decisions pays dividends when revisiting the code later.",

  "Keyboard shortcuts can dramatically increase your productivity. Learning the shortcuts for your most common actions saves time and keeps you in a state of flow while working.",

  "The difference between good and great developers often comes down to attention to edge cases. Considering what could go wrong and handling those scenarios gracefully sets professional code apart.",

  "Refactoring is the process of improving code without changing its behavior. Regular refactoring keeps codebases healthy and prevents the accumulation of technical debt over time.",

  "Mobile devices have changed how we interact with technology. Responsive design ensures that websites and applications work well across all screen sizes, from phones to desktop monitors.",

  "Cloud computing has transformed how applications are deployed and scaled. Services can now handle millions of users without physical servers needing to be managed directly.",

  "Security should be considered from the start of every project. Vulnerabilities are much harder and more expensive to fix after a system is built than when designing it initially.",

  "The open source community has created incredible software that powers much of the modern internet. Contributing to open source is a great way to learn and give back to the community.",

  "Pair programming involves two developers working together at one computer. This technique leads to better code quality and helps spread knowledge throughout a team.",
];

// Get a deterministic text based on date
export function getDailyText(date: Date = new Date()): string {
  // Create a hash from the date (year, month, day)
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Simple hash combining date components
  const hash = (year * 10000 + month * 100 + day) % dailyTexts.length;

  return dailyTexts[hash];
}

// Get date string in YYYY-MM-DD format
export function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

// Check if user has completed today's test
export function hasCompletedToday(results: DailyTestResult[], userId: number): boolean {
  const today = getDateString();
  return results.some(r => r.userId === userId && r.date === today);
}

// Get today's result if exists
export function getTodayResult(results: DailyTestResult[], userId: number): DailyTestResult | null {
  const today = getDateString();
  return results.find(r => r.userId === userId && r.date === today) || null;
}

// Get user's best daily test result
export function getBestResult(results: DailyTestResult[], userId: number): DailyTestResult | null {
  const userResults = results.filter(r => r.userId === userId);
  if (userResults.length === 0) return null;

  return userResults.reduce((best, current) => {
    if (current.wpm > best.wpm) return current;
    if (current.wpm === best.wpm && current.accuracy > best.accuracy) return current;
    return best;
  });
}

// Get user's streak (consecutive days with completed tests)
export function getStreak(results: DailyTestResult[], userId: number): number {
  const userResults = results
    .filter(r => r.userId === userId)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (userResults.length === 0) return 0;

  const today = getDateString();
  const yesterday = getDateString(new Date(Date.now() - 86400000));

  // Check if latest result is today or yesterday
  const latestDate = userResults[0].date;
  if (latestDate !== today && latestDate !== yesterday) return 0;

  let streak = 1;
  let currentDate = new Date(latestDate);

  for (let i = 1; i < userResults.length; i++) {
    const prevDate = new Date(currentDate.getTime() - 86400000);
    const prevDateStr = getDateString(prevDate);

    if (userResults[i].date === prevDateStr) {
      streak++;
      currentDate = prevDate;
    } else {
      break;
    }
  }

  return streak;
}

// Get results for the last N days
export function getRecentResults(
  results: DailyTestResult[],
  userId: number,
  days: number = 30
): DailyTestResult[] {
  const cutoffDate = new Date(Date.now() - days * 86400000);
  const cutoffStr = getDateString(cutoffDate);

  return results
    .filter(r => r.userId === userId && r.date >= cutoffStr)
    .sort((a, b) => a.date.localeCompare(b.date));
}
