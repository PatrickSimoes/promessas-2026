import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeColors, useThemeColors } from '../theme';

export type ActionSheetAction = {
  key: string;
  label: string;
  icon: string;
  destructive?: boolean;
  onPress: () => void;
};

type Props = {
  visible: boolean;
  title?: string;
  actions: ActionSheetAction[];
  onClose: () => void;
};

export function ActionSheet({ visible, title, actions, onClose }: Props) {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View pointerEvents="box-none" style={styles.sheetWrap}>
        <SafeAreaView edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />

          {title ? (
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
          ) : null}

          {actions.map((action) => (
            <Pressable
              key={action.key}
              onPress={() => {
                onClose();
                requestAnimationFrame(action.onPress);
              }}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <Text style={[styles.icon, action.destructive && styles.iconDestructive]}>
                {action.icon}
              </Text>
              <Text style={[styles.label, action.destructive && styles.labelDestructive]}>
                {action.label}
              </Text>
            </Pressable>
          ))}

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.cancel, pressed && styles.rowPressed]}
          >
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: c.overlay },

    sheetWrap: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: c.cardElevated,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 8,
      paddingHorizontal: 8,
      borderTopWidth: 1,
      borderColor: c.border,
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 999,
      backgroundColor: c.borderStrong,
      marginBottom: 8,
    },
    title: {
      color: c.muted,
      fontSize: 13,
      fontWeight: '700',
      paddingHorizontal: 12,
      paddingTop: 6,
      paddingBottom: 12,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 14,
    },
    rowPressed: { backgroundColor: c.card },

    icon: { fontSize: 20, width: 24, textAlign: 'center', color: c.text },
    iconDestructive: { color: c.red },

    label: { color: c.text, fontSize: 16, fontWeight: '600' },
    labelDestructive: { color: c.red },

    cancel: {
      marginTop: 6,
      marginBottom: 4,
      paddingVertical: 14,
      alignItems: 'center',
      borderRadius: 14,
      backgroundColor: c.card2,
    },
    cancelText: { color: c.text, fontSize: 16, fontWeight: '700' },
  });
}
