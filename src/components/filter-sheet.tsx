import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ThemeColors, useThemeColors } from '../theme';
import { CategoryDef } from '../types';
import { BottomSheet } from './bottom-sheet';

type Props = {
  visible: boolean;
  categories: CategoryDef[];
  selected: Set<string>;
  onToggle: (name: string) => void;
  onClear: () => void;
  onClose: () => void;
};

export function FilterSheet({ visible, categories, selected, onToggle, onClear, onClose }: Props) {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const hasFilter = selected.size > 0;

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <Text style={styles.heading}>Filtrar por categoria</Text>
          {hasFilter ? (
            <Pressable
              onPress={onClear}
              hitSlop={8}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Text style={styles.clearText}>Limpar</Text>
            </Pressable>
          ) : null}
        </View>

        <Text style={styles.hint}>
          {hasFilter ? `${selected.size} selecionada(s)` : 'Nenhuma selecionada — mostrando todas'}
        </Text>

        {categories.map((cat) => {
          const active = selected.has(cat.name);
          return (
            <Pressable
              key={cat.name}
              onPress={() => onToggle(cat.name)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <View style={[styles.dot, { backgroundColor: cat.color }]} />
              <Text style={styles.rowLabel}>{cat.name}</Text>
              <View
                style={[
                  styles.checkbox,
                  active && { borderColor: cat.color, backgroundColor: cat.color },
                ]}
              >
                {active ? <Ionicons name="checkmark" size={15} color="#FFFFFF" /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    inner: { paddingHorizontal: 12, paddingBottom: 8 },

    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 6,
      paddingTop: 4,
    },
    heading: { color: c.text, fontSize: 18, fontWeight: '800' },
    clearText: { color: c.brand, fontSize: 14, fontWeight: '700' },
    hint: { color: c.mutedSoft, fontSize: 12, paddingHorizontal: 6, marginTop: 4, marginBottom: 6 },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 14,
    },
    rowPressed: { backgroundColor: c.card },
    dot: { width: 12, height: 12, borderRadius: 6 },
    rowLabel: { flex: 1, color: c.text, fontSize: 16, fontWeight: '600' },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 8,
      borderWidth: 1.5,
      borderColor: c.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },

    pressed: { opacity: 0.6 },
  });
}
