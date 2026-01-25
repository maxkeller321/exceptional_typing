import { describe, it, expect } from 'vitest';
import {
  fingerColors,
  fingerMap,
  darkenColor,
  getFingerForKey,
  getFingerHighlightStyle,
  needsShift,
  getFingerLegendColor,
} from './keyboardHelpers';

describe('Keyboard Helpers', () => {
  describe('fingerColors', () => {
    it('has correct color for left pinky (finger 1)', () => {
      expect(fingerColors[1]).toBe('#f43f5e'); // rose
    });

    it('has correct color for left ring (finger 2)', () => {
      expect(fingerColors[2]).toBe('#f97316'); // orange
    });

    it('has correct color for left middle (finger 3)', () => {
      expect(fingerColors[3]).toBe('#eab308'); // yellow
    });

    it('has correct color for left index (finger 4)', () => {
      expect(fingerColors[4]).toBe('#22c55e'); // green
    });

    it('has correct color for left thumb (finger 5)', () => {
      expect(fingerColors[5]).toBe('#3b82f6'); // blue
    });

    it('has correct color for right thumb (finger 6)', () => {
      expect(fingerColors[6]).toBe('#3b82f6'); // blue
    });

    it('has correct color for right index (finger 7)', () => {
      expect(fingerColors[7]).toBe('#22c55e'); // green
    });

    it('has correct color for right middle (finger 8)', () => {
      expect(fingerColors[8]).toBe('#eab308'); // yellow
    });

    it('has correct color for right ring (finger 9)', () => {
      expect(fingerColors[9]).toBe('#f97316'); // orange
    });

    it('has correct color for right pinky (finger 10)', () => {
      expect(fingerColors[10]).toBe('#f43f5e'); // rose
    });

    it('has symmetric colors for left and right hands', () => {
      // Pinky
      expect(fingerColors[1]).toBe(fingerColors[10]);
      // Ring
      expect(fingerColors[2]).toBe(fingerColors[9]);
      // Middle
      expect(fingerColors[3]).toBe(fingerColors[8]);
      // Index
      expect(fingerColors[4]).toBe(fingerColors[7]);
      // Thumb
      expect(fingerColors[5]).toBe(fingerColors[6]);
    });
  });

  describe('fingerMap', () => {
    it('maps home row keys correctly', () => {
      expect(fingerMap['a']).toBe(1); // left pinky
      expect(fingerMap['s']).toBe(2); // left ring
      expect(fingerMap['d']).toBe(3); // left middle
      expect(fingerMap['f']).toBe(4); // left index
      expect(fingerMap['j']).toBe(7); // right index
      expect(fingerMap['k']).toBe(8); // right middle
      expect(fingerMap['l']).toBe(9); // right ring
      expect(fingerMap[';']).toBe(10); // right pinky
    });

    it('maps uppercase letters to same finger as lowercase', () => {
      expect(fingerMap['A']).toBe(fingerMap['a']);
      expect(fingerMap['F']).toBe(fingerMap['f']);
      expect(fingerMap['J']).toBe(fingerMap['j']);
    });

    it('maps space bar to right thumb', () => {
      expect(fingerMap[' ']).toBe(6);
    });

    it('maps shift characters to correct fingers', () => {
      expect(fingerMap['!']).toBe(1); // same as '1'
      expect(fingerMap['@']).toBe(2); // same as '2'
      expect(fingerMap['#']).toBe(3); // same as '3'
    });
  });

  describe('darkenColor', () => {
    it('darkens a color by the default factor', () => {
      const result = darkenColor('#ffffff');
      // 255 * 0.7 = 178.5, rounded to 179 = 0xb3
      expect(result).toBe('#b3b3b3');
    });

    it('darkens a color by a custom factor', () => {
      const result = darkenColor('#ffffff', 0.5);
      // 255 * 0.5 = 127.5, rounded to 128 = 0x80
      expect(result).toBe('#808080');
    });

    it('handles blue color correctly', () => {
      const result = darkenColor('#3b82f6');
      // r: 59 * 0.7 = 41 = 0x29
      // g: 130 * 0.7 = 91 = 0x5b
      // b: 246 * 0.7 = 172 = 0xac
      expect(result).toBe('#295bac');
    });

    it('handles red color correctly', () => {
      const result = darkenColor('#f43f5e');
      // r: 244 * 0.7 = 171 = 0xab
      // g: 63 * 0.7 = 44 = 0x2c
      // b: 94 * 0.7 = 66 = 0x42
      expect(result).toBe('#ab2c42');
    });
  });

  describe('getFingerForKey', () => {
    it('returns correct finger for lowercase letters', () => {
      expect(getFingerForKey('a')).toBe(1);
      expect(getFingerForKey('f')).toBe(4);
      expect(getFingerForKey('j')).toBe(7);
    });

    it('returns correct finger for uppercase letters', () => {
      expect(getFingerForKey('A')).toBe(1);
      expect(getFingerForKey('F')).toBe(4);
      expect(getFingerForKey('J')).toBe(7);
    });

    it('returns correct finger for numbers', () => {
      expect(getFingerForKey('1')).toBe(1);
      expect(getFingerForKey('5')).toBe(4);
      expect(getFingerForKey('8')).toBe(8);
    });

    it('returns correct finger for special characters', () => {
      expect(getFingerForKey(';')).toBe(10);
      expect(getFingerForKey(',')).toBe(8);
      expect(getFingerForKey(' ')).toBe(6);
    });

    it('returns null for unmapped keys', () => {
      expect(getFingerForKey('Backspace')).toBeNull();
      expect(getFingerForKey('Enter')).toBeNull();
    });
  });

  describe('getFingerHighlightStyle', () => {
    it('returns empty string when finger does not match current key', () => {
      expect(getFingerHighlightStyle(1, 'j')).toBe(''); // j is finger 7
      expect(getFingerHighlightStyle(4, 'k')).toBe(''); // k is finger 8
    });

    it('returns correct style for left pinky (a key)', () => {
      const style = getFingerHighlightStyle(1, 'a');
      expect(style).toContain('fill: #f43f5e'); // rose color
      expect(style).toContain('stroke:');
      expect(style).toContain('filter: drop-shadow');
    });

    it('returns correct style for left ring (s key)', () => {
      const style = getFingerHighlightStyle(2, 's');
      expect(style).toContain('fill: #f97316'); // orange color
    });

    it('returns correct style for left middle (d key)', () => {
      const style = getFingerHighlightStyle(3, 'd');
      expect(style).toContain('fill: #eab308'); // yellow color
    });

    it('returns correct style for left index (f key)', () => {
      const style = getFingerHighlightStyle(4, 'f');
      expect(style).toContain('fill: #22c55e'); // green color
    });

    it('returns correct style for right thumb (space)', () => {
      const style = getFingerHighlightStyle(6, ' ');
      expect(style).toContain('fill: #3b82f6'); // blue color
    });

    it('returns correct style for right index (j key)', () => {
      const style = getFingerHighlightStyle(7, 'j');
      expect(style).toContain('fill: #22c55e'); // green color
    });

    it('returns correct style for right middle (k key)', () => {
      const style = getFingerHighlightStyle(8, 'k');
      expect(style).toContain('fill: #eab308'); // yellow color
    });

    it('returns correct style for right ring (l key)', () => {
      const style = getFingerHighlightStyle(9, 'l');
      expect(style).toContain('fill: #f97316'); // orange color
    });

    it('returns correct style for right pinky (; key)', () => {
      const style = getFingerHighlightStyle(10, ';');
      expect(style).toContain('fill: #f43f5e'); // rose color
    });

    it('handles uppercase letters correctly', () => {
      const style = getFingerHighlightStyle(1, 'A');
      expect(style).toContain('fill: #f43f5e'); // same as lowercase
    });

    it('returns empty string for unmapped keys', () => {
      expect(getFingerHighlightStyle(1, 'Backspace')).toBe('');
    });
  });

  describe('needsShift', () => {
    it('returns false for lowercase letters', () => {
      expect(needsShift('a')).toBe(false);
      expect(needsShift('z')).toBe(false);
    });

    it('returns true for uppercase letters', () => {
      expect(needsShift('A')).toBe(true);
      expect(needsShift('Z')).toBe(true);
    });

    it('returns true for shift characters', () => {
      expect(needsShift('!')).toBe(true);
      expect(needsShift('@')).toBe(true);
      expect(needsShift('#')).toBe(true);
      expect(needsShift('~')).toBe(true);
      expect(needsShift('{')).toBe(true);
      expect(needsShift('}')).toBe(true);
    });

    it('returns false for numbers', () => {
      expect(needsShift('1')).toBe(false);
      expect(needsShift('9')).toBe(false);
    });

    it('returns false for non-shift punctuation', () => {
      expect(needsShift(';')).toBe(false);
      expect(needsShift(',')).toBe(false);
      expect(needsShift('.')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(needsShift('')).toBe(false);
    });
  });

  describe('getFingerLegendColor', () => {
    it('returns correct color for pinky', () => {
      expect(getFingerLegendColor('pinky')).toBe('#f43f5e');
    });

    it('returns correct color for ring', () => {
      expect(getFingerLegendColor('ring')).toBe('#f97316');
    });

    it('returns correct color for middle', () => {
      expect(getFingerLegendColor('middle')).toBe('#eab308');
    });

    it('returns correct color for index', () => {
      expect(getFingerLegendColor('index')).toBe('#22c55e');
    });

    it('returns correct color for thumb', () => {
      expect(getFingerLegendColor('thumb')).toBe('#3b82f6');
    });

    it('legend colors match the fingerColors mapping', () => {
      // Verify legend colors match the actual finger colors
      expect(getFingerLegendColor('pinky')).toBe(fingerColors[1]);
      expect(getFingerLegendColor('ring')).toBe(fingerColors[2]);
      expect(getFingerLegendColor('middle')).toBe(fingerColors[3]);
      expect(getFingerLegendColor('index')).toBe(fingerColors[4]);
      expect(getFingerLegendColor('thumb')).toBe(fingerColors[5]);
    });
  });
});
