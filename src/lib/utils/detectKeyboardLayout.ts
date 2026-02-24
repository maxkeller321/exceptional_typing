/**
 * Keyboard Layout Auto-Detection
 *
 * Detects the user's physical keyboard layout using three strategies (in order):
 * 1. Tauri command (macOS: reads OS input source via Carbon API) — most reliable
 * 2. Web Keyboard API (navigator.keyboard.getLayoutMap) — Chrome/Edge only
 * 3. Locale-based heuristic (navigator.language) — universal fallback
 */

import type { ConcreteKeyboardLayoutId } from '../types';

const localeToLayoutMap: Record<string, ConcreteKeyboardLayoutId> = {
  'en-US': 'qwerty-us',
  'en-GB': 'qwerty-uk',
  'en-AU': 'qwerty-us',
  'en-CA': 'qwerty-us',
  'en': 'qwerty-us',
  'de': 'qwerty-de',
  'de-DE': 'qwerty-de',
  'de-AT': 'qwerty-de',
  'de-CH': 'qwerty-de',
  'fr': 'azerty-fr',
  'fr-FR': 'azerty-fr',
  'fr-BE': 'azerty-fr',
  'fr-CA': 'qwerty-us', // French Canadian uses QWERTY
};

/**
 * Map macOS input source identifiers to our layout IDs.
 * Input source IDs look like "com.apple.keylayout.US" or "com.apple.keylayout.German".
 * We extract the suffix after the last dot and match against known names.
 */
const inputSourceToLayoutMap: Record<string, ConcreteKeyboardLayoutId> = {
  'us': 'qwerty-us',
  'abc': 'qwerty-us',
  'usinternational-pc': 'qwerty-us',
  'usenglish': 'qwerty-us',
  'british': 'qwerty-uk',
  'british-pc': 'qwerty-uk',
  'german': 'qwerty-de',
  'german-dingraphswiss': 'qwerty-de',
  'austrian': 'qwerty-de',
  'swiss': 'qwerty-de',
  'swissgerman': 'qwerty-de',
  'french': 'azerty-fr',
  'french-pc': 'azerty-fr',
  'belgian': 'azerty-fr',
  'dvorak': 'dvorak',
  'dvorak-left': 'dvorak',
  'dvorak-right': 'dvorak',
  'dvzine': 'dvorak',
  'colemak': 'colemak',
};

/**
 * Attempt to detect the keyboard layout.
 * Returns a concrete layout ID, or null if detection fails.
 */
export async function detectKeyboardLayout(): Promise<ConcreteKeyboardLayoutId | null> {
  // Strategy 1: Tauri native command (macOS)
  const tauriResult = await detectViaTauri();
  if (tauriResult) return tauriResult;

  // Strategy 2: Web Keyboard API (Chromium)
  const apiResult = await detectViaKeyboardAPI();
  if (apiResult) return apiResult;

  // Strategy 3: Locale fallback
  return detectViaLocale();
}

/**
 * Use Tauri invoke to get the macOS keyboard input source.
 * Returns null in non-Tauri environments.
 */
async function detectViaTauri(): Promise<ConcreteKeyboardLayoutId | null> {
  try {
    if (typeof window === 'undefined' || !('__TAURI__' in window)) {
      return null;
    }

    const { invoke } = await import('@tauri-apps/api/core');
    const inputSource: string | null = await invoke('get_keyboard_input_source');

    if (!inputSource) return null;

    return mapInputSourceToLayout(inputSource);
  } catch {
    return null;
  }
}

/**
 * Map a macOS input source identifier to a concrete layout ID.
 * e.g. "com.apple.keylayout.German" → "qwerty-de"
 */
export function mapInputSourceToLayout(inputSource: string): ConcreteKeyboardLayoutId | null {
  // Extract the suffix: "com.apple.keylayout.German" → "german"
  const parts = inputSource.split('.');
  const suffix = parts[parts.length - 1].toLowerCase();

  if (suffix in inputSourceToLayoutMap) {
    return inputSourceToLayoutMap[suffix];
  }

  // Try partial matching for compound names like "German-DIN...."
  for (const [key, layout] of Object.entries(inputSourceToLayoutMap)) {
    if (suffix.startsWith(key) || suffix.includes(key)) {
      return layout;
    }
  }

  return null;
}

/**
 * Use navigator.keyboard.getLayoutMap() to probe actual physical key mappings.
 * Available in Chromium-based browsers (Chrome, Edge, Tauri on Linux/Windows).
 * NOT available in WebKit (macOS Tauri, Safari).
 */
async function detectViaKeyboardAPI(): Promise<ConcreteKeyboardLayoutId | null> {
  try {
    if (
      typeof navigator === 'undefined' ||
      !('keyboard' in navigator) ||
      !(navigator as NavigatorWithKeyboard).keyboard?.getLayoutMap
    ) {
      return null;
    }

    const layoutMap = await (navigator as NavigatorWithKeyboard).keyboard!.getLayoutMap();

    // Probe distinguishing physical key codes:
    const keyS = layoutMap.get('KeyS');
    const keyD = layoutMap.get('KeyD');
    const keyF = layoutMap.get('KeyF');
    const keyQ = layoutMap.get('KeyQ');
    const keyA = layoutMap.get('KeyA');
    const keyY = layoutMap.get('KeyY');
    const keyZ = layoutMap.get('KeyZ');

    // Dvorak: home row S→o, D→e, F→u
    if (keyS === 'o' && keyD === 'e' && keyF === 'u') {
      return 'dvorak';
    }

    // Colemak: home row S→r, D→s, F→t
    if (keyS === 'r' && keyD === 's' && keyF === 't') {
      return 'colemak';
    }

    // AZERTY: Q→a, A→q
    if (keyQ === 'a' && keyA === 'q') {
      return 'azerty-fr';
    }

    // QWERTZ: Y→z, Z→y
    if (keyY === 'z' && keyZ === 'y') {
      return 'qwerty-de';
    }

    // US vs UK QWERTY: same physical layout, distinguish by locale
    if (keyQ === 'q' && keyY === 'y') {
      const lang = (navigator.language ?? '').toLowerCase();
      if (lang.startsWith('en-gb')) return 'qwerty-uk';
      return 'qwerty-us';
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fallback: guess layout from navigator.language.
 */
export function detectViaLocale(): ConcreteKeyboardLayoutId | null {
  if (typeof navigator === 'undefined' || !navigator.language) return null;

  const lang = navigator.language;

  // Try exact match (e.g. 'en-GB')
  if (lang in localeToLayoutMap) {
    return localeToLayoutMap[lang];
  }

  // Try language prefix (e.g. 'de' from 'de-DE')
  const prefix = lang.split('-')[0];
  if (prefix in localeToLayoutMap) {
    return localeToLayoutMap[prefix];
  }

  return null;
}

// TypeScript declaration for the experimental Keyboard API
interface NavigatorWithKeyboard extends Navigator {
  keyboard?: {
    getLayoutMap(): Promise<Map<string, string>>;
  };
}
