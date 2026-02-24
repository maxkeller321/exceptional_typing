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
    expect(mapInputSourceToLayout('com.apple.keylayout.Belgian')).toBe('azerty-fr');
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

  it('returns null for unknown input source', () => {
    expect(mapInputSourceToLayout('com.apple.keylayout.Japanese')).toBeNull();
  });

  it('returns null for non-Apple input source', () => {
    expect(mapInputSourceToLayout('com.google.inputmethod.Japanese')).toBeNull();
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
});
