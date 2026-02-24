import type { ConcreteKeyboardLayoutId, KeyboardLayoutId } from '../../types';

export interface KeyDefinition {
  key: string;
  shift?: string;
  label?: string;
  width?: number;
  finger?: number; // 1-5 left hand, 6-10 right hand
  home?: boolean;
}

export interface KeyboardLayout {
  id: KeyboardLayoutId;
  name: string;
  locale: string;
  rows: KeyDefinition[][];
}

// Finger assignments for QWERTY-based layouts
// 1=left pinky, 2=left ring, 3=left middle, 4=left index, 5=left thumb
// 6=right thumb, 7=right index, 8=right middle, 9=right ring, 10=right pinky

// QWERTY US Layout
export const qwertyUs: KeyboardLayout = {
  id: 'qwerty-us',
  name: 'QWERTY (US)',
  locale: 'en-US',
  rows: [
    // Number row
    [
      { key: '`', shift: '~', finger: 1 },
      { key: '1', shift: '!', finger: 1 },
      { key: '2', shift: '@', finger: 2 },
      { key: '3', shift: '#', finger: 3 },
      { key: '4', shift: '$', finger: 4 },
      { key: '5', shift: '%', finger: 4 },
      { key: '6', shift: '^', finger: 7 },
      { key: '7', shift: '&', finger: 7 },
      { key: '8', shift: '*', finger: 8 },
      { key: '9', shift: '(', finger: 9 },
      { key: '0', shift: ')', finger: 10 },
      { key: '-', shift: '_', finger: 10 },
      { key: '=', shift: '+', finger: 10 },
    ],
    // Top row
    [
      { key: 'q', shift: 'Q', finger: 1 },
      { key: 'w', shift: 'W', finger: 2 },
      { key: 'e', shift: 'E', finger: 3 },
      { key: 'r', shift: 'R', finger: 4 },
      { key: 't', shift: 'T', finger: 4 },
      { key: 'y', shift: 'Y', finger: 7 },
      { key: 'u', shift: 'U', finger: 7 },
      { key: 'i', shift: 'I', finger: 8 },
      { key: 'o', shift: 'O', finger: 9 },
      { key: 'p', shift: 'P', finger: 10 },
      { key: '[', shift: '{', finger: 10 },
      { key: ']', shift: '}', finger: 10 },
      { key: '\\', shift: '|', finger: 10 },
    ],
    // Home row
    [
      { key: 'a', shift: 'A', finger: 1, home: true },
      { key: 's', shift: 'S', finger: 2, home: true },
      { key: 'd', shift: 'D', finger: 3, home: true },
      { key: 'f', shift: 'F', finger: 4, home: true },
      { key: 'g', shift: 'G', finger: 4 },
      { key: 'h', shift: 'H', finger: 7 },
      { key: 'j', shift: 'J', finger: 7, home: true },
      { key: 'k', shift: 'K', finger: 8, home: true },
      { key: 'l', shift: 'L', finger: 9, home: true },
      { key: ';', shift: ':', finger: 10, home: true },
      { key: "'", shift: '"', finger: 10 },
    ],
    // Bottom row
    [
      { key: 'z', shift: 'Z', finger: 1 },
      { key: 'x', shift: 'X', finger: 2 },
      { key: 'c', shift: 'C', finger: 3 },
      { key: 'v', shift: 'V', finger: 4 },
      { key: 'b', shift: 'B', finger: 4 },
      { key: 'n', shift: 'N', finger: 7 },
      { key: 'm', shift: 'M', finger: 7 },
      { key: ',', shift: '<', finger: 8 },
      { key: '.', shift: '>', finger: 9 },
      { key: '/', shift: '?', finger: 10 },
    ],
    // Space row
    [
      { key: ' ', label: 'Space', width: 6, finger: 5 },
    ],
  ],
};

// QWERTY UK Layout
export const qwertyUk: KeyboardLayout = {
  id: 'qwerty-uk',
  name: 'QWERTY (UK)',
  locale: 'en-GB',
  rows: [
    [
      { key: '`', shift: '¬', finger: 1 },
      { key: '1', shift: '!', finger: 1 },
      { key: '2', shift: '"', finger: 2 },
      { key: '3', shift: '£', finger: 3 },
      { key: '4', shift: '$', finger: 4 },
      { key: '5', shift: '%', finger: 4 },
      { key: '6', shift: '^', finger: 7 },
      { key: '7', shift: '&', finger: 7 },
      { key: '8', shift: '*', finger: 8 },
      { key: '9', shift: '(', finger: 9 },
      { key: '0', shift: ')', finger: 10 },
      { key: '-', shift: '_', finger: 10 },
      { key: '=', shift: '+', finger: 10 },
    ],
    [
      { key: 'q', shift: 'Q', finger: 1 },
      { key: 'w', shift: 'W', finger: 2 },
      { key: 'e', shift: 'E', finger: 3 },
      { key: 'r', shift: 'R', finger: 4 },
      { key: 't', shift: 'T', finger: 4 },
      { key: 'y', shift: 'Y', finger: 7 },
      { key: 'u', shift: 'U', finger: 7 },
      { key: 'i', shift: 'I', finger: 8 },
      { key: 'o', shift: 'O', finger: 9 },
      { key: 'p', shift: 'P', finger: 10 },
      { key: '[', shift: '{', finger: 10 },
      { key: ']', shift: '}', finger: 10 },
    ],
    [
      { key: 'a', shift: 'A', finger: 1, home: true },
      { key: 's', shift: 'S', finger: 2, home: true },
      { key: 'd', shift: 'D', finger: 3, home: true },
      { key: 'f', shift: 'F', finger: 4, home: true },
      { key: 'g', shift: 'G', finger: 4 },
      { key: 'h', shift: 'H', finger: 7 },
      { key: 'j', shift: 'J', finger: 7, home: true },
      { key: 'k', shift: 'K', finger: 8, home: true },
      { key: 'l', shift: 'L', finger: 9, home: true },
      { key: ';', shift: ':', finger: 10, home: true },
      { key: "'", shift: '@', finger: 10 },
      { key: '#', shift: '~', finger: 10 },
    ],
    [
      { key: '\\', shift: '|', finger: 1 },
      { key: 'z', shift: 'Z', finger: 1 },
      { key: 'x', shift: 'X', finger: 2 },
      { key: 'c', shift: 'C', finger: 3 },
      { key: 'v', shift: 'V', finger: 4 },
      { key: 'b', shift: 'B', finger: 4 },
      { key: 'n', shift: 'N', finger: 7 },
      { key: 'm', shift: 'M', finger: 7 },
      { key: ',', shift: '<', finger: 8 },
      { key: '.', shift: '>', finger: 9 },
      { key: '/', shift: '?', finger: 10 },
    ],
    [
      { key: ' ', label: 'Space', width: 6, finger: 5 },
    ],
  ],
};

// QWERTZ German Layout
export const qwertyDe: KeyboardLayout = {
  id: 'qwerty-de',
  name: 'QWERTZ (German)',
  locale: 'de-DE',
  rows: [
    [
      { key: '^', shift: '°', finger: 1 },
      { key: '1', shift: '!', finger: 1 },
      { key: '2', shift: '"', finger: 2 },
      { key: '3', shift: '§', finger: 3 },
      { key: '4', shift: '$', finger: 4 },
      { key: '5', shift: '%', finger: 4 },
      { key: '6', shift: '&', finger: 7 },
      { key: '7', shift: '/', finger: 7 },
      { key: '8', shift: '(', finger: 8 },
      { key: '9', shift: ')', finger: 9 },
      { key: '0', shift: '=', finger: 10 },
      { key: 'ß', shift: '?', finger: 10 },
      { key: '´', shift: '`', finger: 10 },
    ],
    [
      { key: 'q', shift: 'Q', finger: 1 },
      { key: 'w', shift: 'W', finger: 2 },
      { key: 'e', shift: 'E', finger: 3 },
      { key: 'r', shift: 'R', finger: 4 },
      { key: 't', shift: 'T', finger: 4 },
      { key: 'z', shift: 'Z', finger: 7 },
      { key: 'u', shift: 'U', finger: 7 },
      { key: 'i', shift: 'I', finger: 8 },
      { key: 'o', shift: 'O', finger: 9 },
      { key: 'p', shift: 'P', finger: 10 },
      { key: 'ü', shift: 'Ü', finger: 10 },
      { key: '+', shift: '*', finger: 10 },
    ],
    [
      { key: 'a', shift: 'A', finger: 1, home: true },
      { key: 's', shift: 'S', finger: 2, home: true },
      { key: 'd', shift: 'D', finger: 3, home: true },
      { key: 'f', shift: 'F', finger: 4, home: true },
      { key: 'g', shift: 'G', finger: 4 },
      { key: 'h', shift: 'H', finger: 7 },
      { key: 'j', shift: 'J', finger: 7, home: true },
      { key: 'k', shift: 'K', finger: 8, home: true },
      { key: 'l', shift: 'L', finger: 9, home: true },
      { key: 'ö', shift: 'Ö', finger: 10, home: true },
      { key: 'ä', shift: 'Ä', finger: 10 },
      { key: '#', shift: "'", finger: 10 },
    ],
    [
      { key: '<', shift: '>', finger: 1 },
      { key: 'y', shift: 'Y', finger: 1 },
      { key: 'x', shift: 'X', finger: 2 },
      { key: 'c', shift: 'C', finger: 3 },
      { key: 'v', shift: 'V', finger: 4 },
      { key: 'b', shift: 'B', finger: 4 },
      { key: 'n', shift: 'N', finger: 7 },
      { key: 'm', shift: 'M', finger: 7 },
      { key: ',', shift: ';', finger: 8 },
      { key: '.', shift: ':', finger: 9 },
      { key: '-', shift: '_', finger: 10 },
    ],
    [
      { key: ' ', label: 'Space', width: 6, finger: 5 },
    ],
  ],
};

// AZERTY French Layout
export const azertyFr: KeyboardLayout = {
  id: 'azerty-fr',
  name: 'AZERTY (French)',
  locale: 'fr-FR',
  rows: [
    [
      { key: '²', shift: '', finger: 1 },
      { key: '&', shift: '1', finger: 1 },
      { key: 'é', shift: '2', finger: 2 },
      { key: '"', shift: '3', finger: 3 },
      { key: "'", shift: '4', finger: 4 },
      { key: '(', shift: '5', finger: 4 },
      { key: '-', shift: '6', finger: 7 },
      { key: 'è', shift: '7', finger: 7 },
      { key: '_', shift: '8', finger: 8 },
      { key: 'ç', shift: '9', finger: 9 },
      { key: 'à', shift: '0', finger: 10 },
      { key: ')', shift: '°', finger: 10 },
      { key: '=', shift: '+', finger: 10 },
    ],
    [
      { key: 'a', shift: 'A', finger: 1 },
      { key: 'z', shift: 'Z', finger: 2 },
      { key: 'e', shift: 'E', finger: 3 },
      { key: 'r', shift: 'R', finger: 4 },
      { key: 't', shift: 'T', finger: 4 },
      { key: 'y', shift: 'Y', finger: 7 },
      { key: 'u', shift: 'U', finger: 7 },
      { key: 'i', shift: 'I', finger: 8 },
      { key: 'o', shift: 'O', finger: 9 },
      { key: 'p', shift: 'P', finger: 10 },
      { key: '^', shift: '¨', finger: 10 },
      { key: '$', shift: '£', finger: 10 },
    ],
    [
      { key: 'q', shift: 'Q', finger: 1, home: true },
      { key: 's', shift: 'S', finger: 2, home: true },
      { key: 'd', shift: 'D', finger: 3, home: true },
      { key: 'f', shift: 'F', finger: 4, home: true },
      { key: 'g', shift: 'G', finger: 4 },
      { key: 'h', shift: 'H', finger: 7 },
      { key: 'j', shift: 'J', finger: 7, home: true },
      { key: 'k', shift: 'K', finger: 8, home: true },
      { key: 'l', shift: 'L', finger: 9, home: true },
      { key: 'm', shift: 'M', finger: 10, home: true },
      { key: 'ù', shift: '%', finger: 10 },
      { key: '*', shift: 'µ', finger: 10 },
    ],
    [
      { key: '<', shift: '>', finger: 1 },
      { key: 'w', shift: 'W', finger: 1 },
      { key: 'x', shift: 'X', finger: 2 },
      { key: 'c', shift: 'C', finger: 3 },
      { key: 'v', shift: 'V', finger: 4 },
      { key: 'b', shift: 'B', finger: 4 },
      { key: 'n', shift: 'N', finger: 7 },
      { key: ',', shift: '?', finger: 8 },
      { key: ';', shift: '.', finger: 9 },
      { key: ':', shift: '/', finger: 10 },
      { key: '!', shift: '§', finger: 10 },
    ],
    [
      { key: ' ', label: 'Space', width: 6, finger: 5 },
    ],
  ],
};

// Dvorak Layout
export const dvorak: KeyboardLayout = {
  id: 'dvorak',
  name: 'Dvorak',
  locale: 'en-US',
  rows: [
    [
      { key: '`', shift: '~', finger: 1 },
      { key: '1', shift: '!', finger: 1 },
      { key: '2', shift: '@', finger: 2 },
      { key: '3', shift: '#', finger: 3 },
      { key: '4', shift: '$', finger: 4 },
      { key: '5', shift: '%', finger: 4 },
      { key: '6', shift: '^', finger: 7 },
      { key: '7', shift: '&', finger: 7 },
      { key: '8', shift: '*', finger: 8 },
      { key: '9', shift: '(', finger: 9 },
      { key: '0', shift: ')', finger: 10 },
      { key: '[', shift: '{', finger: 10 },
      { key: ']', shift: '}', finger: 10 },
    ],
    [
      { key: "'", shift: '"', finger: 1 },
      { key: ',', shift: '<', finger: 2 },
      { key: '.', shift: '>', finger: 3 },
      { key: 'p', shift: 'P', finger: 4 },
      { key: 'y', shift: 'Y', finger: 4 },
      { key: 'f', shift: 'F', finger: 7 },
      { key: 'g', shift: 'G', finger: 7 },
      { key: 'c', shift: 'C', finger: 8 },
      { key: 'r', shift: 'R', finger: 9 },
      { key: 'l', shift: 'L', finger: 10 },
      { key: '/', shift: '?', finger: 10 },
      { key: '=', shift: '+', finger: 10 },
      { key: '\\', shift: '|', finger: 10 },
    ],
    [
      { key: 'a', shift: 'A', finger: 1, home: true },
      { key: 'o', shift: 'O', finger: 2, home: true },
      { key: 'e', shift: 'E', finger: 3, home: true },
      { key: 'u', shift: 'U', finger: 4, home: true },
      { key: 'i', shift: 'I', finger: 4 },
      { key: 'd', shift: 'D', finger: 7 },
      { key: 'h', shift: 'H', finger: 7, home: true },
      { key: 't', shift: 'T', finger: 8, home: true },
      { key: 'n', shift: 'N', finger: 9, home: true },
      { key: 's', shift: 'S', finger: 10, home: true },
      { key: '-', shift: '_', finger: 10 },
    ],
    [
      { key: ';', shift: ':', finger: 1 },
      { key: 'q', shift: 'Q', finger: 2 },
      { key: 'j', shift: 'J', finger: 3 },
      { key: 'k', shift: 'K', finger: 4 },
      { key: 'x', shift: 'X', finger: 4 },
      { key: 'b', shift: 'B', finger: 7 },
      { key: 'm', shift: 'M', finger: 7 },
      { key: 'w', shift: 'W', finger: 8 },
      { key: 'v', shift: 'V', finger: 9 },
      { key: 'z', shift: 'Z', finger: 10 },
    ],
    [
      { key: ' ', label: 'Space', width: 6, finger: 5 },
    ],
  ],
};

// Colemak Layout
export const colemak: KeyboardLayout = {
  id: 'colemak',
  name: 'Colemak',
  locale: 'en-US',
  rows: [
    [
      { key: '`', shift: '~', finger: 1 },
      { key: '1', shift: '!', finger: 1 },
      { key: '2', shift: '@', finger: 2 },
      { key: '3', shift: '#', finger: 3 },
      { key: '4', shift: '$', finger: 4 },
      { key: '5', shift: '%', finger: 4 },
      { key: '6', shift: '^', finger: 7 },
      { key: '7', shift: '&', finger: 7 },
      { key: '8', shift: '*', finger: 8 },
      { key: '9', shift: '(', finger: 9 },
      { key: '0', shift: ')', finger: 10 },
      { key: '-', shift: '_', finger: 10 },
      { key: '=', shift: '+', finger: 10 },
    ],
    [
      { key: 'q', shift: 'Q', finger: 1 },
      { key: 'w', shift: 'W', finger: 2 },
      { key: 'f', shift: 'F', finger: 3 },
      { key: 'p', shift: 'P', finger: 4 },
      { key: 'g', shift: 'G', finger: 4 },
      { key: 'j', shift: 'J', finger: 7 },
      { key: 'l', shift: 'L', finger: 7 },
      { key: 'u', shift: 'U', finger: 8 },
      { key: 'y', shift: 'Y', finger: 9 },
      { key: ';', shift: ':', finger: 10 },
      { key: '[', shift: '{', finger: 10 },
      { key: ']', shift: '}', finger: 10 },
      { key: '\\', shift: '|', finger: 10 },
    ],
    [
      { key: 'a', shift: 'A', finger: 1, home: true },
      { key: 'r', shift: 'R', finger: 2, home: true },
      { key: 's', shift: 'S', finger: 3, home: true },
      { key: 't', shift: 'T', finger: 4, home: true },
      { key: 'd', shift: 'D', finger: 4 },
      { key: 'h', shift: 'H', finger: 7 },
      { key: 'n', shift: 'N', finger: 7, home: true },
      { key: 'e', shift: 'E', finger: 8, home: true },
      { key: 'i', shift: 'I', finger: 9, home: true },
      { key: 'o', shift: 'O', finger: 10, home: true },
      { key: "'", shift: '"', finger: 10 },
    ],
    [
      { key: 'z', shift: 'Z', finger: 1 },
      { key: 'x', shift: 'X', finger: 2 },
      { key: 'c', shift: 'C', finger: 3 },
      { key: 'v', shift: 'V', finger: 4 },
      { key: 'b', shift: 'B', finger: 4 },
      { key: 'k', shift: 'K', finger: 7 },
      { key: 'm', shift: 'M', finger: 7 },
      { key: ',', shift: '<', finger: 8 },
      { key: '.', shift: '>', finger: 9 },
      { key: '/', shift: '?', finger: 10 },
    ],
    [
      { key: ' ', label: 'Space', width: 6, finger: 5 },
    ],
  ],
};

// All layouts
export const layouts: Record<ConcreteKeyboardLayoutId, KeyboardLayout> = {
  'qwerty-us': qwertyUs,
  'qwerty-uk': qwertyUk,
  'qwerty-de': qwertyDe,
  'azerty-fr': azertyFr,
  dvorak,
  colemak,
};

// Get layout by ID
export function getLayout(id: ConcreteKeyboardLayoutId): KeyboardLayout {
  return layouts[id] || qwertyUs;
}

// Get finger for a key in a specific layout
export function getFingerForKey(key: string, layoutId: ConcreteKeyboardLayoutId): number | null {
  const layout = getLayout(layoutId);
  const lowerKey = key.toLowerCase();

  for (const row of layout.rows) {
    for (const keyDef of row) {
      if (keyDef.key === lowerKey || keyDef.key === key || keyDef.shift === key) {
        return keyDef.finger || null;
      }
    }
  }

  return null;
}

// Get finger name
export function getFingerName(finger: number): string {
  const names: Record<number, string> = {
    1: 'Left Pinky',
    2: 'Left Ring',
    3: 'Left Middle',
    4: 'Left Index',
    5: 'Left Thumb',
    6: 'Right Thumb',
    7: 'Right Index',
    8: 'Right Middle',
    9: 'Right Ring',
    10: 'Right Pinky',
  };
  return names[finger] || 'Unknown';
}
