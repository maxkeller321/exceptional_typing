/**
 * Word Wrapper Utility
 *
 * Ensures words at the end of lines are either:
 * 1. Fully moved to the next line (for short words)
 * 2. Hyphenated (for long words that must break)
 *
 * This utility groups characters into "word units" that should stay together
 * when rendered with flex-wrap.
 */

export interface WordUnit {
  /** The text content of this unit */
  text: string;
  /** Starting index in the original text */
  startIndex: number;
  /** Whether this is a space/whitespace unit */
  isSpace: boolean;
  /** Whether this is a newline */
  isNewline: boolean;
}

/**
 * Splits text into word units that should stay together when wrapping.
 *
 * Rules:
 * - Whitespace (spaces, tabs) forms separate units and can break
 * - Newlines form separate units
 * - Continuous non-whitespace characters form a word unit
 * - Word units should not break in the middle (rendered with white-space: nowrap)
 */
export function splitIntoWordUnits(text: string): WordUnit[] {
  const units: WordUnit[] = [];
  let currentUnit = '';
  let unitStart = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '\n') {
      // Flush current unit if any
      if (currentUnit.length > 0) {
        units.push({
          text: currentUnit,
          startIndex: unitStart,
          isSpace: false,
          isNewline: false,
        });
        currentUnit = '';
      }

      // Add newline as its own unit
      units.push({
        text: char,
        startIndex: i,
        isSpace: false,
        isNewline: true,
      });
      unitStart = i + 1;
    } else if (char === ' ' || char === '\t') {
      // Flush current unit if any
      if (currentUnit.length > 0) {
        units.push({
          text: currentUnit,
          startIndex: unitStart,
          isSpace: false,
          isNewline: false,
        });
        currentUnit = '';
      }

      // Add space as its own unit (allows breaking after spaces)
      units.push({
        text: char,
        startIndex: i,
        isSpace: true,
        isNewline: false,
      });
      unitStart = i + 1;
    } else {
      // Accumulate word characters
      if (currentUnit.length === 0) {
        unitStart = i;
      }
      currentUnit += char;
    }
  }

  // Flush remaining unit
  if (currentUnit.length > 0) {
    units.push({
      text: currentUnit,
      startIndex: unitStart,
      isSpace: false,
      isNewline: false,
    });
  }

  return units;
}

/**
 * Gets the word unit and character offset for a given index in the original text.
 */
export function getWordUnitForIndex(
  units: WordUnit[],
  index: number
): { unit: WordUnit; offsetInUnit: number } | null {
  for (const unit of units) {
    const unitEnd = unit.startIndex + unit.text.length;
    if (index >= unit.startIndex && index < unitEnd) {
      return {
        unit,
        offsetInUnit: index - unit.startIndex,
      };
    }
  }
  return null;
}
