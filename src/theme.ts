import { useColorScheme } from 'react-native';
import { Category } from './types';

export type ThemeColors = {
  bg: string;
  hero: string;
  card: string;
  card2: string;
  cardElevated: string;
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
  overlay: 'rgba(5,8,20,0.6)',
  tabBar: '#0E1430',
};

export const COLORS_LIGHT: ThemeColors = {
  bg: '#F4F5FB',
  hero: 'rgba(124,92,255,0.08)',
  card: '#FFFFFF',
  card2: '#FFFFFF',
  cardElevated: '#FFFFFF',
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
  overlay: 'rgba(11,16,32,0.45)',
  tabBar: '#FFFFFF',
};

export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'light' ? COLORS_LIGHT : COLORS_DARK;
}

/** @deprecated Prefer useThemeColors() inside components. Kept as a safe dark fallback for module-level styles. */
export const COLORS = COLORS_DARK;

export function getTagStyle(category: Category) {
  switch (category) {
    case 'Saúde':
      return { backgroundColor: 'rgba(52,211,153,0.14)', borderColor: 'rgba(52,211,153,0.28)' };
    case 'Carreira':
      return { backgroundColor: 'rgba(96,165,250,0.14)', borderColor: 'rgba(96,165,250,0.28)' };
    case 'Finanças':
      return { backgroundColor: 'rgba(251,191,36,0.14)', borderColor: 'rgba(251,191,36,0.28)' };
    case 'Pessoal':
    default:
      return { backgroundColor: 'rgba(244,114,182,0.14)', borderColor: 'rgba(244,114,182,0.28)' };
  }
}
