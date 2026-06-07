import React, { ReactNode, useMemo } from 'react';
import {
  DimensionValue,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeColors, useThemeColors } from '../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Caps the sheet height (e.g. '92%') so tall content scrolls instead of pushing off-screen. */
  maxHeight?: DimensionValue;
  /** Lift the sheet above the keyboard — use when the content has text inputs. */
  avoidKeyboard?: boolean;
};

/**
 * Shared bottom-sheet scaffold: a fade-in modal with a dimmed backdrop, an opaque
 * sheet anchored to the bottom, and a drag handle. Consumers provide the inner
 * content (and their own horizontal padding / scroll views).
 */
export function BottomSheet({ visible, onClose, children, maxHeight, avoidKeyboard }: Props) {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  const sheet = (
    <SafeAreaView edges={['bottom']} style={[styles.sheet, maxHeight != null && { maxHeight }]}>
      <View style={styles.handle} />
      {children}
    </SafeAreaView>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />

      {avoidKeyboard ? (
        <KeyboardAvoidingView
          pointerEvents="box-none"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.wrap}
        >
          {sheet}
        </KeyboardAvoidingView>
      ) : (
        <View pointerEvents="box-none" style={styles.wrap}>
          {sheet}
        </View>
      )}
    </Modal>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: c.overlay },
    wrap: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: c.sheet,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 8,
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
  });
}
