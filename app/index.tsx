import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ActionSheet, ActionSheetAction } from './components/action-sheet';
import { EditModal, EditModalSubmit } from './components/edit-modal';
import { PromiseCard } from './components/promise-card';
import { COLORS } from './theme';
import { CATEGORIES, Category, PromiseItem, Subtask } from './types';

const STORAGE_KEY = '@promessas/items';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Index() {
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Pessoal');
  const [items, setItems] = useState<PromiseItem[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);

  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!mounted) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as PromiseItem[];
          setItems(parsed.map(migrateItem));
        } catch {
          // ignore corrupted cache
        }
      }
      setIsHydrating(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isHydrating) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrating]);

  function addItem() {
    const title = text.trim();
    if (!title) return;
    const newItem: PromiseItem = {
      id: Date.now().toString(),
      title,
      done: false,
      category: selectedCategory,
      createdAt: Date.now(),
      subtasks: [],
    };
    setItems((prev) => [newItem, ...prev]);
    setText('');
  }

  function toggleItem(id: string) {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, done: !p.done, completedAt: !p.done ? Date.now() : undefined }
          : p,
      ),
    );
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  function updateItem(id: string, changes: EditModalSubmit) {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, title: changes.title, category: changes.category, deadline: changes.deadline }
          : p,
      ),
    );
  }

  function addSubtask(id: string, title: string) {
    const sub: Subtask = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      done: false,
      createdAt: Date.now(),
    };
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, subtasks: [...p.subtasks, sub] } : p)));
  }

  function toggleSubtask(id: string, subId: string) {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              subtasks: p.subtasks.map((s) =>
                s.id === subId
                  ? { ...s, done: !s.done, completedAt: !s.done ? Date.now() : undefined }
                  : s,
              ),
            }
          : p,
      ),
    );
  }

  function removeSubtask(id: string, subId: string) {
    setItems((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, subtasks: p.subtasks.filter((s) => s.id !== subId) } : p,
      ),
    );
  }

  function confirmRemoveItem(id: string) {
    const target = items.find((p) => p.id === id);
    if (!target) return;
    Alert.alert('Remover promessa?', `"${target.title}" será excluída para sempre.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removeItem(id) },
    ]);
  }

  function confirmRemoveSubtask(id: string, subId: string) {
    const parent = items.find((p) => p.id === id);
    const sub = parent?.subtasks.find((s) => s.id === subId);
    if (!sub) return;
    Alert.alert('Remover subtarefa?', `"${sub.title}" será excluída.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => removeSubtask(id, subId) },
    ]);
  }

  const doneCount = useMemo(() => items.filter((p) => p.done).length, [items]);
  const total = items.length;
  const progressPct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const menuItem = menuItemId ? items.find((p) => p.id === menuItemId) ?? null : null;
  const editingItem = editingItemId ? items.find((p) => p.id === editingItemId) ?? null : null;

  const menuActions: ActionSheetAction[] = menuItem
    ? [
        {
          key: 'edit',
          icon: '✏️',
          label: 'Editar',
          onPress: () => setEditingItemId(menuItem.id),
        },
        {
          key: 'toggle',
          icon: menuItem.done ? '↺' : '✓',
          label: menuItem.done ? 'Marcar como em progresso' : 'Marcar como feita',
          onPress: () => toggleItem(menuItem.id),
        },
        {
          key: 'delete',
          icon: '🗑',
          label: 'Remover',
          destructive: true,
          onPress: () => confirmRemoveItem(menuItem.id),
        },
      ]
    : [];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.container}>
          {/* HERO */}
          <View style={styles.hero}>
            <Text style={styles.kicker}>✨ Próximo ano</Text>
            <Text style={styles.title}>Minhas Promessas</Text>
            <Text style={styles.subtitle}>
              {doneCount}/{total} concluídas • {progressPct}% • um passo por dia
            </Text>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </View>

          {/* Chips */}
          <View style={styles.chipsRow}>
            {CATEGORIES.map((cat) => {
              const active = cat === selectedCategory;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={({ pressed }) => [
                    styles.chip,
                    active && styles.chipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Input */}
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Ex: aprender inglês, viajar, cuidar de mim..."
              placeholderTextColor={COLORS.muted}
              returnKeyType="done"
              onSubmitEditing={addItem}
            />
            <Pressable
              onPress={addItem}
              disabled={!text.trim()}
              style={({ pressed }) => [
                styles.addButton,
                !text.trim() && styles.addButtonDisabled,
                pressed && text.trim() && styles.pressed,
              ]}
            >
              <Text style={styles.addButtonText}>+</Text>
            </Pressable>
          </View>

          {/* Lista */}
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.listContent, items.length === 0 && styles.listEmpty]}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Começa leve</Text>
                <Text style={styles.emptyText}>
                  Escolha uma categoria e escreva uma promessa para o próximo ano.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <PromiseCard
                item={item}
                onToggle={toggleItem}
                onOpenMenu={setMenuItemId}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onRequestDeleteSubtask={confirmRemoveSubtask}
              />
            )}
          />

          <Text style={styles.hint}>
            Toque o card para expandir • ⋮ abre as ações
          </Text>
        </View>

        <ActionSheet
          visible={menuItem !== null}
          title={menuItem?.title}
          actions={menuActions}
          onClose={() => setMenuItemId(null)}
        />

        <EditModal
          visible={editingItem !== null}
          item={editingItem}
          onClose={() => setEditingItemId(null)}
          onSubmit={(changes) => {
            if (editingItem) updateItem(editingItem.id, changes);
            setEditingItemId(null);
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, padding: 16, gap: 12 },

  hero: {
    backgroundColor: COLORS.hero,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kicker: { color: COLORS.muted, fontWeight: '700' },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginTop: 6 },
  subtitle: { color: COLORS.muted, marginTop: 6 },

  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: COLORS.brandStrong },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chipActive: {
    backgroundColor: 'rgba(167,139,250,0.18)',
    borderColor: 'rgba(167,139,250,0.35)',
  },
  chipText: { color: COLORS.muted, fontWeight: '700' },
  chipTextActive: { color: COLORS.text },

  inputWrap: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    paddingHorizontal: 14,
    color: COLORS.text,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(167,139,250,0.85)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: { backgroundColor: 'rgba(167,139,250,0.25)' },
  addButtonText: { color: COLORS.text, fontSize: 22, fontWeight: '900' },

  listContent: { paddingTop: 6, paddingBottom: 12 },
  listEmpty: { flexGrow: 1, justifyContent: 'center' },

  emptyBox: {
    backgroundColor: COLORS.card2,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  emptyText: { color: COLORS.muted, marginTop: 6, lineHeight: 18 },

  pressed: { opacity: 0.9 },
  hint: { textAlign: 'center', color: COLORS.muted, marginTop: 2, fontSize: 12 },
});
