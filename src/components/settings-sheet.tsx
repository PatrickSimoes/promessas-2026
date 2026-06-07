import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ThemePref, useSettings } from '../settings-context';
import { ThemeColors, useThemeColors } from '../theme';
import { CATEGORY_PALETTE } from '../types';
import { BottomSheet } from './bottom-sheet';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const THEME_OPTIONS: { key: ThemePref; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'dark', label: 'Escuro', icon: 'moon' },
  { key: 'light', label: 'Claro', icon: 'sunny' },
  { key: 'system', label: 'Sistema', icon: 'phone-portrait' },
];

export function SettingsSheet({ visible, onClose }: Props) {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { themePref, setThemePref, categories, addCategory, removeCategory, isDefaultCategory } =
    useSettings();

  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(CATEGORY_PALETTE[0]);

  const trimmed = newName.trim();
  const duplicate = categories.some((cat) => cat.name.toLowerCase() === trimmed.toLowerCase());
  const canAdd = trimmed.length > 0 && !duplicate;

  function submitCategory() {
    if (!canAdd) return;
    addCategory(trimmed, newColor);
    setNewName('');
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} maxHeight="90%">
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Configurações</Text>
        <Pressable
          onPress={onClose}
          hitSlop={10}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Ionicons name="close" size={24} color={c.muted} />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Tema</Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => {
            const active = opt.key === themePref;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setThemePref(opt.key)}
                style={({ pressed }) => [
                  styles.themeCard,
                  active && styles.themeCardActive,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name={opt.icon} size={22} color={active ? c.brand : c.muted} />
                <Text style={[styles.themeLabel, active && styles.themeLabelActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Categorias</Text>
        <View style={styles.catList}>
          {categories.map((cat) => {
            const isDefault = isDefaultCategory(cat.name);
            return (
              <View key={cat.name} style={styles.catRow}>
                <View style={[styles.dot, { backgroundColor: cat.color }]} />
                <Text style={styles.catName}>{cat.name}</Text>
                {isDefault ? (
                  <Text style={styles.defaultBadge}>padrão</Text>
                ) : (
                  <Pressable
                    onPress={() => removeCategory(cat.name)}
                    hitSlop={8}
                    style={({ pressed }) => [styles.removeBtn, pressed && styles.pressed]}
                  >
                    <Ionicons name="trash-outline" size={18} color={c.red} />
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>Nova categoria</Text>
        <TextInput
          value={newName}
          onChangeText={setNewName}
          placeholder="Ex: Estudos, Família..."
          placeholderTextColor={c.mutedSoft}
          style={styles.input}
          returnKeyType="done"
          onSubmitEditing={submitCategory}
          maxLength={24}
        />
        {duplicate ? (
          <Text style={styles.errorText}>já existe uma categoria com esse nome</Text>
        ) : null}

        <Text style={styles.fieldLabel}>Cor</Text>
        <View style={styles.swatchRow}>
          {CATEGORY_PALETTE.map((color) => {
            const active = color === newColor;
            return (
              <Pressable
                key={color}
                onPress={() => setNewColor(color)}
                style={({ pressed }) => [
                  styles.swatch,
                  { backgroundColor: color },
                  active && styles.swatchActive,
                  pressed && styles.pressed,
                ]}
              >
                {active ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={submitCategory}
          disabled={!canAdd}
          style={({ pressed }) => [
            styles.addBtn,
            !canAdd && styles.addBtnDisabled,
            pressed && canAdd && styles.pressed,
          ]}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Adicionar categoria</Text>
        </Pressable>
      </ScrollView>
    </BottomSheet>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingBottom: 4,
    },
    heading: { color: c.text, fontSize: 18, fontWeight: '800' },

    content: { padding: 18, paddingTop: 8, gap: 8 },

    sectionLabel: {
      color: c.mutedSoft,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginTop: 12,
      marginBottom: 4,
    },

    themeRow: { flexDirection: 'row', gap: 10 },
    themeCard: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.card2,
      alignItems: 'center',
      gap: 6,
    },
    themeCardActive: {
      borderColor: 'rgba(167,139,250,0.45)',
      backgroundColor: 'rgba(167,139,250,0.12)',
    },
    themeLabel: { color: c.muted, fontWeight: '700', fontSize: 13 },
    themeLabelActive: { color: c.text },

    catList: { gap: 2 },
    catRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 10,
    },
    dot: { width: 12, height: 12, borderRadius: 6 },
    catName: { flex: 1, color: c.text, fontSize: 15, fontWeight: '600' },
    defaultBadge: {
      color: c.mutedSoft,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    removeBtn: { padding: 4 },

    fieldLabel: {
      color: c.mutedSoft,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginTop: 10,
    },
    input: {
      height: 44,
      borderRadius: 12,
      paddingHorizontal: 14,
      color: c.text,
      backgroundColor: c.card2,
      borderWidth: 1,
      borderColor: c.border,
      fontSize: 15,
    },
    errorText: { color: c.red, fontSize: 12, marginTop: 4 },

    swatchRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
    swatch: {
      width: 34,
      height: 34,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    swatchActive: { borderColor: c.text },

    addBtn: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 16,
      height: 48,
      borderRadius: 14,
      backgroundColor: c.brandStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addBtnDisabled: { opacity: 0.4 },
    addBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

    pressed: { opacity: 0.7 },
  });
}
