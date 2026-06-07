import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { tapLight, tapSuccess } from './haptics';
import { Category, PromiseItem, Subtask } from './types';

const STORAGE_KEY = '@promessas/items';
const EXPANDED_KEY = '@promessas/expanded';

type AddInput = { title: string; category: Category; deadline?: number };
type UpdateInput = { title: string; category: Category; deadline: number | undefined };

type Ctx = {
  items: PromiseItem[];
  isHydrating: boolean;
  expandedIds: Set<string>;

  addItem: (input: AddInput) => void;
  toggleItem: (id: string) => void;
  updateItem: (id: string, changes: UpdateInput) => void;
  removeItem: (id: string) => void;

  addSubtask: (id: string, title: string) => void;
  toggleSubtask: (id: string, subId: string) => void;
  removeSubtask: (id: string, subId: string) => void;

  toggleExpanded: (id: string) => void;
};

const PromisesContext = createContext<Ctx | null>(null);

export function PromisesProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PromiseItem[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(EXPANDED_KEY)]).then(
      ([rawItems, rawExpanded]) => {
        if (!mounted) return;
        if (rawItems) {
          try {
            const parsed = JSON.parse(rawItems) as PromiseItem[];
            setItems(parsed.map(migrateItem));
          } catch {
            // ignore corrupted cache
          }
        }
        if (rawExpanded) {
          try {
            const arr = JSON.parse(rawExpanded) as string[];
            if (Array.isArray(arr)) setExpandedIds(new Set(arr));
          } catch {
            // ignore corrupted cache
          }
        }
        setIsHydrating(false);
      },
    );
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isHydrating) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrating]);

  useEffect(() => {
    if (isHydrating) return;
    AsyncStorage.setItem(EXPANDED_KEY, JSON.stringify(Array.from(expandedIds)));
  }, [expandedIds, isHydrating]);

  const addItem = useCallback(({ title, category, deadline }: AddInput) => {
    tapLight();
    const newItem: PromiseItem = {
      id: Date.now().toString(),
      title,
      done: false,
      category,
      createdAt: Date.now(),
      deadline,
      subtasks: [],
    };
    setItems((prev) => [newItem, ...prev]);
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const willBeDone = !p.done;
        if (willBeDone) tapSuccess();
        else tapLight();
        return { ...p, done: willBeDone, completedAt: willBeDone ? Date.now() : undefined };
      }),
    );
  }, []);

  const updateItem = useCallback((id: string, changes: UpdateInput) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, title: changes.title, category: changes.category, deadline: changes.deadline }
          : p,
      ),
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    setExpandedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const addSubtask = useCallback((id: string, title: string) => {
    const sub: Subtask = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      done: false,
      createdAt: Date.now(),
    };
    setItems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, subtasks: [...p.subtasks, sub] } : p)),
    );
  }, []);

  const toggleSubtask = useCallback((id: string, subId: string) => {
    setItems((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          subtasks: p.subtasks.map((s) => {
            if (s.id !== subId) return s;
            const willBeDone = !s.done;
            if (willBeDone) tapSuccess();
            else tapLight();
            return { ...s, done: willBeDone, completedAt: willBeDone ? Date.now() : undefined };
          }),
        };
      }),
    );
  }, []);

  const removeSubtask = useCallback((id: string, subId: string) => {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, subtasks: p.subtasks.filter((s) => s.id !== subId) } : p,
      ),
    );
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      items,
      isHydrating,
      expandedIds,
      addItem,
      toggleItem,
      updateItem,
      removeItem,
      addSubtask,
      toggleSubtask,
      removeSubtask,
      toggleExpanded,
    }),
    [
      items,
      isHydrating,
      expandedIds,
      addItem,
      toggleItem,
      updateItem,
      removeItem,
      addSubtask,
      toggleSubtask,
      removeSubtask,
      toggleExpanded,
    ],
  );

  return <PromisesContext.Provider value={value}>{children}</PromisesContext.Provider>;
}

export function usePromises() {
  const ctx = useContext(PromisesContext);
  if (!ctx) throw new Error('usePromises must be used inside PromisesProvider');
  return ctx;
}

function migrateItem(raw: PromiseItem): PromiseItem {
  return {
    id: raw.id,
    title: raw.title,
    done: !!raw.done,
    category: raw.category,
    createdAt: raw.createdAt ?? Date.now(),
    completedAt: raw.completedAt,
    deadline: raw.deadline,
    subtasks: Array.isArray(raw.subtasks)
      ? raw.subtasks.map((s) => ({
          id: s.id,
          title: s.title,
          done: !!s.done,
          createdAt: s.createdAt ?? Date.now(),
          completedAt: s.completedAt,
        }))
      : [],
  };
}
