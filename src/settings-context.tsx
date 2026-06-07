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
import { CategoryDef, DEFAULT_CATEGORIES, FALLBACK_CATEGORY_COLOR } from './types';

export type ThemePref = 'dark' | 'light' | 'system';

const THEME_KEY = '@promessas/theme';
const CATEGORIES_KEY = '@promessas/categories';

type Ctx = {
  themePref: ThemePref;
  setThemePref: (pref: ThemePref) => void;

  /** Default categories followed by the user-created ones. */
  categories: CategoryDef[];
  addCategory: (name: string, color: string) => void;
  removeCategory: (name: string) => void;
  categoryColor: (name: string) => string;
  isDefaultCategory: (name: string) => boolean;
};

const SettingsContext = createContext<Ctx | null>(null);

const DEFAULT_NAMES = new Set(DEFAULT_CATEGORIES.map((c) => c.name.toLowerCase()));

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Default to dark immediately so there's no flash to light before hydration.
  const [themePref, setThemePrefState] = useState<ThemePref>('dark');
  const [customCategories, setCustomCategories] = useState<CategoryDef[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([AsyncStorage.getItem(THEME_KEY), AsyncStorage.getItem(CATEGORIES_KEY)]).then(
      ([rawTheme, rawCategories]) => {
        if (!mounted) return;
        if (rawTheme === 'dark' || rawTheme === 'light' || rawTheme === 'system') {
          setThemePrefState(rawTheme);
        }
        if (rawCategories) {
          try {
            const parsed = JSON.parse(rawCategories) as CategoryDef[];
            if (Array.isArray(parsed)) {
              setCustomCategories(
                parsed.filter(
                  (c) => c && typeof c.name === 'string' && typeof c.color === 'string',
                ),
              );
            }
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
    AsyncStorage.setItem(THEME_KEY, themePref);
  }, [themePref, isHydrating]);

  useEffect(() => {
    if (isHydrating) return;
    AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(customCategories));
  }, [customCategories, isHydrating]);

  const setThemePref = useCallback((pref: ThemePref) => setThemePrefState(pref), []);

  const categories = useMemo<CategoryDef[]>(
    () => [...DEFAULT_CATEGORIES, ...customCategories],
    [customCategories],
  );

  const isDefaultCategory = useCallback(
    (name: string) => DEFAULT_NAMES.has(name.trim().toLowerCase()),
    [],
  );

  const addCategory = useCallback((name: string, color: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const lower = trimmed.toLowerCase();
    setCustomCategories((prev) => {
      if (DEFAULT_NAMES.has(lower)) return prev;
      if (prev.some((c) => c.name.toLowerCase() === lower)) return prev;
      return [...prev, { name: trimmed, color }];
    });
  }, []);

  const removeCategory = useCallback((name: string) => {
    const lower = name.trim().toLowerCase();
    if (DEFAULT_NAMES.has(lower)) return;
    setCustomCategories((prev) => prev.filter((c) => c.name.toLowerCase() !== lower));
  }, []);

  const categoryColor = useCallback(
    (name: string) => {
      const found = categories.find((c) => c.name === name);
      return found?.color ?? FALLBACK_CATEGORY_COLOR;
    },
    [categories],
  );

  const value = useMemo<Ctx>(
    () => ({
      themePref,
      setThemePref,
      categories,
      addCategory,
      removeCategory,
      categoryColor,
      isDefaultCategory,
    }),
    [
      themePref,
      setThemePref,
      categories,
      addCategory,
      removeCategory,
      categoryColor,
      isDefaultCategory,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
