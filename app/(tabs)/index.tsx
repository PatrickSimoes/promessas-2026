import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionSheet, ActionSheetAction } from '../../src/components/action-sheet';
import { AdBanner } from '../../src/components/ad-banner';
import { EditModal, EditModalSubmit } from '../../src/components/edit-modal';
import { FilterSheet } from '../../src/components/filter-sheet';
import { PromiseCard } from '../../src/components/promise-card';
import { SearchBar } from '../../src/components/search-bar';
import { SettingsSheet } from '../../src/components/settings-sheet';
import { usePromises } from '../../src/promises-context';
import { useSettings } from '../../src/settings-context';
import { ThemeColors, useThemeColors } from '../../src/theme';
import { daysUntilNextYear, nextYearLabel, percentOfYearPassed } from '../../src/utils';

export default function PromisesScreen() {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { categories } = useSettings();
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

  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [menuItemId, setMenuItemId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  function toggleCategoryFilter(name: string) {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
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
      selectedCats.size === 0 ? items : items.filter((p) => selectedCats.has(p.category));

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
  }, [items, query, selectedCats]);

  const menuItem = menuItemId ? (items.find((p) => p.id === menuItemId) ?? null) : null;
  const editingItem = editingItemId ? (items.find((p) => p.id === editingItemId) ?? null) : null;
  const formVisible = creating || editingItem !== null;

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

  function handleFormSubmit(changes: EditModalSubmit) {
    if (editingItem) {
      updateItem(editingItem.id, changes);
    } else {
      addItem(changes);
    }
    setEditingItemId(null);
    setCreating(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            hitSlop={10}
            style={({ pressed }) => [styles.configBtn, pressed && styles.pressed]}
          >
            <Ionicons name="settings-outline" size={20} color={c.muted} />
          </Pressable>

          <Text style={styles.kicker}>
            ✨ {daysLeft} {daysLeft === 1 ? 'dia' : 'dias'} até {targetYear} • {yearPct}% do ano já
            se passou
          </Text>
          <Text style={styles.title}>Minhas Promessas</Text>
          <Text style={styles.subtitle}>
            {doneCount}/{total} concluídas • {progressPct}% • um passo por dia
          </Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.flex1}>
            <SearchBar
              value={query}
              onChange={setQuery}
              resultCount={visibleItems.length}
              totalCount={total}
            />
          </View>
          <Pressable
            onPress={() => setFilterOpen(true)}
            style={({ pressed }) => [
              styles.filterBtn,
              selectedCats.size > 0 && styles.filterBtnActive,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="funnel-outline"
              size={18}
              color={selectedCats.size > 0 ? c.brand : c.muted}
            />
            {selectedCats.size > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedCats.size}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

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
            ) : selectedCats.size > 0 && total > 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Sem promessas nesses filtros</Text>
                <Text style={styles.emptyText}>
                  Ajuste o funil ou toque no + para criar uma promessa nova.
                </Text>
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Começa leve</Text>
                <Text style={styles.emptyText}>
                  Toque no + para escrever sua primeira promessa para o próximo ano.
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

      <Pressable
        onPress={() => setCreating(true)}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </Pressable>

      <ActionSheet
        visible={menuItem !== null}
        title={menuItem?.title}
        actions={menuActions}
        onClose={() => setMenuItemId(null)}
      />

      <EditModal
        visible={formVisible}
        item={editingItem}
        onClose={() => {
          setEditingItemId(null);
          setCreating(false);
        }}
        onSubmit={handleFormSubmit}
      />

      <FilterSheet
        visible={filterOpen}
        categories={categories}
        selected={selectedCats}
        onToggle={toggleCategoryFilter}
        onClear={() => setSelectedCats(new Set())}
        onClose={() => setFilterOpen(false)}
      />

      <SettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
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
    configBtn: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card2,
      borderWidth: 1,
      borderColor: c.border,
      zIndex: 1,
    },
    kicker: { color: c.muted, fontWeight: '700', paddingRight: 40 },
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

    searchRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
    filterBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card2,
      borderWidth: 1,
      borderColor: c.border,
    },
    filterBtnActive: {
      backgroundColor: 'rgba(167,139,250,0.12)',
      borderColor: 'rgba(167,139,250,0.35)',
    },
    filterBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 4,
      borderRadius: 999,
      backgroundColor: c.brandStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },

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

    fab: {
      position: 'absolute',
      right: 20,
      bottom: 96,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: c.brandStrong,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    fabPressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },

    pressed: { opacity: 0.7 },
  });
}
