import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../theme';

type Props = {
  value: string;
  onChange: (next: string) => void;
  resultCount?: number;
  totalCount?: number;
};

export function SearchBar({ value, onChange, resultCount, totalCount }: Props) {
  const hasQuery = value.length > 0;

  return (
    <View>
      <View style={styles.wrap}>
        <Text style={styles.icon}>🔍</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder="Buscar promessas..."
          placeholderTextColor={COLORS.mutedSoft}
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {hasQuery ? (
          <Pressable
            onPress={() => onChange('')}
            hitSlop={8}
            style={({ pressed }) => [styles.clear, pressed && styles.pressed]}
          >
            <Text style={styles.clearText}>×</Text>
          </Pressable>
        ) : null}
      </View>

      {hasQuery && resultCount !== undefined && totalCount !== undefined ? (
        <Text style={styles.count}>
          {resultCount} de {totalCount} {resultCount === 1 ? 'promessa' : 'promessas'}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  icon: { fontSize: 14, color: COLORS.muted },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    paddingVertical: 0,
  },
  clear: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  clearText: {
    color: COLORS.muted,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  count: {
    color: COLORS.mutedSoft,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  pressed: { opacity: 0.6 },
});
