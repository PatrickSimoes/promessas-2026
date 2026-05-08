import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES, Category, PromiseItem } from '../types';
import { COLORS, getTagStyle } from '../theme';
import {
  addDays,
  endOfYear,
  formatManualDate,
  maskDateInput,
  parseManualDate,
} from '../utils';

export type EditModalSubmit = {
  title: string;
  category: Category;
  deadline: number | undefined;
};

type Props = {
  visible: boolean;
  item: PromiseItem | null;
  onClose: () => void;
  onSubmit: (changes: EditModalSubmit) => void;
};

const PRESETS: { key: string; label: string; getValue: () => number }[] = [
  { key: '1w', label: '1 semana', getValue: () => addDays(Date.now(), 7) },
  { key: '1m', label: '1 mês', getValue: () => addDays(Date.now(), 30) },
  { key: '3m', label: '3 meses', getValue: () => addDays(Date.now(), 90) },
  { key: '6m', label: '6 meses', getValue: () => addDays(Date.now(), 180) },
  { key: 'eoy', label: 'Final do ano', getValue: () => endOfYear(Date.now()) },
];

export function EditModal({ visible, item, onClose, onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Pessoal');
  const [dateInput, setDateInput] = useState('');
  const [touchedDate, setTouchedDate] = useState(false);

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setCategory(item.category);
    setDateInput(item.deadline ? formatManualDate(item.deadline) : '');
    setTouchedDate(false);
  }, [item]);

  const parsedDate = useMemo(() => parseManualDate(dateInput), [dateInput]);
  const dateInvalid = dateInput.length > 0 && parsedDate === null;
  const canSave = title.trim().length > 0 && !dateInvalid;

  function applyPreset(getValue: () => number) {
    setDateInput(formatManualDate(getValue()));
    setTouchedDate(true);
  }

  function clearDate() {
    setDateInput('');
    setTouchedDate(true);
  }

  function submit() {
    if (!canSave) return;
    onSubmit({
      title: title.trim(),
      category,
      deadline: dateInput.length === 0 ? undefined : parsedDate ?? undefined,
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <KeyboardAvoidingView
        pointerEvents="box-none"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrap}
      >
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />

          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <Text style={styles.heading}>Editar promessa</Text>

            <Text style={styles.fieldLabel}>Título</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="O que você quer concretizar?"
              placeholderTextColor={COLORS.mutedSoft}
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Categoria</Text>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((cat) => {
                const active = cat === category;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={({ pressed }) => [
                      styles.catChip,
                      active && styles.catChipActive,
                      active && getTagStyle(cat),
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Prazo (opcional)</Text>
            <View style={styles.chipsRow}>
              <Pressable
                onPress={clearDate}
                style={({ pressed }) => [
                  styles.presetChip,
                  dateInput.length === 0 && touchedDate && styles.presetChipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.presetChipText}>Sem prazo</Text>
              </Pressable>
              {PRESETS.map((p) => (
                <Pressable
                  key={p.key}
                  onPress={() => applyPreset(p.getValue)}
                  style={({ pressed }) => [styles.presetChip, pressed && styles.pressed]}
                >
                  <Text style={styles.presetChipText}>{p.label}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              value={dateInput}
              onChangeText={(raw) => {
                setDateInput(maskDateInput(raw));
                setTouchedDate(true);
              }}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={COLORS.mutedSoft}
              keyboardType="number-pad"
              maxLength={10}
              style={[styles.input, dateInvalid && styles.inputError]}
            />
            {dateInvalid ? (
              <Text style={styles.errorText}>data inválida</Text>
            ) : (
              <Text style={styles.hintText}>
                escolha um chip ou digite a data manualmente
              </Text>
            )}
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.btn, styles.btnGhost, pressed && styles.pressed]}
            >
              <Text style={styles.btnGhostText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={submit}
              disabled={!canSave}
              style={({ pressed }) => [
                styles.btn,
                styles.btnPrimary,
                !canSave && styles.btnDisabled,
                pressed && canSave && styles.pressed,
              ]}
            >
              <Text style={styles.btnPrimaryText}>Salvar</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay },

  wrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#141A30',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    maxHeight: '92%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: COLORS.borderStrong,
    marginBottom: 8,
  },

  content: { padding: 18, paddingBottom: 12, gap: 8 },

  heading: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 6 },

  fieldLabel: {
    color: COLORS.mutedSoft,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 8,
  },

  input: {
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: COLORS.text,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 15,
  },
  inputError: { borderColor: COLORS.red },
  errorText: { color: COLORS.red, fontSize: 12, marginTop: 4 },
  hintText: { color: COLORS.mutedSoft, fontSize: 12, marginTop: 4 },

  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },

  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  catChipActive: { borderWidth: 1 },
  catChipText: { color: COLORS.muted, fontWeight: '700', fontSize: 13 },
  catChipTextActive: { color: COLORS.text },

  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  presetChipActive: {
    backgroundColor: 'rgba(167,139,250,0.18)',
    borderColor: 'rgba(167,139,250,0.35)',
  },
  presetChipText: { color: COLORS.muted, fontWeight: '700', fontSize: 13 },

  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhost: { backgroundColor: 'rgba(255,255,255,0.04)' },
  btnGhostText: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  btnPrimary: { backgroundColor: COLORS.brandStrong },
  btnPrimaryText: { color: COLORS.text, fontSize: 15, fontWeight: '800' },
  btnDisabled: { opacity: 0.4 },

  pressed: { opacity: 0.7 },
});
