import { Category } from './types';

export const COLORS = {
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
};

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
