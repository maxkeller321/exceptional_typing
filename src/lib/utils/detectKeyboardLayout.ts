/**
 * Keyboard Layout Auto-Detection
 *
 * Detects the user's physical keyboard layout using three strategies (in order):
 * 1. Tauri command (macOS: reads OS input source via Carbon API, Windows: HKL via Win32) — most reliable
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
  'fr-BE': 'azerty-be',
  'fr-CA': 'qwerty-us', // French Canadian uses QWERTY
  'fr-CH': 'qwerty-ch-fr',
  'es': 'qwerty-es',
  'es-ES': 'qwerty-es',
  'es-MX': 'qwerty-es',
  'es-AR': 'qwerty-es',
  'it': 'qwerty-it',
  'it-IT': 'qwerty-it',
  'it-CH': 'qwerty-it',
  'pt': 'qwerty-pt',
  'pt-PT': 'qwerty-pt',
  'pt-BR': 'qwerty-pt',
  'sv': 'qwerty-se',
  'sv-SE': 'qwerty-se',
  'nb': 'qwerty-no',
  'nb-NO': 'qwerty-no',
  'nn': 'qwerty-no',
  'nn-NO': 'qwerty-no',
  'no': 'qwerty-no',
  'da': 'qwerty-dk',
  'da-DK': 'qwerty-dk',
  'tr': 'qwerty-tr',
  'tr-TR': 'qwerty-tr',
};

/**
 * Map macOS input source identifiers to our layout IDs.
 * Input source IDs look like "com.apple.keylayout.US" or "com.apple.keylayout.German".
 * We extract the suffix after the last dot and match against known names.
 */
const inputSourceToLayoutMap: Record<string, ConcreteKeyboardLayoutId> = {
  // US / English
  'us': 'qwerty-us',
  'abc': 'qwerty-us',
  'usinternational-pc': 'qwerty-us',
  'usenglish': 'qwerty-us',
  // UK / British
  'british': 'qwerty-uk',
  'british-pc': 'qwerty-uk',
  // German / QWERTZ
  'german': 'qwerty-de',
  'german-dingraphswiss': 'qwerty-de',
  'austrian': 'qwerty-de',
  'swiss': 'qwerty-de',
  'swissgerman': 'qwerty-de',
  // French / AZERTY
  'french': 'azerty-fr',
  'french-pc': 'azerty-fr',
  'belgian': 'azerty-be',
  // Swiss French
  'swissfrench': 'qwerty-ch-fr',
  // Spanish
  'spanish': 'qwerty-es',
  'spanish-iso': 'qwerty-es',
  // Italian
  'italian': 'qwerty-it',
  'italian-pro': 'qwerty-it',
  // Portuguese
  'portuguese': 'qwerty-pt',
  'brazilian': 'qwerty-pt',
  'brazilian-pro': 'qwerty-pt',
  // Swedish
  'swedish': 'qwerty-se',
  'swedish-pro': 'qwerty-se',
  // Norwegian
  'norwegian': 'qwerty-no',
  'norwegianextended': 'qwerty-no',
  // Danish
  'danish': 'qwerty-dk',
  // Turkish
  'turkish': 'qwerty-tr',
  'turkish-qwerty': 'qwerty-tr',
  'turkish-qwerty-pc': 'qwerty-tr',
  // Dvorak
  'dvorak': 'dvorak',
  'dvorak-left': 'dvorak',
  'dvorak-right': 'dvorak',
  'dvzine': 'dvorak',
  // Colemak
  'colemak': 'colemak',
};

/**
 * Map Windows keyboard layout language IDs (from HKL low word) to our layout IDs.
 * The Tauri command on Windows returns strings like "windows:0409".
 */
const windowsLayoutMap: Record<string, ConcreteKeyboardLayoutId> = {
  'windows:0409': 'qwerty-us',    // English (US)
  'windows:0809': 'qwerty-uk',    // English (UK)
  'windows:0c09': 'qwerty-us',    // English (Australia)
  'windows:1009': 'qwerty-us',    // English (Canada)
  'windows:1809': 'qwerty-uk',    // English (Ireland)
  'windows:0407': 'qwerty-de',    // German (Germany)
  'windows:0c07': 'qwerty-de',    // German (Austria)
  'windows:0807': 'qwerty-de',    // German (Switzerland) — maps to German QWERTZ
  'windows:040c': 'azerty-fr',    // French (France)
  'windows:080c': 'azerty-be',    // French (Belgium)
  'windows:100c': 'qwerty-ch-fr', // French (Switzerland)
  'windows:0c0c': 'qwerty-us',    // French (Canada) — uses QWERTY
  'windows:0c0a': 'qwerty-es',    // Spanish (Spain, international sort)
  'windows:040a': 'qwerty-es',    // Spanish (Spain, traditional sort)
  'windows:080a': 'qwerty-es',    // Spanish (Mexico)
  'windows:2c0a': 'qwerty-es',    // Spanish (Argentina)
  'windows:0410': 'qwerty-it',    // Italian (Italy)
  'windows:0810': 'qwerty-it',    // Italian (Switzerland)
  'windows:0816': 'qwerty-pt',    // Portuguese (Portugal)
  'windows:0416': 'qwerty-pt',    // Portuguese (Brazil)
  'windows:041d': 'qwerty-se',    // Swedish
  'windows:0414': 'qwerty-no',    // Norwegian (Bokmål)
  'windows:0814': 'qwerty-no',    // Norwegian (Nynorsk)
  'windows:0406': 'qwerty-dk',    // Danish
  'windows:041f': 'qwerty-tr',    // Turkish
  'windows:dvorak': 'dvorak',     // Dvorak (detected by layout handle)
};

/**
 * Attempt to detect the keyboard layout.
 * Returns a concrete layout ID, or null if detection fails.
 */
export async function detectKeyboardLayout(): Promise<ConcreteKeyboardLayoutId | null> {
  // Strategy 1: Tauri native command (macOS + Windows)
  const tauriResult = await detectViaTauri();
  if (tauriResult) return tauriResult;

  // Strategy 2: Web Keyboard API (Chromium)
  const apiResult = await detectViaKeyboardAPI();
  if (apiResult) return apiResult;

  // Strategy 3: Locale fallback
  return detectViaLocale();
}

/**
 * Use Tauri invoke to get the keyboard input source.
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
 * Map an input source identifier to a concrete layout ID.
 * Handles both macOS ("com.apple.keylayout.German") and Windows ("windows:0407") formats.
 */
export function mapInputSourceToLayout(inputSource: string): ConcreteKeyboardLayoutId | null {
  // Windows format: "windows:XXXX"
  if (inputSource.startsWith('windows:')) {
    const key = inputSource.toLowerCase();
    if (key in windowsLayoutMap) {
      return windowsLayoutMap[key];
    }
    return null;
  }

  // macOS format: extract the suffix after the last dot
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
    const keySemicolon = layoutMap.get('Semicolon');

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
      // Distinguish French vs Belgian AZERTY via locale
      const lang = (navigator.language ?? '').toLowerCase();
      if (lang.startsWith('fr-be') || lang === 'nl-be') return 'azerty-be';
      return 'azerty-fr';
    }

    // QWERTZ: Y→z, Z→y
    if (keyY === 'z' && keyZ === 'y') {
      const lang = (navigator.language ?? '').toLowerCase();
      if (lang.startsWith('fr-ch')) return 'qwerty-ch-fr';
      return 'qwerty-de';
    }

    // QWERTY variants: Q→q, Y→y — distinguish by locale and special keys
    if (keyQ === 'q' && keyY === 'y') {
      const lang = (navigator.language ?? '').toLowerCase();

      // Turkish: semicolon position has 'ş'
      if (keySemicolon === 'ş' || lang.startsWith('tr')) {
        if (keySemicolon === 'ş') return 'qwerty-tr';
      }

      // Nordic: semicolon position has ö/ø/æ
      if (keySemicolon === 'ö' && (lang.startsWith('sv') || lang.startsWith('fi'))) return 'qwerty-se';
      if (keySemicolon === 'ø' && lang.startsWith('n')) return 'qwerty-no';
      if (keySemicolon === 'æ' && lang.startsWith('da')) return 'qwerty-dk';

      // Spanish: semicolon position has ñ
      if (keySemicolon === 'ñ') return 'qwerty-es';

      // Italian: semicolon position has ò
      if (keySemicolon === 'ò') return 'qwerty-it';

      // Portuguese: semicolon position has ç
      if (keySemicolon === 'ç' && lang.startsWith('pt')) return 'qwerty-pt';

      // UK vs US: same physical layout
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
