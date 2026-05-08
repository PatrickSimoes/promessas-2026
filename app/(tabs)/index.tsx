import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionSheet, ActionSheetAction } from '../../src/components/action-sheet';
import { AdBanner } from '../../src/components/ad-banner';
import { EditModal } from '../../src/components/edit-modal';
import { PromiseCard } from '../../src/components/promise-card';
import { SearchBar } from '../../src/components/search-bar';
import { usePromises } from '../../src/promises-context';
import { ThemeColors, useThemeColors } from '../../src/theme';
import { CATEGORY_FILTERS, Category, CategoryFilter, TITLE_MAX_LENGTH } from '../../src/types';
import { daysUntilNextYear, nextYearLabel, percentOfYearPassed } from '../../src/utils';

export default function PromisesScreen() {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const {
    items,
    expandedIds,
    addItem,
    toggleItem,
    updateItem,
    removeItem,
    addSubtask,
    toggleSubtask,
    removeSubtask,
    toggleExpanded,
  } = usePromises();

  const [text, setText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('Todas');
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  function submitNew() {
    const title = text.trim();
    if (!title) return;
    const category: Category = categoryFilter === 'Todas' ? 'Pessoal' : categoryFilter;
    addItem({ title, category });
    setText('');
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

  const daysLeft = daysUntilNextYear();
  const yearPct = percentOfYearPassed();
  const targetYear = nextYearLabel();

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byCategory =
      categoryFilter === 'Todas' ? items : items.filter((p) => p.category === categoryFilter);

    const bySearch = !q
      ? byCategory
      : byCategory.filter((p) => {
          if (p.title.toLowerCase().includes(q)) return true;
          if (p.category.toLowerCase().includes(q)) return true;
          return p.subtasks.some((s) => s.title.toLowerCase().includes(q));
        });

    return [...bySearch].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (a.done && b.done) return (b.completedAt ?? 0) - (a.completedAt ?? 0);
      return b.createdAt - a.createdAt;
    });
  }, [items, query, categoryFilter]);

  const menuItem = menuItemId ? (items.find((p) => p.id === menuItemId) ?? null) : null;
  const editingItem = editingItemId ? (items.find((p) => p.id === editingItemId) ?? null) : null;

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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex1}
      >
        <View style={styles.container}>
          <View style={styles.hero}>
            <Text style={styles.kicker}>
              ✨ {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'} até {targetYear} • {yearPct}% do ano
              vivido
            </Text>
            <Text style={styles.title}>Minhas Promessas</Text>
            <Text style={styles.subtitle}>
              {doneCount}/{total} concluídas • {progressPct}% • um passo por dia
            </Text>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
          </View>

          <View style={styles.chipsRow}>
            {CATEGORY_FILTERS.map((cat) => {
              const active = cat === categoryFilter;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategoryFilter(cat)}
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

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder={
                categoryFilter === 'Todas'
                  ? 'Ex: aprender inglês, viajar, cuidar de mim...'
                  : `Nova promessa em ${categoryFilter}...`
              }
              placeholderTextColor={c.muted}
              returnKeyType="done"
              onSubmitEditing={submitNew}
              maxLength={TITLE_MAX_LENGTH}
            />
            <Pressable
              onPress={submitNew}
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
          {text.length >= TITLE_MAX_LENGTH - 20 ? (
            <Text style={styles.charCount}>
              {text.length}/{TITLE_MAX_LENGTH}
            </Text>
          ) : null}

          <SearchBar
            value={query}
            onChange={setQuery}
            resultCount={visibleItems.length}
            totalCount={total}
          />

          <FlatList
            style={styles.flex1}
            data={visibleItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[
              styles.listContent,
              visibleItems.length === 0 && styles.listEmpty,
            ]}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              query.trim() ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyTitle}>Nada encontrado</Text>
                  <Text style={styles.emptyText}>
                    Nenhuma promessa combina com &quot;{query.trim()}&quot;.
                  </Text>
                </View>
              ) : categoryFilter !== 'Todas' && total > 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyTitle}>Sem promessas em {categoryFilter}</Text>
                  <Text style={styles.emptyText}>
                    Escolha &quot;Todas&quot; ou comece uma promessa nova nesta categoria.
                  </Text>
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyTitle}>Começa leve</Text>
                  <Text style={styles.emptyText}>
                    Escolha uma categoria e escreva uma promessa para o próximo ano.
                  </Text>
                </View>
              )
            }
            renderItem={({ item }) => (
              <PromiseCard
                item={item}
                expanded={expandedIds.has(item.id)}
                onToggleExpanded={toggleExpanded}
                onToggle={toggleItem}
                onOpenMenu={setMenuItemId}
                onAddSubtask={addSubtask}
                onToggleSubtask={toggleSubtask}
                onRequestDeleteSubtask={confirmRemoveSubtask}
              />
            )}
          />

          <AdBanner />
        </View>
      </KeyboardAvoidingView>

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
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    flex1: { flex: 1 },
    container: { flex: 1, padding: 16, gap: 12 },

    hero: {
      backgroundColor: c.hero,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    kicker: { color: c.muted, fontWeight: '700' },
    title: { color: c.text, fontSize: 22, fontWeight: '800', marginTop: 6 },
    subtitle: { color: c.muted, marginTop: 6 },

    progressTrack: {
      height: 10,
      borderRadius: 999,
      backgroundColor: c.card2,
      borderWidth: 1,
      borderColor: c.border,
      marginTop: 12,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: 999, backgroundColor: c.brandStrong },

    chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card2,
    },
    chipActive: {
      backgroundColor: 'rgba(167,139,250,0.18)',
      borderColor: 'rgba(167,139,250,0.35)',
    },
    chipText: { color: c.muted, fontWeight: '700' },
    chipTextActive: { color: c.text },

    inputWrap: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    input: {
      flex: 1,
      height: 46,
      borderRadius: 14,
      paddingHorizontal: 14,
      color: c.text,
      backgroundColor: c.card2,
      borderWidth: 1,
      borderColor: c.border,
    },
    addButton: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: c.brand,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonDisabled: { backgroundColor: 'rgba(167,139,250,0.25)' },
    addButtonText: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
    charCount: {
      color: c.mutedSoft,
      fontSize: 11,
      fontWeight: '700',
      textAlign: 'right',
      marginTop: -4,
    },

    listContent: { paddingTop: 6, paddingBottom: 12 },
    listEmpty: { flexGrow: 1, justifyContent: 'center' },

    emptyBox: {
      backgroundColor: c.card2,
      borderRadius: 18,
      padding: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    emptyTitle: { color: c.text, fontSize: 16, fontWeight: '800' },
    emptyText: { color: c.muted, marginTop: 6, lineHeight: 18 },

    pressed: { opacity: 0.9 },
  });
}
