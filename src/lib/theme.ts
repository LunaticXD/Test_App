import type { ThemeMode } from '../types';

export const THEME_ORDER: ThemeMode[] = ['cyberpunk', 'synthwave', 'matrix', 'obsidian', 'solar'];

export const THEME_LABELS: Record<ThemeMode, string> = {
  cyberpunk: 'Cyberpunk',
  synthwave: 'Synthwave',
  matrix: 'Matrix',
  obsidian: 'Obsidian',
  solar: 'Solar',
};

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && (THEME_ORDER as string[]).includes(value);
}

/** The theme after `current` in the cycle (wraps around). */
export function nextTheme(current: ThemeMode): ThemeMode {
  const idx = THEME_ORDER.indexOf(current);
  return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
}

/** Read the active theme's accent colours from CSS variables (for canvas / confetti). */
export function getThemeColors(): { accent: string; secondary: string; tertiary: string } {
  const fallback = { accent: '#fcee0a', secondary: '#00f0ff', tertiary: '#ff0055' };
  if (typeof document === 'undefined') return fallback;
  const cs = getComputedStyle(document.documentElement);
  const read = (name: string, dflt: string) => cs.getPropertyValue(name).trim() || dflt;
  return {
    accent: read('--accent', fallback.accent),
    secondary: read('--secondary', fallback.secondary),
    tertiary: read('--tertiary', fallback.tertiary),
  };
}
