import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { detectKeyboardLayout, detectViaLocale, mapInputSourceToLayout } from './detectKeyboardLayout';

describe('detectKeyboardLayout', () => {
  // Save original navigator properties
  const originalLanguage = navigator.language;
  const originalKeyboard = (navigator as any).keyboard;

  beforeEach(() => {
    // Remove keyboard API by default (tests add it when needed)
    Object.defineProperty(navigator, 'keyboard', {
      value: undefined,
      configurable: true,
      writable: true,
    });
    // Ensure no __TAURI__ in test environment
    delete (window as any).__TAURI__;
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(navigator, 'language', {
      value: originalLanguage,
      configurable: true,
    });
    if (originalKeyboard !== undefined) {
      Object.defineProperty(navigator, 'keyboard', {
        value: originalKeyboard,
        configurable: true,
        writable: true,
      });
    }
    delete (window as any).__TAURI__;
  });

  describe('locale-based detection (fallback)', () => {
    it('detects qwerty-us for en-US locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-us');
    });

    it('detects qwerty-uk for en-GB locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-GB',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-uk');
    });

    it('detects qwerty-de for de-DE locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'de-DE',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-de');
    });

    it('detects qwerty-de for de locale prefix', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'de',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-de');
    });

    it('detects azerty-fr for fr-FR locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-FR',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('azerty-fr');
    });

    it('detects azerty-fr for fr locale prefix', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('azerty-fr');
    });

    it('detects qwerty-us for en locale prefix', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'en',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-us');
    });

    it('returns null for unsupported locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'ja-JP',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBeNull();
    });

    it('detects qwerty-us for fr-CA (French Canadian uses QWERTY)', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-CA',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-us');
    });

    it('detects qwerty-es for es-ES locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'es-ES',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-es');
    });

    it('detects qwerty-es for es locale prefix', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'es',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-es');
    });

    it('detects qwerty-it for it-IT locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'it-IT',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-it');
    });

    it('detects qwerty-pt for pt-PT locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'pt-PT',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-pt');
    });

    it('detects qwerty-pt for pt-BR locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'pt-BR',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-pt');
    });

    it('detects qwerty-se for sv-SE locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'sv-SE',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-se');
    });

    it('detects qwerty-se for sv locale prefix', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'sv',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-se');
    });

    it('detects qwerty-no for nb-NO locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'nb-NO',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-no');
    });

    it('detects qwerty-no for no locale prefix', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'no',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-no');
    });

    it('detects qwerty-dk for da-DK locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'da-DK',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-dk');
    });

    it('detects qwerty-dk for da locale prefix', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'da',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-dk');
    });

    it('detects qwerty-tr for tr-TR locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'tr-TR',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-tr');
    });

    it('detects azerty-be for fr-BE locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-BE',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('azerty-be');
    });

    it('detects qwerty-ch-fr for fr-CH locale', async () => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-CH',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-ch-fr');
    });
  });

  describe('Keyboard API detection', () => {
    function mockKeyboardAPI(keyMap: Record<string, string>) {
      const layoutMap = new Map(Object.entries(keyMap));
      Object.defineProperty(navigator, 'keyboard', {
        value: {
          getLayoutMap: () => Promise.resolve(layoutMap),
        },
        configurable: true,
        writable: true,
      });
    }

    it('detects QWERTZ when KeyY=z and KeyZ=y', async () => {
      mockKeyboardAPI({
        KeyY: 'z', KeyZ: 'y', KeyQ: 'q', KeyA: 'a',
        KeyS: 's', KeyD: 'd', KeyF: 'f',
      });
      Object.defineProperty(navigator, 'language', {
        value: 'de-DE',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-de');
    });

    it('detects Swiss French QWERTZ when KeyY=z, KeyZ=y and fr-CH locale', async () => {
      mockKeyboardAPI({
        KeyY: 'z', KeyZ: 'y', KeyQ: 'q', KeyA: 'a',
        KeyS: 's', KeyD: 'd', KeyF: 'f',
      });
      Object.defineProperty(navigator, 'language', {
        value: 'fr-CH',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-ch-fr');
    });

    it('detects Dvorak when home row is aoeu', async () => {
      mockKeyboardAPI({
        KeyS: 'o', KeyD: 'e', KeyF: 'u',
        KeyY: 'f', KeyZ: ';', KeyQ: "'", KeyA: 'a',
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('dvorak');
    });

    it('detects Colemak when home row is arst', async () => {
      mockKeyboardAPI({
        KeyS: 'r', KeyD: 's', KeyF: 't',
        KeyY: 'j', KeyZ: 'z', KeyQ: 'q', KeyA: 'a',
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('colemak');
    });

    it('detects AZERTY when KeyQ=a and KeyA=q', async () => {
      mockKeyboardAPI({
        KeyQ: 'a', KeyA: 'q',
        KeyS: 's', KeyD: 'd', KeyF: 'f',
        KeyY: 'y', KeyZ: 'w',
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('azerty-fr');
    });

    it('detects AZERTY Belgian when KeyQ=a and KeyA=q with fr-BE locale', async () => {
      mockKeyboardAPI({
        KeyQ: 'a', KeyA: 'q',
        KeyS: 's', KeyD: 'd', KeyF: 'f',
        KeyY: 'y', KeyZ: 'w',
      });
      Object.defineProperty(navigator, 'language', {
        value: 'fr-BE',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('azerty-be');
    });

    it('detects qwerty-uk for QWERTY layout with en-GB locale', async () => {
      mockKeyboardAPI({
        KeyQ: 'q', KeyA: 'a',
        KeyS: 's', KeyD: 'd', KeyF: 'f',
        KeyY: 'y', KeyZ: 'z',
      });
      Object.defineProperty(navigator, 'language', {
        value: 'en-GB',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-uk');
    });

    it('detects qwerty-us for QWERTY layout with en-US locale', async () => {
      mockKeyboardAPI({
        KeyQ: 'q', KeyA: 'a',
        KeyS: 's', KeyD: 'd', KeyF: 'f',
        KeyY: 'y', KeyZ: 'z',
      });
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-us');
    });

    it('detects Spanish QWERTY via Semicolon=ñ', async () => {
      mockKeyboardAPI({
        KeyQ: 'q', KeyA: 'a',
        KeyS: 's', KeyD: 'd', KeyF: 'f',
        KeyY: 'y', KeyZ: 'z',
        Semicolon: 'ñ',
      });
      Object.defineProperty(navigator, 'language', {
        value: 'es-ES',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-es');
    });

    it('detects Italian QWERTY via Semicolon=ò', async () => {
      mockKeyboardAPI({
        KeyQ: 'q', KeyA: 'a',
        KeyS: 's', KeyD: 'd', KeyF: 'f',
        KeyY: 'y', KeyZ: 'z',
        Semicolon: 'ò',
      });
      Object.defineProperty(navigator, 'language', {
        value: 'it-IT',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-it');
    });

    it('detects Swedish QWERTY via Semicolon=ö and sv locale', async () => {
      mockKeyboardAPI({
        KeyQ: 'q', KeyA: 'a',
        KeyS: 's', KeyD: 'd', KeyF: 'f',
        KeyY: 'y', KeyZ: 'z',
        Semicolon: 'ö',
      });
      Object.defineProperty(navigator, 'language', {
        value: 'sv-SE',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-se');
    });

    it('detects Norwegian QWERTY via Semicolon=ø', async () => {
      mockKeyboardAPI({
        KeyQ: 'q', KeyA: 'a',
        KeyS: 's', KeyD: 'd', KeyF: 'f',
        KeyY: 'y', KeyZ: 'z',
        Semicolon: 'ø',
      });
      Object.defineProperty(navigator, 'language', {
        value: 'nb-NO',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-no');
    });

    it('detects Danish QWERTY via Semicolon=æ', async () => {
      mockKeyboardAPI({
        KeyQ: 'q', KeyA: 'a',
        KeyS: 's', KeyD: 'd', KeyF: 'f',
        KeyY: 'y', KeyZ: 'z',
        Semicolon: 'æ',
      });
      Object.defineProperty(navigator, 'language', {
        value: 'da-DK',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('qwerty-dk');
    });

    it('falls back to locale when Keyboard API fails', async () => {
      Object.defineProperty(navigator, 'keyboard', {
        value: {
          getLayoutMap: () => Promise.reject(new Error('Not supported')),
        },
        configurable: true,
        writable: true,
      });
      Object.defineProperty(navigator, 'language', {
        value: 'fr-FR',
        configurable: true,
      });
      const result = await detectKeyboardLayout();
      expect(result).toBe('azerty-fr');
    });
  });
});

describe('mapInputSourceToLayout', () => {
  // macOS input sources
  it('maps US keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.US')).toBe('qwerty-us');
  });

  it('maps ABC keyboard (default macOS)', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.ABC')).toBe('qwerty-us');
  });

  it('maps German keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.German')).toBe('qwerty-de');
  });

  it('maps Austrian keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.Austrian')).toBe('qwerty-de');
  });

  it('maps Swiss German keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.SwissGerman')).toBe('qwerty-de');
  });

  it('maps French keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.French')).toBe('azerty-fr');
  });

  it('maps French-PC keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.French-PC')).toBe('azerty-fr');
  });

  it('maps Belgian keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.Belgian')).toBe('azerty-be');
  });

  it('maps British keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.British')).toBe('qwerty-uk');
  });

  it('maps British-PC keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.British-PC')).toBe('qwerty-uk');
  });

  it('maps Dvorak keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.Dvorak')).toBe('dvorak');
  });

  it('maps Colemak keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.Colemak')).toBe('colemak');
  });

  it('maps US International PC keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.USInternational-PC')).toBe('qwerty-us');
  });

  it('maps Spanish keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.Spanish')).toBe('qwerty-es');
  });

  it('maps Italian keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.Italian')).toBe('qwerty-it');
  });

  it('maps Portuguese keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.Portuguese')).toBe('qwerty-pt');
  });

  it('maps Brazilian keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.Brazilian')).toBe('qwerty-pt');
  });

  it('maps Swedish keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.Swedish')).toBe('qwerty-se');
  });

  it('maps Norwegian keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.Norwegian')).toBe('qwerty-no');
  });

  it('maps Danish keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.Danish')).toBe('qwerty-dk');
  });

  it('maps Turkish keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.Turkish')).toBe('qwerty-tr');
  });

  it('maps Swiss French keyboard', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.SwissFrench')).toBe('qwerty-ch-fr');
  });

  // Windows input sources
  it('maps Windows US English (0409)', () => {
    expect(mapInputSourceToLayout('windows:0409')).toBe('qwerty-us');
  });

  it('maps Windows UK English (0809)', () => {
    expect(mapInputSourceToLayout('windows:0809')).toBe('qwerty-uk');
  });

  it('maps Windows German (0407)', () => {
    expect(mapInputSourceToLayout('windows:0407')).toBe('qwerty-de');
  });

  it('maps Windows French (040c)', () => {
    expect(mapInputSourceToLayout('windows:040c')).toBe('azerty-fr');
  });

  it('maps Windows French Belgian (080c)', () => {
    expect(mapInputSourceToLayout('windows:080c')).toBe('azerty-be');
  });

  it('maps Windows French Swiss (100c)', () => {
    expect(mapInputSourceToLayout('windows:100c')).toBe('qwerty-ch-fr');
  });

  it('maps Windows Spanish (0c0a)', () => {
    expect(mapInputSourceToLayout('windows:0c0a')).toBe('qwerty-es');
  });

  it('maps Windows Italian (0410)', () => {
    expect(mapInputSourceToLayout('windows:0410')).toBe('qwerty-it');
  });

  it('maps Windows Portuguese Portugal (0816)', () => {
    expect(mapInputSourceToLayout('windows:0816')).toBe('qwerty-pt');
  });

  it('maps Windows Portuguese Brazil (0416)', () => {
    expect(mapInputSourceToLayout('windows:0416')).toBe('qwerty-pt');
  });

  it('maps Windows Swedish (041d)', () => {
    expect(mapInputSourceToLayout('windows:041d')).toBe('qwerty-se');
  });

  it('maps Windows Norwegian (0414)', () => {
    expect(mapInputSourceToLayout('windows:0414')).toBe('qwerty-no');
  });

  it('maps Windows Danish (0406)', () => {
    expect(mapInputSourceToLayout('windows:0406')).toBe('qwerty-dk');
  });

  it('maps Windows Turkish (041f)', () => {
    expect(mapInputSourceToLayout('windows:041f')).toBe('qwerty-tr');
  });

  it('maps Windows Dvorak', () => {
    expect(mapInputSourceToLayout('windows:dvorak')).toBe('dvorak');
  });

  it('returns null for unknown input source', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.Japanese')).toBeNull();
  });

  it('returns null for non-Apple input source', () => {
    expect(mapInputSourceToLayout('com.google.inputmethod.Japanese')).toBeNull();
  });

  it('returns null for unknown Windows layout', () => {
    expect(mapInputSourceToLayout('windows:9999')).toBeNull();
  });
});

describe('detectViaLocale', () => {
  const originalLanguage = navigator.language;

  afterEach(() => {
    Object.defineProperty(navigator, 'language', {
      value: originalLanguage,
      configurable: true,
    });
  });

  it('prefers exact locale match over prefix', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'en-GB',
      configurable: true,
    });
    expect(detectViaLocale()).toBe('qwerty-uk');
  });

  it('uses prefix when no exact match', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'de-CH',
      configurable: true,
    });
    expect(detectViaLocale()).toBe('qwerty-de');
  });

  it('returns null when navigator.language is empty', () => {
    Object.defineProperty(navigator, 'language', {
      value: '',
      configurable: true,
    });
    expect(detectViaLocale()).toBeNull();
  });

  it('detects Spanish via es prefix', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'es-AR',
      configurable: true,
    });
    expect(detectViaLocale()).toBe('qwerty-es');
  });

  it('detects Italian via it prefix', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'it',
      configurable: true,
    });
    expect(detectViaLocale()).toBe('qwerty-it');
  });

  it('detects Portuguese via pt prefix', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'pt',
      configurable: true,
    });
    expect(detectViaLocale()).toBe('qwerty-pt');
  });

  it('detects Turkish via tr prefix', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'tr',
      configurable: true,
    });
    expect(detectViaLocale()).toBe('qwerty-tr');
  });

  it('detects Norwegian Nynorsk via nn-NO', () => {
    Object.defineProperty(navigator, 'language', {
      value: 'nn-NO',
      configurable: true,
    });
    expect(detectViaLocale()).toBe('qwerty-no');
  });
});
