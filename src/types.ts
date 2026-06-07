/** A category is identified by its name. Defaults plus user-created ones live in the settings context. */
export type Category = string;

export type CategoryDef = { name: string; color: string };

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { name: 'Saúde', color: '#34D399' },
  { name: 'Carreira', color: '#60A5FA' },
  { name: 'Finanças', color: '#FBBF24' },
  { name: 'Pessoal', color: '#F472B6' },
];

/** Fallback color for a category that no longer exists (e.g. a removed custom one). */
export const FALLBACK_CATEGORY_COLOR = '#94A3B8';

/** Palette offered when creating a custom category. */
export const CATEGORY_PALETTE: string[] = [
  '#34D399',
  '#60A5FA',
  '#FBBF24',
  '#F472B6',
  '#A78BFA',
  '#F87171',
  '#22D3EE',
  '#FB923C',
  '#4ADE80',
  '#E879F9',
];

export const TITLE_MAX_LENGTH = 120;

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
  createdAt: number;
  completedAt?: number;
};

export type PromiseItem = {
  id: string;
  title: string;
  done: boolean;
  category: Category;
  createdAt: number;
  completedAt?: number;
  deadline?: number;
  subtasks: Subtask[];
};
