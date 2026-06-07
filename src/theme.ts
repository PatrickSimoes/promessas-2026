import { useColorScheme } from 'react-native';
import { useSettings } from './settings-context';

export type ThemeColors = {
  bg: string;
  hero: string;
  card: string;
  card2: string;
  cardElevated: string;
  /** Solid (opaque) surface for modals/sheets so content behind doesn't bleed through. */
  sheet: string;
  border: string;
  borderStrong: string;
  text: string;
  muted: string;
  mutedSoft: string;
  brand: string;
  brandStrong: string;
  green: string;
  sun: string;
  blue: string;
  pink: string;
  red: string;
  overlay: string;
  tabBar: string;
};

export const COLORS_DARK: ThemeColors = {
  bg: '#0B1020',
  hero: 'rgba(124,92,255,0.10)',
  card: 'rgba(255,255,255,0.06)',
  card2: 'rgba(255,255,255,0.05)',
  cardElevated: 'rgba(255,255,255,0.09)',
  sheet: '#141A2E',
  border: 'rgba(255,255,255,0.10)',
  borderStrong: 'rgba(255,255,255,0.18)',
  text: '#F2F6FF',
  muted: 'rgba(242,246,255,0.65)',
  mutedSoft: 'rgba(242,246,255,0.45)',
  brand: '#A78BFA',
  brandStrong: '#7C5CFF',
  green: '#34D399',
  sun: '#FBBF24',
  blue: '#60A5FA',
  pink: '#F472B6',
  red: '#F87171',
  overlay: 'rgba(3,5,14,0.78)',
  tabBar: '#0E1430',
};

export const COLORS_LIGHT: ThemeColors = {
  bg: '#F4F5FB',
  hero: 'rgba(124,92,255,0.08)',
  card: '#FFFFFF',
  card2: '#FFFFFF',
  cardElevated: '#FFFFFF',
  sheet: '#FFFFFF',
  border: 'rgba(11,16,32,0.08)',
  borderStrong: 'rgba(11,16,32,0.18)',
  text: '#0B1020',
  muted: 'rgba(11,16,32,0.65)',
  mutedSoft: 'rgba(11,16,32,0.45)',
  brand: '#7C5CFF',
  brandStrong: '#5C3CFF',
  green: '#10B981',
  sun: '#F59E0B',
  blue: '#3B82F6',
  pink: '#DB2777',
  red: '#DC2626',
  overlay: 'rgba(11,16,32,0.55)',
  tabBar: '#FFFFFF',
};

export function useThemeColors(): ThemeColors {
  const system = useColorScheme();
  const { themePref } = useSettings();
  const effective = themePref === 'system' ? system : themePref;
  return effective === 'light' ? COLORS_LIGHT : COLORS_DARK;
}

/** @deprecated Prefer useThemeColors() inside components. Kept as a safe dark fallback for module-level styles. */
export const COLORS = COLORS_DARK;

/** Convert a #RRGGBB hex string into an rgba() string with the given alpha. */
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return `rgba(148,163,184,${alpha})`;
  }
  return `rgba(${r},${g},${b},${alpha})`;
}

/** Soft tinted background + border for a category tag, derived from its color. */
export function tagStyle(color: string) {
  return { backgroundColor: hexToRgba(color, 0.14), borderColor: hexToRgba(color, 0.28) };
}
