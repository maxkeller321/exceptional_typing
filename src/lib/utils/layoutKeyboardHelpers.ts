/**
 * Layout-Aware Keyboard Helpers
 *
 * Builds finger maps, shift character sets, and full keyboard rows
 * from the layout data in data/layouts/index.ts. Replaces the hardcoded
 * QWERTY-only helpers that were previously inlined in VirtualKeyboard.svelte.
 */

import type { ConcreteKeyboardLayoutId } from '../types';
import { getLayout, type KeyDefinition } from '../data/layouts';

export interface VirtualKeyDef {
  key: string;
  shift?: string;
  label?: string;
  width: number;
  finger?: number;
  home?: boolean;
  side?: string;
  half?: string;
}

// ── Finger Map ──────────────────────────────────────────────────────────

/**
 * Build a Record mapping every key (and its shift variant) to a finger number
 * for the given layout.
 */
export function buildFingerMap(layoutId: ConcreteKeyboardLayoutId): Record<string, number> {
  const layout = getLayout(layoutId);
  const map: Record<string, number> = {};
  for (const row of layout.rows) {
    for (const keyDef of row) {
      if (keyDef.finger) {
        map[keyDef.key] = keyDef.finger;
        if (keyDef.shift) {
          map[keyDef.shift] = keyDef.finger;
        }
      }
    }
  }
  return map;
}

const fingerMapCache = new Map<ConcreteKeyboardLayoutId, Record<string, number>>();

export function getCachedFingerMap(layoutId: ConcreteKeyboardLayoutId): Record<string, number> {
  let cached = fingerMapCache.get(layoutId);
  if (!cached) {
    cached = buildFingerMap(layoutId);
    fingerMapCache.set(layoutId, cached);
  }
  return cached;
}

// ── Shift Characters ────────────────────────────────────────────────────

/**
 * Collect the set of all characters that require Shift for a given layout.
 * A character needs Shift if it appears as a `shift` property on any KeyDefinition.
 */
export function buildShiftChars(layoutId: ConcreteKeyboardLayoutId): Set<string> {
  const layout = getLayout(layoutId);
  const shiftSet = new Set<string>();
  for (const row of layout.rows) {
    for (const keyDef of row) {
      if (keyDef.shift) {
        shiftSet.add(keyDef.shift);
      }
    }
  }
  return shiftSet;
}

const shiftCharsCache = new Map<ConcreteKeyboardLayoutId, Set<string>>();

export function getCachedShiftChars(layoutId: ConcreteKeyboardLayoutId): Set<string> {
  let cached = shiftCharsCache.get(layoutId);
  if (!cached) {
    cached = buildShiftChars(layoutId);
    shiftCharsCache.set(layoutId, cached);
  }
  return cached;
}

/**
 * Layout-aware shift check.
 */
export function needsShiftForLayout(char: string, layoutId: ConcreteKeyboardLayoutId): boolean {
  if (!char) return false;
  return getCachedShiftChars(layoutId).has(char);
}

// ── Full Keyboard Rows ──────────────────────────────────────────────────

function toVirtualKeys(defs: KeyDefinition[]): VirtualKeyDef[] {
  return defs.map((d) => ({
    key: d.key,
    shift: d.shift,
    label: d.label,
    width: d.width ?? 1,
    finger: d.finger,
    home: d.home,
  }));
}

/**
 * Build a full 5-row keyboard (character keys + modifier keys) for the
 * given layout. Layout data only has character rows; this function wraps
 * them with Backspace, Tab, CapsLock, Shift, Enter, and the bottom
 * modifier row.
 */
export function buildKeyboardRows(layoutId: ConcreteKeyboardLayoutId): VirtualKeyDef[][] {
  const layout = getLayout(layoutId);
  const [numberRow, topRow, homeRow, bottomRow, spaceRow] = layout.rows;

  const spaceFinger = spaceRow?.[0]?.finger ?? 5;

  return [
    // Row 0: number keys + Backspace
    [
      ...toVirtualKeys(numberRow),
      { key: 'Backspace', label: 'delete', width: 1.5 },
    ],

    // Row 1: Tab + top-row character keys
    [
      { key: 'Tab', label: 'tab', width: 1.5 },
      ...toVirtualKeys(topRow),
    ],

    // Row 2: CapsLock + home row + Enter
    [
      { key: 'CapsLock', label: 'caps lock', width: 1.75 },
      ...toVirtualKeys(homeRow),
      { key: 'Enter', label: 'return', width: 1.75 },
    ],

    // Row 3: Left Shift + bottom row + Right Shift
    [
      { key: 'Shift', label: 'shift', width: 2.25, side: 'left' },
      ...toVirtualKeys(bottomRow),
      { key: 'Shift', label: 'shift', width: 2.25, side: 'right' },
    ],

    // Row 4: modifiers + space + arrows (same for all layouts)
    [
      { key: 'fn', label: 'fn', width: 1 },
      { key: 'Control', label: 'control', width: 1 },
      { key: 'Alt', label: 'option', width: 1 },
      { key: 'Meta', label: 'command', width: 1.25 },
      { key: ' ', label: '', width: 5, finger: spaceFinger },
      { key: 'Meta', label: 'command', width: 1.25, side: 'right' },
      { key: 'Alt', label: 'option', width: 1, side: 'right' },
      { key: 'ArrowLeft', label: '\u25C0', width: 1 },
      { key: 'ArrowUp', label: '\u25B2', width: 0.5, half: 'top' },
      { key: 'ArrowDown', label: '\u25BC', width: 0.5, half: 'bottom' },
      { key: 'ArrowRight', label: '\u25B6', width: 1 },
    ],
  ];
}
