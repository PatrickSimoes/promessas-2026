export type Category = 'Saúde' | 'Carreira' | 'Finanças' | 'Pessoal';

export const CATEGORIES: Category[] = ['Saúde', 'Carreira', 'Finanças', 'Pessoal'];

export type CategoryFilter = Category | 'Todas';

export const CATEGORY_FILTERS: CategoryFilter[] = ['Todas', ...CATEGORIES];

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
