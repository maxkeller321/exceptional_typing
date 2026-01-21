import type {
  KeystrokeEvent,
  WordAnalysis,
  BigramAnalysis,
  TrigramAnalysis,
  TypingAnalytics,
  FingerAnalysis,
  FingerName,
  HandAnalysis,
  CharacterAnalysis,
  CharacterTypeAnalysis,
  CharacterType,
} from '../types';

// Finger mapping for QWERTY keyboard
const fingerMap: Record<string, number> = {
  '`': 1, '~': 1, '1': 1, '!': 1, 'q': 1, 'Q': 1, 'a': 1, 'A': 1, 'z': 1, 'Z': 1,
  '2': 2, '@': 2, 'w': 2, 'W': 2, 's': 2, 'S': 2, 'x': 2, 'X': 2,
  '3': 3, '#': 3, 'e': 3, 'E': 3, 'd': 3, 'D': 3, 'c': 3, 'C': 3,
  '4': 4, '$': 4, '5': 4, '%': 4, 'r': 4, 'R': 4, 't': 4, 'T': 4, 'f': 4, 'F': 4, 'g': 4, 'G': 4, 'v': 4, 'V': 4, 'b': 4, 'B': 4,
  '6': 7, '^': 7, '7': 7, '&': 7, 'y': 7, 'Y': 7, 'u': 7, 'U': 7, 'h': 7, 'H': 7, 'j': 7, 'J': 7, 'n': 7, 'N': 7, 'm': 7, 'M': 7,
  '8': 8, '*': 8, 'i': 8, 'I': 8, 'k': 8, 'K': 8, ',': 8, '<': 8,
  '9': 9, '(': 9, 'o': 9, 'O': 9, 'l': 9, 'L': 9, '.': 9, '>': 9,
  '0': 10, ')': 10, '-': 10, '_': 10, '=': 10, '+': 10, 'p': 10, 'P': 10, '[': 10, '{': 10, ']': 10, '}': 10, '\\': 10, '|': 10, ';': 10, ':': 10, "'": 10, '"': 10, '/': 10, '?': 10,
  ' ': 6, // Space - right thumb
};

const fingerNames: Record<number, FingerName> = {
  1: 'leftPinky', 2: 'leftRing', 3: 'leftMiddle', 4: 'leftIndex', 5: 'leftThumb',
  6: 'rightThumb', 7: 'rightIndex', 8: 'rightMiddle', 9: 'rightRing', 10: 'rightPinky',
};

/**
 * Calculate typing analytics from keystroke events
 */
export function calculateAnalytics(
  keystrokes: KeystrokeEvent[],
  targetText: string
): TypingAnalytics {
  if (keystrokes.length === 0) {
    return {
      keystrokes: [],
      words: [],
      bigrams: [],
      trigrams: [],
      fingers: [],
      hands: { left: { count: 0, wpm: 0, accuracy: 100 }, right: { count: 0, wpm: 0, accuracy: 100 } },
      characters: [],
      characterTypes: [],
      totalTime: 0,
      totalChars: 0,
    };
  }

  const totalTime = keystrokes[keystrokes.length - 1].timestamp - keystrokes[0].timestamp;

  return {
    keystrokes,
    words: analyzeWords(keystrokes, targetText),
    bigrams: analyzeBigrams(keystrokes, targetText),
    trigrams: analyzeTrigrams(keystrokes, targetText),
    fingers: analyzeFingers(keystrokes, targetText, totalTime),
    hands: analyzeHands(keystrokes, targetText, totalTime),
    characters: analyzeCharacters(keystrokes, targetText),
    characterTypes: analyzeCharacterTypes(keystrokes, targetText),
    totalTime,
    totalChars: keystrokes.length,
  };
}

/**
 * Get finger number for a character
 */
export function getFingerForChar(char: string): number {
  return fingerMap[char] || fingerMap[char.toLowerCase()] || 0;
}

/**
 * Analyze finger-level performance
 */
function analyzeFingers(keystrokes: KeystrokeEvent[], targetText: string, totalTime: number): FingerAnalysis[] {
  const fingerData = new Map<number, { delays: number[]; errors: number; chars: number }>();

  // Initialize all fingers
  for (let i = 1; i <= 10; i++) {
    fingerData.set(i, { delays: [], errors: 0, chars: 0 });
  }

  for (let i = 0; i < keystrokes.length; i++) {
    const ks = keystrokes[i];
    const expectedChar = targetText[ks.index];
    const finger = getFingerForChar(expectedChar);

    if (finger === 0) continue;

    const data = fingerData.get(finger)!;
    data.chars++;

    if (!ks.isCorrect) {
      data.errors++;
    }

    // Calculate delay from previous keystroke
    if (i > 0) {
      const delay = ks.timestamp - keystrokes[i - 1].timestamp;
      data.delays.push(delay);
    }
  }

  const result: FingerAnalysis[] = [];

  for (const [fingerNum, data] of fingerData) {
    if (data.chars === 0) continue;

    const avgDelay = data.delays.length > 0
      ? data.delays.reduce((a, b) => a + b, 0) / data.delays.length
      : 0;

    // WPM calculation: chars / 5 = words, time in minutes
    const minutes = totalTime / 60000;
    const wpm = minutes > 0 ? Math.round((data.chars / 5) / minutes) : 0;
    const accuracy = data.chars > 0 ? (data.chars - data.errors) / data.chars : 1;

    result.push({
      finger: fingerNames[fingerNum],
      fingerNum,
      hand: fingerNum <= 5 ? 'left' : 'right',
      count: data.chars,
      avgDelay: Math.round(avgDelay),
      wpm,
      errors: data.errors,
      accuracy: Math.round(accuracy * 100) / 100,
    });
  }

  return result.sort((a, b) => b.wpm - a.wpm);
}

/**
 * Analyze hand-level performance
 */
function analyzeHands(keystrokes: KeystrokeEvent[], targetText: string, totalTime: number): HandAnalysis {
  const leftData = { chars: 0, errors: 0 };
  const rightData = { chars: 0, errors: 0 };

  for (const ks of keystrokes) {
    const expectedChar = targetText[ks.index];
    const finger = getFingerForChar(expectedChar);

    if (finger === 0) continue;

    const data = finger <= 5 ? leftData : rightData;
    data.chars++;
    if (!ks.isCorrect) data.errors++;
  }

  const minutes = totalTime / 60000;

  return {
    left: {
      count: leftData.chars,
      wpm: minutes > 0 ? Math.round((leftData.chars / 5) / minutes) : 0,
      accuracy: leftData.chars > 0 ? Math.round(((leftData.chars - leftData.errors) / leftData.chars) * 100) : 100,
    },
    right: {
      count: rightData.chars,
      wpm: minutes > 0 ? Math.round((rightData.chars / 5) / minutes) : 0,
      accuracy: rightData.chars > 0 ? Math.round(((rightData.chars - rightData.errors) / rightData.chars) * 100) : 100,
    },
  };
}

/**
 * Analyze character-level performance
 */
function analyzeCharacters(keystrokes: KeystrokeEvent[], targetText: string): CharacterAnalysis[] {
  const charData = new Map<string, { delays: number[]; errors: number; mistypes: string[] }>();

  for (let i = 0; i < keystrokes.length; i++) {
    const ks = keystrokes[i];
    const expectedChar = targetText[ks.index];

    if (!charData.has(expectedChar)) {
      charData.set(expectedChar, { delays: [], errors: 0, mistypes: [] });
    }

    const data = charData.get(expectedChar)!;

    if (!ks.isCorrect) {
      data.errors++;
      if (!data.mistypes.includes(ks.char)) {
        data.mistypes.push(ks.char);
      }
    }

    // Calculate delay from previous keystroke
    if (i > 0) {
      const delay = ks.timestamp - keystrokes[i - 1].timestamp;
      data.delays.push(delay);
    }
  }

  const result: CharacterAnalysis[] = [];

  for (const [char, data] of charData) {
    const count = data.delays.length + (data.delays.length === 0 ? 1 : 0);
    const avgDelay = data.delays.length > 0
      ? data.delays.reduce((a, b) => a + b, 0) / data.delays.length
      : 0;

    // Estimate WPM based on delay (1 char per delay)
    const wpm = avgDelay > 0 ? Math.round((1 / 5) / (avgDelay / 60000)) : 0;

    result.push({
      char,
      count,
      avgDelay: Math.round(avgDelay),
      wpm,
      errors: data.errors,
      mistypes: data.mistypes,
    });
  }

  return result.sort((a, b) => b.avgDelay - a.avgDelay);
}

/**
 * Categorize a character
 */
function getCharacterType(char: string): CharacterType {
  if (/[a-z]/.test(char)) return 'lowercase';
  if (/[A-Z]/.test(char)) return 'uppercase';
  if (/[0-9]/.test(char)) return 'numbers';
  if (/\s/.test(char)) return 'whitespace';
  return 'punctuation';
}

const typeLabels: Record<CharacterType, string> = {
  lowercase: 'Lowercase',
  uppercase: 'Uppercase',
  numbers: 'Numbers',
  punctuation: 'Punctuation & Symbols',
  whitespace: 'Whitespace',
};

/**
 * Analyze character type distribution
 */
function analyzeCharacterTypes(keystrokes: KeystrokeEvent[], targetText: string): CharacterTypeAnalysis[] {
  const typeData = new Map<CharacterType, { delays: number[]; chars: Set<string> }>();

  for (let i = 0; i < keystrokes.length; i++) {
    const ks = keystrokes[i];
    const expectedChar = targetText[ks.index];
    const type = getCharacterType(expectedChar);

    if (!typeData.has(type)) {
      typeData.set(type, { delays: [], chars: new Set() });
    }

    const data = typeData.get(type)!;
    data.chars.add(expectedChar);

    if (i > 0) {
      const delay = ks.timestamp - keystrokes[i - 1].timestamp;
      data.delays.push(delay);
    }
  }

  const result: CharacterTypeAnalysis[] = [];

  for (const [type, data] of typeData) {
    const count = data.delays.length + (data.delays.length === 0 ? 1 : 0);
    const avgDelay = data.delays.length > 0
      ? data.delays.reduce((a, b) => a + b, 0) / data.delays.length
      : 0;

    const wpm = avgDelay > 0 ? Math.round((1 / 5) / (avgDelay / 60000)) : 0;

    result.push({
      type,
      label: typeLabels[type],
      count,
      avgDelay: Math.round(avgDelay),
      wpm,
      chars: Array.from(data.chars),
    });
  }

  return result.sort((a, b) => b.avgDelay - a.avgDelay);
}

/**
 * Analyze word-level performance
 */
function analyzeWords(keystrokes: KeystrokeEvent[], targetText: string): WordAnalysis[] {
  const wordMatches = [...targetText.matchAll(/\S+/g)];
  const wordMap = new Map<string, { times: number[]; errors: number[]; startIndices: number[] }>();

  for (const match of wordMatches) {
    const word = match[0];
    const startIndex = match.index!;
    const endIndex = startIndex + word.length;

    const wordKeystrokes = keystrokes.filter(
      (k) => k.index >= startIndex && k.index < endIndex
    );

    if (wordKeystrokes.length === 0) continue;

    const wordTime =
      wordKeystrokes.length > 1
        ? wordKeystrokes[wordKeystrokes.length - 1].timestamp - wordKeystrokes[0].timestamp
        : 0;

    const wordErrors = wordKeystrokes.filter((k) => !k.isCorrect).length;

    if (!wordMap.has(word)) {
      wordMap.set(word, { times: [], errors: [], startIndices: [] });
    }
    const data = wordMap.get(word)!;
    data.times.push(wordTime);
    data.errors.push(wordErrors);
    data.startIndices.push(startIndex);
  }

  const result: WordAnalysis[] = [];
  for (const [word, data] of wordMap) {
    const avgTime = data.times.reduce((a, b) => a + b, 0) / data.times.length;
    const totalErrors = data.errors.reduce((a, b) => a + b, 0);
    const totalChars = word.length * data.times.length;
    const accuracy = totalChars > 0 ? (totalChars - totalErrors) / totalChars : 1;
    const wpm = avgTime > 0 ? (word.length / 5) / (avgTime / 60000) : 0;

    result.push({
      word,
      count: data.times.length,
      avgTime: Math.round(avgTime),
      wpm: Math.round(wpm),
      errors: totalErrors,
      accuracy: Math.round(accuracy * 100) / 100,
    });
  }

  return result.sort((a, b) => a.avgTime - b.avgTime);
}

/**
 * Analyze bigram performance
 */
function analyzeBigrams(keystrokes: KeystrokeEvent[], targetText: string): BigramAnalysis[] {
  const bigramMap = new Map<string, { times: number[]; errors: number }>();

  for (let i = 1; i < keystrokes.length; i++) {
    const prev = keystrokes[i - 1];
    const curr = keystrokes[i];

    if (curr.index !== prev.index + 1) continue;

    const char1 = targetText[prev.index] || prev.char;
    const char2 = targetText[curr.index] || curr.char;
    const bigram = char1 + char2;
    const time = curr.timestamp - prev.timestamp;
    const hasError = !prev.isCorrect || !curr.isCorrect;

    if (!bigramMap.has(bigram)) {
      bigramMap.set(bigram, { times: [], errors: 0 });
    }
    const data = bigramMap.get(bigram)!;
    data.times.push(time);
    if (hasError) data.errors++;
  }

  const result: BigramAnalysis[] = [];
  for (const [bigram, data] of bigramMap) {
    const avgTime = data.times.reduce((a, b) => a + b, 0) / data.times.length;
    result.push({
      bigram,
      chars: [bigram[0], bigram[1]] as [string, string],
      count: data.times.length,
      avgTime: Math.round(avgTime),
      errors: data.errors,
    });
  }

  return result.sort((a, b) => b.avgTime - a.avgTime);
}

/**
 * Analyze trigram performance
 */
function analyzeTrigrams(keystrokes: KeystrokeEvent[], targetText: string): TrigramAnalysis[] {
  const trigramMap = new Map<string, { times: number[]; errors: number }>();

  for (let i = 2; i < keystrokes.length; i++) {
    const first = keystrokes[i - 2];
    const second = keystrokes[i - 1];
    const third = keystrokes[i];

    if (second.index !== first.index + 1 || third.index !== second.index + 1) continue;

    const char1 = targetText[first.index] || first.char;
    const char2 = targetText[second.index] || second.char;
    const char3 = targetText[third.index] || third.char;
    const trigram = char1 + char2 + char3;
    const time = third.timestamp - first.timestamp;
    const hasError = !first.isCorrect || !second.isCorrect || !third.isCorrect;

    if (!trigramMap.has(trigram)) {
      trigramMap.set(trigram, { times: [], errors: 0 });
    }
    const data = trigramMap.get(trigram)!;
    data.times.push(time);
    if (hasError) data.errors++;
  }

  const result: TrigramAnalysis[] = [];
  for (const [trigram, data] of trigramMap) {
    const avgTime = data.times.reduce((a, b) => a + b, 0) / data.times.length;
    result.push({
      trigram,
      chars: [trigram[0], trigram[1], trigram[2]] as [string, string, string],
      count: data.times.length,
      avgTime: Math.round(avgTime),
      errors: data.errors,
    });
  }

  return result.sort((a, b) => b.avgTime - a.avgTime);
}
