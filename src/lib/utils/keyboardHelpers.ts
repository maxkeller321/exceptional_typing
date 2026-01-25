/**
 * Keyboard Helper Utilities
 *
 * Helper functions for the virtual keyboard component.
 */

// Finger colors - using hex values for inline styles
export const fingerColors: Record<number, string> = {
  1: '#f43f5e', // Left pinky - rose-500
  2: '#f97316', // Left ring - orange-500
  3: '#eab308', // Left middle - yellow-500
  4: '#22c55e', // Left index - green-500
  5: '#3b82f6', // Left thumb - blue-500
  6: '#3b82f6', // Right thumb - blue-500
  7: '#22c55e', // Right index - green-500
  8: '#eab308', // Right middle - yellow-500
  9: '#f97316', // Right ring - orange-500
  10: '#f43f5e', // Right pinky - rose-500
};

// Finger assignments for each key (left hand: 1-5, right hand: 6-10)
// 1=left pinky, 2=left ring, 3=left middle, 4=left index, 5=left thumb
// 6=right thumb, 7=right index, 8=right middle, 9=right ring, 10=right pinky
export const fingerMap: Record<string, number> = {
  // Row 1 - Numbers
  '`': 1, '~': 1,
  '1': 1, '!': 1,
  '2': 2, '@': 2,
  '3': 3, '#': 3,
  '4': 4, '$': 4,
  '5': 4, '%': 4,
  '6': 7, '^': 7,
  '7': 7, '&': 7,
  '8': 8, '*': 8,
  '9': 9, '(': 9,
  '0': 10, ')': 10,
  '-': 10, '_': 10,
  '=': 10, '+': 10,

  // Row 2 - QWERTY
  'q': 1, 'Q': 1,
  'w': 2, 'W': 2,
  'e': 3, 'E': 3,
  'r': 4, 'R': 4,
  't': 4, 'T': 4,
  'y': 7, 'Y': 7,
  'u': 7, 'U': 7,
  'i': 8, 'I': 8,
  'o': 9, 'O': 9,
  'p': 10, 'P': 10,
  '[': 10, '{': 10,
  ']': 10, '}': 10,
  '\\': 10, '|': 10,

  // Row 3 - Home row
  'a': 1, 'A': 1,
  's': 2, 'S': 2,
  'd': 3, 'D': 3,
  'f': 4, 'F': 4,
  'g': 4, 'G': 4,
  'h': 7, 'H': 7,
  'j': 7, 'J': 7,
  'k': 8, 'K': 8,
  'l': 9, 'L': 9,
  ';': 10, ':': 10,
  "'": 10, '"': 10,

  // Row 4 - Bottom
  'z': 1, 'Z': 1,
  'x': 2, 'X': 2,
  'c': 3, 'C': 3,
  'v': 4, 'V': 4,
  'b': 4, 'B': 4,
  'n': 7, 'N': 7,
  'm': 7, 'M': 7,
  ',': 8, '<': 8,
  '.': 9, '>': 9,
  '/': 10, '?': 10,

  // Space bar - right thumb
  ' ': 6,
};

/**
 * Darken a hex color by a factor (for stroke colors)
 */
export function darkenColor(hex: string, factor: number = 0.7): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `#${Math.round(r * factor).toString(16).padStart(2, '0')}${Math.round(g * factor).toString(16).padStart(2, '0')}${Math.round(b * factor).toString(16).padStart(2, '0')}`;
}

/**
 * Get the finger number for a given key
 */
export function getFingerForKey(key: string): number | null {
  return fingerMap[key] || fingerMap[key.toLowerCase()] || null;
}

/**
 * Get the highlight style for a finger based on the current key
 */
export function getFingerHighlightStyle(fingerNum: number, nextKey: string): string {
  const currentFinger = getFingerForKey(nextKey);
  if (currentFinger === fingerNum) {
    const color = fingerColors[fingerNum];
    const strokeColor = darkenColor(color);
    return `fill: ${color}; stroke: ${strokeColor}; filter: drop-shadow(0 0 6px ${color}80);`;
  }
  return '';
}

/**
 * Check if a shift key is needed for the given character
 */
export function needsShift(char: string): boolean {
  if (!char) return false;
  const shiftChars = '~!@#$%^&*()_+{}|:"<>?QWERTYUIOPASDFGHJKLZXCVBNM';
  return shiftChars.includes(char);
}

/**
 * Get finger color for legend display
 */
export function getFingerLegendColor(fingerType: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb'): string {
  const legendColors: Record<string, string> = {
    pinky: fingerColors[1],    // rose
    ring: fingerColors[2],     // orange
    middle: fingerColors[3],   // yellow
    index: fingerColors[4],    // green
    thumb: fingerColors[5],    // blue
  };
  return legendColors[fingerType];
}
