import { describe, it, expect } from 'vitest';
import { splitIntoWordUnits, getWordUnitForIndex, type WordUnit } from './wordWrapper';

describe('Word Wrapper Utility', () => {
  describe('splitIntoWordUnits', () => {
    it('splits simple sentence into words and spaces', () => {
      const text = 'hello world';
      const units = splitIntoWordUnits(text);

      expect(units).toHaveLength(3);
      expect(units[0]).toEqual({ text: 'hello', startIndex: 0, isSpace: false, isNewline: false });
      expect(units[1]).toEqual({ text: ' ', startIndex: 5, isSpace: true, isNewline: false });
      expect(units[2]).toEqual({ text: 'world', startIndex: 6, isSpace: false, isNewline: false });
    });

    it('handles multiple spaces between words', () => {
      const text = 'hello  world';
      const units = splitIntoWordUnits(text);

      expect(units).toHaveLength(4);
      expect(units[0]).toEqual({ text: 'hello', startIndex: 0, isSpace: false, isNewline: false });
      expect(units[1]).toEqual({ text: ' ', startIndex: 5, isSpace: true, isNewline: false });
      expect(units[2]).toEqual({ text: ' ', startIndex: 6, isSpace: true, isNewline: false });
      expect(units[3]).toEqual({ text: 'world', startIndex: 7, isSpace: false, isNewline: false });
    });

    it('handles newlines as separate units', () => {
      const text = 'hello\nworld';
      const units = splitIntoWordUnits(text);

      expect(units).toHaveLength(3);
      expect(units[0]).toEqual({ text: 'hello', startIndex: 0, isSpace: false, isNewline: false });
      expect(units[1]).toEqual({ text: '\n', startIndex: 5, isSpace: false, isNewline: true });
      expect(units[2]).toEqual({ text: 'world', startIndex: 6, isSpace: false, isNewline: false });
    });

    it('handles tabs as space units', () => {
      const text = 'hello\tworld';
      const units = splitIntoWordUnits(text);

      expect(units).toHaveLength(3);
      expect(units[0]).toEqual({ text: 'hello', startIndex: 0, isSpace: false, isNewline: false });
      expect(units[1]).toEqual({ text: '\t', startIndex: 5, isSpace: true, isNewline: false });
      expect(units[2]).toEqual({ text: 'world', startIndex: 6, isSpace: false, isNewline: false });
    });

    it('keeps punctuation attached to words', () => {
      const text = 'hello, world!';
      const units = splitIntoWordUnits(text);

      expect(units).toHaveLength(3);
      expect(units[0]).toEqual({ text: 'hello,', startIndex: 0, isSpace: false, isNewline: false });
      expect(units[1]).toEqual({ text: ' ', startIndex: 6, isSpace: true, isNewline: false });
      expect(units[2]).toEqual({ text: 'world!', startIndex: 7, isSpace: false, isNewline: false });
    });

    it('handles code with special characters as single words', () => {
      const text = 'const foo = bar;';
      const units = splitIntoWordUnits(text);

      expect(units).toHaveLength(7);
      expect(units[0]).toEqual({ text: 'const', startIndex: 0, isSpace: false, isNewline: false });
      expect(units[1]).toEqual({ text: ' ', startIndex: 5, isSpace: true, isNewline: false });
      expect(units[2]).toEqual({ text: 'foo', startIndex: 6, isSpace: false, isNewline: false });
      expect(units[3]).toEqual({ text: ' ', startIndex: 9, isSpace: true, isNewline: false });
      expect(units[4]).toEqual({ text: '=', startIndex: 10, isSpace: false, isNewline: false });
      expect(units[5]).toEqual({ text: ' ', startIndex: 11, isSpace: true, isNewline: false });
      expect(units[6]).toEqual({ text: 'bar;', startIndex: 12, isSpace: false, isNewline: false });
    });

    it('handles empty string', () => {
      const units = splitIntoWordUnits('');
      expect(units).toHaveLength(0);
    });

    it('handles string with only spaces', () => {
      const text = '   ';
      const units = splitIntoWordUnits(text);

      expect(units).toHaveLength(3);
      units.forEach((unit, i) => {
        expect(unit).toEqual({ text: ' ', startIndex: i, isSpace: true, isNewline: false });
      });
    });

    it('handles string with only newlines', () => {
      const text = '\n\n';
      const units = splitIntoWordUnits(text);

      expect(units).toHaveLength(2);
      expect(units[0]).toEqual({ text: '\n', startIndex: 0, isSpace: false, isNewline: true });
      expect(units[1]).toEqual({ text: '\n', startIndex: 1, isSpace: false, isNewline: true });
    });

    it('handles leading spaces', () => {
      const text = '  hello';
      const units = splitIntoWordUnits(text);

      expect(units).toHaveLength(3);
      expect(units[0]).toEqual({ text: ' ', startIndex: 0, isSpace: true, isNewline: false });
      expect(units[1]).toEqual({ text: ' ', startIndex: 1, isSpace: true, isNewline: false });
      expect(units[2]).toEqual({ text: 'hello', startIndex: 2, isSpace: false, isNewline: false });
    });

    it('handles trailing spaces', () => {
      const text = 'hello  ';
      const units = splitIntoWordUnits(text);

      expect(units).toHaveLength(3);
      expect(units[0]).toEqual({ text: 'hello', startIndex: 0, isSpace: false, isNewline: false });
      expect(units[1]).toEqual({ text: ' ', startIndex: 5, isSpace: true, isNewline: false });
      expect(units[2]).toEqual({ text: ' ', startIndex: 6, isSpace: true, isNewline: false });
    });

    it('handles complex code with mixed whitespace', () => {
      const text = 'function foo() {\n  return bar;\n}';
      const units = splitIntoWordUnits(text);

      // Verify structure: function, space, foo(), space, {, newline, space, space, return, space, bar;, newline, }
      expect(units.map(u => u.text)).toEqual([
        'function', ' ', 'foo()', ' ', '{', '\n', ' ', ' ', 'return', ' ', 'bar;', '\n', '}'
      ]);
    });

    it('preserves exact character indices for reconstruction', () => {
      const text = 'hello world test';
      const units = splitIntoWordUnits(text);

      // Reconstruct the text from units
      let reconstructed = '';
      for (const unit of units) {
        reconstructed += unit.text;
      }

      expect(reconstructed).toBe(text);
    });

    it('character indices are consecutive without gaps', () => {
      const text = 'The quick brown fox';
      const units = splitIntoWordUnits(text);

      let expectedIndex = 0;
      for (const unit of units) {
        expect(unit.startIndex).toBe(expectedIndex);
        expectedIndex += unit.text.length;
      }
      expect(expectedIndex).toBe(text.length);
    });
  });

  describe('getWordUnitForIndex', () => {
    it('finds the correct unit for an index within a word', () => {
      const text = 'hello world';
      const units = splitIntoWordUnits(text);

      // Index 2 is in "hello" (h-e-L-l-o)
      const result = getWordUnitForIndex(units, 2);
      expect(result).not.toBeNull();
      expect(result!.unit.text).toBe('hello');
      expect(result!.offsetInUnit).toBe(2);
    });

    it('finds the correct unit for an index at a space', () => {
      const text = 'hello world';
      const units = splitIntoWordUnits(text);

      // Index 5 is the space
      const result = getWordUnitForIndex(units, 5);
      expect(result).not.toBeNull();
      expect(result!.unit.text).toBe(' ');
      expect(result!.unit.isSpace).toBe(true);
      expect(result!.offsetInUnit).toBe(0);
    });

    it('finds the correct unit for an index in the second word', () => {
      const text = 'hello world';
      const units = splitIntoWordUnits(text);

      // Index 8 is in "world" (w-o-R-l-d)
      const result = getWordUnitForIndex(units, 8);
      expect(result).not.toBeNull();
      expect(result!.unit.text).toBe('world');
      expect(result!.offsetInUnit).toBe(2); // 8 - 6 = 2
    });

    it('returns null for index out of bounds', () => {
      const text = 'hello';
      const units = splitIntoWordUnits(text);

      const result = getWordUnitForIndex(units, 10);
      expect(result).toBeNull();
    });

    it('returns null for negative index', () => {
      const text = 'hello';
      const units = splitIntoWordUnits(text);

      const result = getWordUnitForIndex(units, -1);
      expect(result).toBeNull();
    });

    it('handles first character correctly', () => {
      const text = 'hello';
      const units = splitIntoWordUnits(text);

      const result = getWordUnitForIndex(units, 0);
      expect(result).not.toBeNull();
      expect(result!.unit.text).toBe('hello');
      expect(result!.offsetInUnit).toBe(0);
    });

    it('handles last character correctly', () => {
      const text = 'hello';
      const units = splitIntoWordUnits(text);

      const result = getWordUnitForIndex(units, 4); // Last char 'o'
      expect(result).not.toBeNull();
      expect(result!.unit.text).toBe('hello');
      expect(result!.offsetInUnit).toBe(4);
    });
  });

  describe('Word wrapping behavior requirements', () => {
    /**
     * These tests document the expected behavior for word wrapping:
     * - Words should NOT break in the middle when wrapping
     * - Words should move entirely to the next line if they don't fit
     * - Only spaces/whitespace should be breakpoints
     */

    it('word units do not contain internal breakpoints', () => {
      const text = 'superlongword';
      const units = splitIntoWordUnits(text);

      expect(units).toHaveLength(1);
      expect(units[0].isSpace).toBe(false);
      expect(units[0].isNewline).toBe(false);
      // This single unit should be rendered with nowrap to prevent mid-word breaks
    });

    it('spaces are valid breakpoints between words', () => {
      const text = 'word1 word2 word3';
      const units = splitIntoWordUnits(text);

      // Spaces should be separate units that can act as breakpoints
      const spaceUnits = units.filter(u => u.isSpace);
      expect(spaceUnits).toHaveLength(2);
    });

    it('newlines force line breaks', () => {
      const text = 'line1\nline2';
      const units = splitIntoWordUnits(text);

      const newlineUnits = units.filter(u => u.isNewline);
      expect(newlineUnits).toHaveLength(1);
      // Newline units should be rendered in a way that forces a line break
    });

    it('handles end-of-line word scenario', () => {
      // Scenario: "The quick brown fox" where "fox" might not fit on the line
      // Expected: "fox" moves entirely to the next line, not broken as "fo-" + "x"
      const text = 'The quick brown fox';
      const units = splitIntoWordUnits(text);

      // "fox" should be a single unit
      const foxUnit = units.find(u => u.text === 'fox');
      expect(foxUnit).toBeDefined();
      expect(foxUnit!.isSpace).toBe(false);

      // Each word should be a single non-breaking unit
      const words = units.filter(u => !u.isSpace && !u.isNewline);
      expect(words.map(w => w.text)).toEqual(['The', 'quick', 'brown', 'fox']);
    });
  });
});
