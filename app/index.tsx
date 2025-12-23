import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

type Category = 'Saúde' | 'Carreira' | 'Finanças' | 'Pessoal';

type PromiseItem = {
  id: string;
  title: string;
  done: boolean;
  category: Category;
  createdAt: number;
};

const CATEGORIES: Category[] = ['Saúde', 'Carreira', 'Finanças', 'Pessoal'];

const STORAGE_KEY = '@promessas/items';

export default function Index() {
  const [text, setText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Pessoal');
  const [items, setItems] = useState<PromiseItem[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!mounted) return;
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as PromiseItem[];
          setItems(parsed);
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
    };

    setItems((prev) => [newItem, ...prev]);
    setText('');
  }

  function toggleItem(id: string) {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, done: !p.done } : p)));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }

  const doneCount = useMemo(() => items.filter((p) => p.done).length, [items]);
  const total = items.length;
  const progress = total === 0 ? 0 : doneCount / total;
  const progressPct = Math.round(progress * 100);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
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
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Começa leve</Text>
                <Text style={styles.emptyText}>
                  Escolha uma categoria e escreva uma promessa para o próximo ano.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => toggleItem(item.id)}
                onLongPress={() => removeItem(item.id)}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.pressedRow,
                  item.done && styles.cardDone,
                ]}
              >
                <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
                  {item.done ? <Text style={styles.check}>✓</Text> : null}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>

                  <View style={styles.metaRow}>
                    <View style={[styles.tag, getTagStyle(item.category)]}>
                      <Text style={styles.tagText}>{item.category}</Text>
                    </View>

                    <View style={[styles.pill, item.done ? styles.pillDone : styles.pillOpen]}>
                      <Text style={styles.pillText}>{item.done ? 'Feito ✨' : 'Em progresso'}</Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            )}
          />

          <Text style={styles.hint}>Toque para concluir • Segure para remover</Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

/**
 * Paleta “dark happy”:
 * - fundo escuro mas NÃO preto
 * - cards com roxo/lavanda suave
 * - acentos que passam esperança (dourado/verde)
 */
const COLORS = {
  bg: '#0B1020', // dark, mas suave
  hero: 'rgba(124,92,255,0.10)',
  card: 'rgba(255,255,255,0.06)',
  card2: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.10)',
  text: '#F2F6FF',
  muted: 'rgba(242,246,255,0.65)',
  brand: '#A78BFA', // lavanda
  brandStrong: '#7C5CFF',
  green: '#34D399',
  sun: '#FBBF24', // “sol”
  blue: '#60A5FA',
  pink: '#F472B6',
};

function getTagStyle(category: Category) {
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
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.brandStrong,
  },

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

  listContent: { paddingTop: 6 },
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

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  cardDone: {
    borderColor: 'rgba(52,211,153,0.28)',
    backgroundColor: 'rgba(52,211,153,0.08)',
  },
  pressedRow: { transform: [{ scale: 0.99 }], opacity: 0.9 },
  pressed: { opacity: 0.9 },

  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: 'rgba(52,211,153,0.18)',
    borderColor: 'rgba(52,211,153,0.45)',
  },
  check: { color: COLORS.green, fontSize: 16, fontWeight: '900', marginTop: -1 },

  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },

  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  tagText: { color: COLORS.text, fontSize: 12, fontWeight: '800', opacity: 0.9 },

  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  pillOpen: { backgroundColor: 'rgba(167,139,250,0.12)', borderColor: 'rgba(167,139,250,0.24)' },
  pillDone: { backgroundColor: 'rgba(52,211,153,0.12)', borderColor: 'rgba(52,211,153,0.24)' },
  pillText: { color: COLORS.text, fontSize: 12, fontWeight: '800', opacity: 0.9 },

  hint: { textAlign: 'center', color: COLORS.muted, marginTop: 2 },
});
