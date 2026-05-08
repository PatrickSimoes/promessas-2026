import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ThemeColors, getTagStyle, useThemeColors } from '../theme';
import { PromiseItem, Subtask } from '../types';
import { daysUntil, deadlineLabel, formatShortDate } from '../utils';

type Props = {
  item: PromiseItem;
  expanded: boolean;
  onToggleExpanded: (id: string) => void;
  onToggle: (id: string) => void;
  onOpenMenu: (id: string) => void;
  onAddSubtask: (id: string, title: string) => void;
  onToggleSubtask: (id: string, subId: string) => void;
  onRequestDeleteSubtask: (id: string, subId: string) => void;
};

export function PromiseCard({
  item,
  expanded,
  onToggleExpanded,
  onToggle,
  onOpenMenu,
  onAddSubtask,
  onToggleSubtask,
  onRequestDeleteSubtask,
}: Props) {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [subText, setSubText] = useState('');
  const checkScale = useSharedValue(1);

  const hasSubtasks = item.subtasks.length > 0;
  const subDoneCount = useMemo(() => item.subtasks.filter((s) => s.done).length, [item.subtasks]);

  const deadlineColor = useMemo(() => {
    if (!item.deadline || item.done) return c.muted;
    const days = daysUntil(item.deadline);
    if (days < 0) return c.red;
    if (days <= 3) return c.sun;
    return c.muted;
  }, [item.deadline, item.done, c]);

  useEffect(() => {
    if (item.done) {
      checkScale.value = withSequence(
        withSpring(1.3, { damping: 6, stiffness: 220 }),
        withSpring(1, { damping: 8, stiffness: 180 }),
      );
    } else {
      checkScale.value = withTiming(1, { duration: 120 });
    }
  }, [item.done, checkScale]);

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  function submitSubtask() {
    const title = subText.trim();
    if (!title) return;
    onAddSubtask(item.id, title);
    setSubText('');
  }

  return (
    <Animated.View
      layout={LinearTransition.duration(220)}
      style={[styles.card, item.done && styles.cardDone]}
    >
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => onToggle(item.id)}
          hitSlop={8}
          style={[styles.checkbox, item.done && styles.checkboxDone]}
        >
          {item.done ? (
            <Animated.Text style={[styles.check, checkAnimStyle]}>✓</Animated.Text>
          ) : null}
        </Pressable>

        <Pressable onPress={() => onToggleExpanded(item.id)} style={styles.headerBody}>
          <Text style={[styles.cardTitle, item.done && styles.cardTitleDone]} numberOfLines={2}>
            {item.title}
          </Text>

          <View style={styles.metaRow}>
            <View style={[styles.tag, getTagStyle(item.category)]}>
              <Text style={styles.tagText}>{item.category}</Text>
            </View>

            {hasSubtasks ? (
              <View style={styles.metaPill}>
                <Text style={styles.metaPillText}>
                  {subDoneCount}/{item.subtasks.length} sub
                </Text>
              </View>
            ) : null}

            {item.deadline ? (
              <View style={styles.metaPill}>
                <Text style={[styles.metaPillText, { color: deadlineColor }]}>
                  até {deadlineLabel(item.deadline)}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.dateText}>criada {formatShortDate(item.createdAt)}</Text>
            {item.completedAt ? (
              <Text style={[styles.dateText, { color: c.green }]}>
                • feita {formatShortDate(item.completedAt)}
              </Text>
            ) : null}
          </View>
        </Pressable>

        <Pressable
          onPress={() => onOpenMenu(item.id)}
          hitSlop={10}
          style={({ pressed }) => [styles.kebab, pressed && styles.pressed]}
        >
          <Text style={styles.kebabText}>⋮</Text>
        </Pressable>
      </View>

      {expanded ? (
        <View style={styles.expanded}>
          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>Subtarefas</Text>

          {item.subtasks.length === 0 ? (
            <Text style={styles.subEmpty}>nada por aqui ainda</Text>
          ) : (
            item.subtasks.map((sub) => (
              <SubtaskRow
                key={sub.id}
                sub={sub}
                styles={styles}
                onToggle={() => onToggleSubtask(item.id, sub.id)}
                onDelete={() => onRequestDeleteSubtask(item.id, sub.id)}
              />
            ))
          )}

          <View style={styles.subInputWrap}>
            <TextInput
              value={subText}
              onChangeText={setSubText}
              placeholder="Nova subtarefa..."
              placeholderTextColor={c.mutedSoft}
              style={styles.subInput}
              returnKeyType="done"
              onSubmitEditing={submitSubtask}
              maxLength={120}
            />
            <Pressable
              onPress={submitSubtask}
              disabled={!subText.trim()}
              style={({ pressed }) => [
                styles.subAdd,
                !subText.trim() && styles.subAddDisabled,
                pressed && subText.trim() && styles.pressed,
              ]}
            >
              <Text style={styles.subAddText}>+</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Animated.View>
  );
}

function SubtaskRow({
  sub,
  styles,
  onToggle,
  onDelete,
}: {
  sub: Subtask;
  styles: ReturnType<typeof makeStyles>;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={styles.subRow}>
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        style={[styles.subCheck, sub.done && styles.subCheckDone]}
      >
        {sub.done ? <Text style={styles.subCheckText}>✓</Text> : null}
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text style={[styles.subTitle, sub.done && styles.subTitleDone]} numberOfLines={2}>
          {sub.title}
        </Text>
        {sub.completedAt ? (
          <Text style={styles.subDate}>feita {formatShortDate(sub.completedAt)}</Text>
        ) : null}
      </View>

      <Pressable
        onPress={onDelete}
        hitSlop={8}
        style={({ pressed }) => [styles.subDelete, pressed && styles.pressed]}
      >
        <Text style={styles.subDeleteText}>×</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    card: {
      padding: 14,
      borderRadius: 18,
      backgroundColor: c.card,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 10,
    },
    cardDone: {
      borderColor: 'rgba(52,211,153,0.28)',
      backgroundColor: 'rgba(52,211,153,0.08)',
    },

    headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },

    checkbox: {
      width: 26,
      height: 26,
      borderRadius: 10,
      backgroundColor: c.card2,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    checkboxDone: {
      backgroundColor: 'rgba(52,211,153,0.18)',
      borderColor: 'rgba(52,211,153,0.45)',
    },
    check: { color: c.green, fontSize: 16, fontWeight: '900', marginTop: -1 },

    headerBody: { flex: 1, gap: 8 },
    cardTitle: { color: c.text, fontSize: 16, fontWeight: '700' },
    cardTitleDone: { textDecorationLine: 'line-through', color: c.muted },

    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
    tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
    tagText: { color: c.text, fontSize: 12, fontWeight: '800', opacity: 0.9 },

    metaPill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: c.card2,
      borderWidth: 1,
      borderColor: c.border,
    },
    metaPillText: { color: c.muted, fontSize: 12, fontWeight: '700' },

    dateRow: { flexDirection: 'row', gap: 4, marginTop: 2, flexWrap: 'wrap' },
    dateText: { color: c.mutedSoft, fontSize: 11, fontWeight: '600' },

    kebab: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
    },
    kebabText: { color: c.muted, fontSize: 22, fontWeight: '900', lineHeight: 22 },

    expanded: { marginTop: 10 },
    divider: { height: 1, backgroundColor: c.border, marginBottom: 10 },

    sectionLabel: {
      color: c.mutedSoft,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: 6,
    },

    subEmpty: { color: c.mutedSoft, fontSize: 13, fontStyle: 'italic', paddingVertical: 4 },

    subRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 6,
    },
    subCheck: {
      width: 20,
      height: 20,
      borderRadius: 7,
      backgroundColor: c.card2,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subCheckDone: {
      backgroundColor: 'rgba(52,211,153,0.18)',
      borderColor: 'rgba(52,211,153,0.45)',
    },
    subCheckText: { color: c.green, fontSize: 12, fontWeight: '900' },
    subTitle: { color: c.text, fontSize: 14, fontWeight: '600' },
    subTitleDone: { textDecorationLine: 'line-through', color: c.muted },
    subDate: { color: c.mutedSoft, fontSize: 10, marginTop: 1 },

    subDelete: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
    subDeleteText: { color: c.mutedSoft, fontSize: 20, fontWeight: '700', lineHeight: 20 },

    subInputWrap: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },
    subInput: {
      flex: 1,
      height: 38,
      borderRadius: 10,
      paddingHorizontal: 12,
      color: c.text,
      backgroundColor: c.card2,
      borderWidth: 1,
      borderColor: c.border,
      fontSize: 14,
    },
    subAdd: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: c.brand,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subAddDisabled: { backgroundColor: 'rgba(167,139,250,0.25)' },
    subAddText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', marginTop: -2 },

    pressed: { opacity: 0.6 },
  });
}
