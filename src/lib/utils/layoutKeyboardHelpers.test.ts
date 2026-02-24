import { describe, it, expect } from 'vitest';
import {
  buildFingerMap,
  buildShiftChars,
  needsShiftForLayout,
  buildKeyboardRows,
  getCachedFingerMap,
  getCachedShiftChars,
} from './layoutKeyboardHelpers';
import type { ConcreteKeyboardLayoutId } from '../types';

describe('buildFingerMap', () => {
  it('builds correct finger map for qwerty-us', () => {
    const map = buildFingerMap('qwerty-us');
    // Home row
    expect(map['a']).toBe(1);
    expect(map['s']).toBe(2);
    expect(map['d']).toBe(3);
    expect(map['f']).toBe(4);
    expect(map['j']).toBe(7);
    expect(map['k']).toBe(8);
    expect(map['l']).toBe(9);
    expect(map[';']).toBe(10);
    // Shift variants
    expect(map['A']).toBe(1);
    expect(map['F']).toBe(4);
    // Number row
    expect(map['1']).toBe(1);
    expect(map['!']).toBe(1);
    expect(map['6']).toBe(7);
    // Space
    expect(map[' ']).toBe(5);
  });

  it('builds correct finger map for azerty-fr', () => {
    const map = buildFingerMap('azerty-fr');
    // AZERTY top row starts with 'a'
    expect(map['a']).toBe(1);
    expect(map['z']).toBe(2);
    // AZERTY home row starts with 'q'
    expect(map['q']).toBe(1);
    expect(map['s']).toBe(2);
    expect(map['d']).toBe(3);
    expect(map['f']).toBe(4);
    // AZERTY home row has 'm' as pinky
    expect(map['m']).toBe(10);
    // Number row has '&' as unshifted key for finger 1
    expect(map['&']).toBe(1);
  });

  it('builds correct finger map for dvorak', () => {
    const map = buildFingerMap('dvorak');
    // Dvorak home row: a, o, e, u, i, d, h, t, n, s
    expect(map['a']).toBe(1);
    expect(map['o']).toBe(2);
    expect(map['e']).toBe(3);
    expect(map['u']).toBe(4);
    expect(map['h']).toBe(7);
    expect(map['t']).toBe(8);
    expect(map['n']).toBe(9);
    expect(map['s']).toBe(10);
  });

  it('builds correct finger map for qwerty-de (QWERTZ)', () => {
    const map = buildFingerMap('qwerty-de');
    // Z and Y are swapped in QWERTZ
    expect(map['z']).toBe(7); // top row, right index
    expect(map['y']).toBe(1); // bottom row, left pinky
    // German-specific keys
    expect(map['ö']).toBe(10);
    expect(map['ü']).toBe(10);
    expect(map['ä']).toBe(10);
    expect(map['ß']).toBe(10);
  });

  it('builds correct finger map for colemak', () => {
    const map = buildFingerMap('colemak');
    // Colemak home row: a, r, s, t, d, h, n, e, i, o
    expect(map['a']).toBe(1);
    expect(map['r']).toBe(2);
    expect(map['s']).toBe(3);
    expect(map['t']).toBe(4);
    expect(map['n']).toBe(7);
    expect(map['e']).toBe(8);
    expect(map['i']).toBe(9);
    expect(map['o']).toBe(10);
  });

  it('maps both key and shift variant', () => {
    const map = buildFingerMap('qwerty-us');
    expect(map['2']).toBe(2);
    expect(map['@']).toBe(2);
    expect(map['[']).toBe(10);
    expect(map['{']).toBe(10);
  });
});

describe('buildShiftChars', () => {
  it('includes uppercase letters for qwerty-us', () => {
    const set = buildShiftChars('qwerty-us');
    expect(set.has('A')).toBe(true);
    expect(set.has('Z')).toBe(true);
    expect(set.has('!')).toBe(true);
    expect(set.has('@')).toBe(true);
    // Lowercase are NOT shift chars
    expect(set.has('a')).toBe(false);
    expect(set.has('1')).toBe(false);
  });

  it('AZERTY: digits require shift', () => {
    const set = buildShiftChars('azerty-fr');
    // In AZERTY, digits 1-9 and 0 are shift characters
    expect(set.has('1')).toBe(true);
    expect(set.has('2')).toBe(true);
    expect(set.has('9')).toBe(true);
    expect(set.has('0')).toBe(true);
    // '&' is an unshifted base key in AZERTY
    expect(set.has('&')).toBe(false);
  });

  it('QWERTZ: shift chars differ from US', () => {
    const set = buildShiftChars('qwerty-de');
    // shift+ß = '?' in QWERTZ
    expect(set.has('?')).toBe(true);
    // shift+3 = '§' in QWERTZ
    expect(set.has('§')).toBe(true);
    // Uppercase still needs shift
    expect(set.has('A')).toBe(true);
  });
});

describe('needsShiftForLayout', () => {
  it('returns true for uppercase in any layout', () => {
    expect(needsShiftForLayout('A', 'qwerty-us')).toBe(true);
    expect(needsShiftForLayout('A', 'azerty-fr')).toBe(true);
    expect(needsShiftForLayout('A', 'dvorak')).toBe(true);
    expect(needsShiftForLayout('A', 'colemak')).toBe(true);
  });

  it('returns false for lowercase in any layout', () => {
    expect(needsShiftForLayout('a', 'qwerty-us')).toBe(false);
    expect(needsShiftForLayout('a', 'azerty-fr')).toBe(false);
  });

  it('returns false for digits in QWERTY but true in AZERTY', () => {
    expect(needsShiftForLayout('1', 'qwerty-us')).toBe(false);
    expect(needsShiftForLayout('1', 'azerty-fr')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(needsShiftForLayout('', 'qwerty-us')).toBe(false);
  });
});

describe('getCachedFingerMap', () => {
  it('returns same reference on repeated calls', () => {
    const map1 = getCachedFingerMap('qwerty-us');
    const map2 = getCachedFingerMap('qwerty-us');
    expect(map1).toBe(map2);
  });

  it('returns different maps for different layouts', () => {
    const usMap = getCachedFingerMap('qwerty-us');
    const dvorakMap = getCachedFingerMap('dvorak');
    expect(usMap).not.toBe(dvorakMap);
    // 's' is finger 2 in QWERTY, finger 10 in Dvorak
    expect(usMap['s']).toBe(2);
    expect(dvorakMap['s']).toBe(10);
  });
});

describe('getCachedShiftChars', () => {
  it('returns same reference on repeated calls', () => {
    const set1 = getCachedShiftChars('qwerty-us');
    const set2 = getCachedShiftChars('qwerty-us');
    expect(set1).toBe(set2);
  });
});

describe('buildKeyboardRows', () => {
  const allLayouts: ConcreteKeyboardLayoutId[] = [
    'qwerty-us', 'qwerty-uk', 'qwerty-de', 'azerty-fr', 'dvorak', 'colemak',
  ];

  it('returns 5 rows for every layout', () => {
    for (const layoutId of allLayouts) {
      const rows = buildKeyboardRows(layoutId);
      expect(rows.length).toBe(5);
    }
  });

  it('first row ends with Backspace', () => {
    for (const layoutId of allLayouts) {
      const rows = buildKeyboardRows(layoutId);
      const lastKey = rows[0][rows[0].length - 1];
      expect(lastKey.key).toBe('Backspace');
      expect(lastKey.label).toBe('delete');
    }
  });

  it('second row starts with Tab', () => {
    for (const layoutId of allLayouts) {
      const rows = buildKeyboardRows(layoutId);
      expect(rows[1][0].key).toBe('Tab');
      expect(rows[1][0].label).toBe('tab');
    }
  });

  it('third row has CapsLock and Enter', () => {
    for (const layoutId of allLayouts) {
      const rows = buildKeyboardRows(layoutId);
      expect(rows[2][0].key).toBe('CapsLock');
      const lastKey = rows[2][rows[2].length - 1];
      expect(lastKey.key).toBe('Enter');
      expect(lastKey.label).toBe('return');
    }
  });

  it('fourth row has left and right Shift', () => {
    for (const layoutId of allLayouts) {
      const rows = buildKeyboardRows(layoutId);
      expect(rows[3][0].key).toBe('Shift');
      expect(rows[3][0].side).toBe('left');
      const lastKey = rows[3][rows[3].length - 1];
      expect(lastKey.key).toBe('Shift');
      expect(lastKey.side).toBe('right');
    }
  });

  it('fifth row has space bar', () => {
    for (const layoutId of allLayouts) {
      const rows = buildKeyboardRows(layoutId);
      const spaceKey = rows[4].find((k) => k.key === ' ');
      expect(spaceKey).toBeDefined();
      expect(spaceKey!.width).toBe(5);
    }
  });

  it('preserves home key markers for qwerty-us', () => {
    const rows = buildKeyboardRows('qwerty-us');
    const homeRow = rows[2];
    const homeKeys = homeRow.filter((k) => k.home);
    // Layout data marks 8 home keys: a, s, d, f (left) + j, k, l, ; (right)
    expect(homeKeys.length).toBe(8);
    expect(homeKeys.map((k) => k.key)).toContain('f');
    expect(homeKeys.map((k) => k.key)).toContain('j');
    expect(homeKeys.map((k) => k.key)).toContain('a');
    expect(homeKeys.map((k) => k.key)).toContain(';');
  });

  it('preserves home key markers for dvorak', () => {
    const rows = buildKeyboardRows('dvorak');
    const homeRow = rows[2];
    const homeKeys = homeRow.filter((k) => k.home);
    // Dvorak has 8 home keys: a, o, e, u (left), h, t, n, s (right)
    expect(homeKeys.length).toBe(8);
  });

  it('AZERTY second row starts with a after Tab', () => {
    const rows = buildKeyboardRows('azerty-fr');
    // After Tab, first character key is 'a'
    expect(rows[1][1].key).toBe('a');
  });

  it('QWERTZ has z in top row (after Tab)', () => {
    const rows = buildKeyboardRows('qwerty-de');
    // In QWERTZ, 'z' is where 'y' is in QWERTY (top row, position 6)
    const topRowKeys = rows[1].slice(1).map((k) => k.key);
    expect(topRowKeys).toContain('z');
  });

  it('all character keys have finger assignments', () => {
    for (const layoutId of allLayouts) {
      const rows = buildKeyboardRows(layoutId);
      for (const row of rows) {
        for (const key of row) {
          // Modifier keys don't have finger assignments
          if (['Backspace', 'Tab', 'CapsLock', 'Shift', 'Enter', 'fn', 'Control', 'Alt', 'Meta', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight'].includes(key.key)) {
            continue;
          }
          // All character keys should have finger assignments
          expect(key.finger).toBeDefined();
          expect(key.finger).toBeGreaterThanOrEqual(1);
          expect(key.finger).toBeLessThanOrEqual(10);
        }
      }
    }
  });
});
