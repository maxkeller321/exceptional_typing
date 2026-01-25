import { describe, it, expect } from 'vitest';
import { commandLessons } from './commandLessons';

describe('Command Lessons', () => {
  describe('structure', () => {
    it('should have lessons defined', () => {
      expect(commandLessons).toBeDefined();
      expect(commandLessons.length).toBeGreaterThan(0);
    });

    it('all lessons should have required properties', () => {
      commandLessons.forEach((lesson) => {
        expect(lesson.id).toBeDefined();
        expect(lesson.name).toBeDefined();
        expect(lesson.description).toBeDefined();
        expect(lesson.category).toBe('commands');
        expect(lesson.tasks.length).toBeGreaterThan(0);
      });
    });

    it('all tasks should have required properties', () => {
      commandLessons.forEach((lesson) => {
        lesson.tasks.forEach((task) => {
          expect(task.id).toBeDefined();
          expect(task.instruction).toBeDefined();
          expect(task.targetText).toBeDefined();
          expect(task.minAccuracy).toBeDefined();
          expect(task.minAccuracy).toBeGreaterThan(0);
          expect(task.minAccuracy).toBeLessThanOrEqual(1);
        });
      });
    });
  });

  describe('no syntax highlighting for commands', () => {
    it('command lessons should NOT have language property (commands are not code)', () => {
      commandLessons.forEach((lesson) => {
        lesson.tasks.forEach((task) => {
          expect(task.language).toBeUndefined();
        });
      });
    });

    it('verifies this applies to all command lesson tasks', () => {
      const totalTasks = commandLessons.reduce((sum, lesson) => sum + lesson.tasks.length, 0);
      expect(totalTasks).toBeGreaterThan(0);

      // Count tasks without language property
      const tasksWithoutLanguage = commandLessons.reduce((sum, lesson) => {
        return sum + lesson.tasks.filter((task) => task.language === undefined).length;
      }, 0);

      expect(tasksWithoutLanguage).toBe(totalTasks);
    });
  });

  describe('lesson content', () => {
    it('all tasks should contain command descriptions (not just code)', () => {
      commandLessons.forEach((lesson) => {
        lesson.tasks.forEach((task) => {
          // Command lessons should have descriptive text, not just code
          // They typically follow pattern: "command - Description..."
          expect(task.targetText.length).toBeGreaterThan(10);
        });
      });
    });

    it('lessons should be categorized by difficulty', () => {
      const difficulties = new Set(commandLessons.map((l) => l.difficulty));
      expect(difficulties.size).toBeGreaterThan(0);
      // Should have valid difficulty levels
      difficulties.forEach((diff) => {
        expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(diff);
      });
    });
  });
});
