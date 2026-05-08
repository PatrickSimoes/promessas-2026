export type Category = 'Saúde' | 'Carreira' | 'Finanças' | 'Pessoal';

export const CATEGORIES: Category[] = ['Saúde', 'Carreira', 'Finanças', 'Pessoal'];

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
