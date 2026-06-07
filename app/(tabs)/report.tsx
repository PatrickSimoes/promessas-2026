import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdBanner } from '../../src/components/ad-banner';
import { useInterstitial } from '../../src/hooks/use-interstitial';
import {
  cancelWeeklyReminder,
  enableWeeklyReminder,
  isRemindersEnabled,
} from '../../src/notifications';
import { usePromises } from '../../src/promises-context';
import { useSettings } from '../../src/settings-context';
import { ThemeColors, tagStyle, useThemeColors } from '../../src/theme';
import { Category } from '../../src/types';
import {
  daysUntil,
  daysUntilNextYear,
  deadlineLabel,
  formatShortDate,
  nextYearLabel,
  percentOfYearPassed,
} from '../../src/utils';

const DAY_MS = 24 * 60 * 60 * 1000;

type CategoryStat = {
  category: Category;
  total: number;
  done: number;
  pct: number;
};

export default function ReportScreen() {
  const c = useThemeColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { items } = usePromises();
  const { categories, categoryColor } = useSettings();
  const interstitial = useInterstitial({ cooldownMs: 60_000 });
  const [remindersOn, setRemindersOn] = useState(false);
  const [remindersBusy, setRemindersBusy] = useState(false);

  useEffect(() => {
    isRemindersEnabled().then(setRemindersOn);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const t = setTimeout(() => interstitial.show(), 350);
      return () => clearTimeout(t);
    }, [interstitial]),
  );

  async function toggleReminders(next: boolean) {
    if (remindersBusy) return;
    setRemindersBusy(true);
    try {
      if (next) {
        const ok = await enableWeeklyReminder();
        if (!ok) {
          Alert.alert(
            'Permissão necessária',
            'Pra te lembrar, libera as notificações nas configurações do telefone.',
          );
          return;
        }
        setRemindersOn(true);
      } else {
        await cancelWeeklyReminder();
        setRemindersOn(false);
      }
    } finally {
      setRemindersBusy(false);
    }
  }

  const total = items.length;
  const doneCount = items.filter((p) => p.done).length;
  const progressPct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const stats: CategoryStat[] = useMemo(
    () =>
      categories.map((cat) => {
        const inCat = items.filter((p) => p.category === cat.name);
        const done = inCat.filter((p) => p.done).length;
        return {
          category: cat.name,
          total: inCat.length,
          done,
          pct: inCat.length === 0 ? 0 : Math.round((done / inCat.length) * 100),
        };
      }),
    [items, categories],
  );

  const completed = useMemo(
    () => items.filter((p) => p.done).sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0)),
    [items],
  );

  // Ritmo: quantas foram concluídas nos últimos 30 dias.
  const recentDone = useMemo(() => {
    const cutoff = Date.now() - 30 * DAY_MS;
    return items.filter((p) => p.done && (p.completedAt ?? 0) >= cutoff).length;
  }, [items]);

  // Só categorias com promessas, ordenadas por progresso (maior primeiro).
  const visibleStats = useMemo(
    () => stats.filter((s) => s.total > 0).sort((a, b) => b.pct - a.pct || b.total - a.total),
    [stats],
  );

  // Composição da carteira de promessas por categoria, pra barra de distribuição.
  const distribution = useMemo(
    () =>
      visibleStats.map((s) => ({
        name: s.category,
        color: categoryColor(s.category),
        share: total > 0 ? (s.total / total) * 100 : 0,
      })),
    [visibleStats, total, categoryColor],
  );

  // Promessas em aberto vencidas ou vencendo nos próximos 7 dias.
  const upcoming = useMemo(
    () =>
      items
        .filter((p) => !p.done && p.deadline)
        .map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          deadline: p.deadline as number,
          days: daysUntil(p.deadline as number),
        }))
        .filter((p) => p.days <= 7)
        .sort((a, b) => a.deadline - b.deadline),
    [items],
  );
  const overdueCount = upcoming.filter((p) => p.days < 0).length;
  const dueSoonCount = upcoming.length - overdueCount;

  const daysLeft = daysUntilNextYear();
  const yearPct = percentOfYearPassed();
  const targetYear = nextYearLabel();
  const currentYear = targetYear - 1;

  const shareSummary = useCallback(async () => {
    const lines = [
      `🎯 Minhas promessas de ${currentYear}`,
      `${doneCount} de ${total} concluídas (${progressPct}%)`,
      '',
      ...stats
        .filter((s) => s.total > 0)
        .map((s) => `${s.category}: ${s.done}/${s.total} (${s.pct}%)`),
      '',
      `Faltam ${daysLeft} dias pra ${targetYear} 🚀`,
    ];
    try {
      await Share.share({ message: lines.join('\n') });
    } catch {
      // user dismissed
    }
  }, [doneCount, total, progressPct, stats, daysLeft, targetYear, currentYear]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.flex1}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.kicker}>📊 Relatório de {currentYear}</Text>
            <Text style={styles.bigNumber}>
              {doneCount}
              <Text style={styles.bigNumberLight}>/{total}</Text>
            </Text>
            <Text style={styles.subtitle}>
              {progressPct}% concluídas • {daysLeft} dias até {targetYear} • {yearPct}% do ano já se
              passou
            </Text>

            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>

            {recentDone > 0 ? (
              <Text style={styles.recentLine}>
                🔥 {recentDone} concluída{recentDone > 1 ? 's' : ''} nos últimos 30 dias
              </Text>
            ) : null}
          </View>

          {upcoming.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>Prazos</Text>
              <View style={styles.statsBox}>
                <Text style={styles.deadlineSummary}>
                  {overdueCount > 0 ? (
                    <Text style={{ color: c.red }}>
                      ⏰ {overdueCount} vencida{overdueCount > 1 ? 's' : ''}
                    </Text>
                  ) : null}
                  {overdueCount > 0 && dueSoonCount > 0 ? '  •  ' : ''}
                  {dueSoonCount > 0 ? (
                    <Text style={{ color: c.sun }}>🟡 {dueSoonCount} vencendo em breve</Text>
                  ) : null}
                </Text>
                {upcoming.map((p) => (
                  <View key={p.id} style={styles.deadlineRow}>
                    <View style={[styles.tag, tagStyle(categoryColor(p.category))]}>
                      <Text style={styles.tagText}>{p.category}</Text>
                    </View>
                    <Text style={styles.deadlineTitle} numberOfLines={1}>
                      {p.title}
                    </Text>
                    <Text
                      style={[
                        styles.deadlineWhen,
                        { color: p.days < 0 ? c.red : p.days <= 3 ? c.sun : c.muted },
                      ]}
                    >
                      {deadlineLabel(p.deadline)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          <Text style={styles.sectionLabel}>Por categoria</Text>
          <View style={styles.statsBox}>
            {visibleStats.length === 0 ? (
              <Text style={styles.emptyText}>
                Crie promessas pra ver a distribuição por categoria.
              </Text>
            ) : (
              <>
                <View style={styles.distBar}>
                  {distribution.map((d) => (
                    <View key={d.name} style={{ width: `${d.share}%`, backgroundColor: d.color }} />
                  ))}
                </View>
                {visibleStats.map((s) => (
                  <View key={s.category} style={styles.statRow}>
                    <View style={styles.statHeader}>
                      <View style={[styles.tag, tagStyle(categoryColor(s.category))]}>
                        <Text style={styles.tagText}>{s.category}</Text>
                      </View>
                      <Text style={styles.statText}>
                        {s.done}/{s.total} • {s.pct}%
                      </Text>
                    </View>
                    <View style={styles.statTrack}>
                      <View
                        style={[
                          styles.statFill,
                          { width: `${s.pct}%` },
                          s.pct >= 100 && styles.statFillDone,
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>

          <Text style={styles.sectionLabel}>
            Promessas concluídas {completed.length > 0 ? `(${completed.length})` : ''}
          </Text>
          <View style={styles.statsBox}>
            {completed.length === 0 ? (
              <Text style={styles.emptyText}>
                Quando você marcar uma promessa como feita ela aparece aqui.
              </Text>
            ) : (
              completed.map((p) => (
                <View key={p.id} style={styles.completedRow}>
                  <Text style={styles.completedCheck}>✓</Text>
                  <View style={styles.flex1}>
                    <Text style={styles.completedTitle} numberOfLines={2}>
                      {p.title}
                    </Text>
                    <Text style={styles.completedMeta}>
                      {p.category}
                      {p.completedAt ? ` • feita ${formatShortDate(p.completedAt)}` : ''}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          <Text style={styles.sectionLabel}>Lembretes</Text>
          <View style={styles.statsBox}>
            <View style={styles.reminderRow}>
              <View style={styles.flex1}>
                <Text style={styles.reminderTitle}>Lembrete semanal</Text>
                <Text style={styles.reminderHint}>
                  Toda segunda às 19h pra você revisar o progresso.
                </Text>
              </View>
              <Switch
                value={remindersOn}
                disabled={remindersBusy}
                onValueChange={toggleReminders}
                trackColor={{ false: c.borderStrong, true: c.brandStrong }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          <Pressable
            onPress={shareSummary}
            style={({ pressed }) => [styles.shareBtn, pressed && styles.pressed]}
          >
            <Text style={styles.shareBtnText}>Compartilhar progresso</Text>
          </Pressable>
        </ScrollView>

        <AdBanner />
      </View>
    </SafeAreaView>
  );
}

function makeStyles(c: ThemeColors) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    flex1: { flex: 1 },
    content: { padding: 16, gap: 12, paddingBottom: 24 },

    hero: {
      backgroundColor: c.hero,
      borderRadius: 20,
      padding: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    kicker: { color: c.muted, fontWeight: '700' },
    bigNumber: {
      color: c.text,
      fontSize: 44,
      fontWeight: '900',
      marginTop: 6,
    },
    bigNumberLight: {
      color: c.muted,
      fontSize: 28,
      fontWeight: '700',
    },
    subtitle: { color: c.muted, marginTop: 4 },

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
    recentLine: { color: c.text, fontSize: 13, fontWeight: '700', marginTop: 12 },

    sectionLabel: {
      color: c.mutedSoft,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginTop: 6,
      paddingHorizontal: 4,
    },

    statsBox: {
      backgroundColor: c.card,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: c.border,
      gap: 12,
    },

    statRow: { gap: 6 },
    statHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    tag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1 },
    tagText: { color: c.text, fontSize: 12, fontWeight: '800', opacity: 0.9 },
    statText: { color: c.muted, fontSize: 12, fontWeight: '700' },
    statTrack: {
      height: 8,
      borderRadius: 999,
      backgroundColor: c.card2,
      overflow: 'hidden',
    },
    statFill: { height: '100%', backgroundColor: c.brand, borderRadius: 999 },
    statFillDone: { backgroundColor: c.green },

    distBar: {
      flexDirection: 'row',
      height: 12,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: c.card2,
    },

    deadlineSummary: { fontSize: 13, fontWeight: '800' },
    deadlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    deadlineTitle: { flex: 1, color: c.text, fontSize: 14, fontWeight: '600' },
    deadlineWhen: { fontSize: 12, fontWeight: '800' },

    completedRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
    completedCheck: {
      color: c.green,
      fontSize: 16,
      fontWeight: '900',
      width: 18,
      textAlign: 'center',
    },
    completedTitle: { color: c.text, fontSize: 14, fontWeight: '600' },
    completedMeta: { color: c.mutedSoft, fontSize: 11, marginTop: 2 },

    emptyText: { color: c.muted, fontSize: 13, fontStyle: 'italic' },

    reminderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    reminderTitle: { color: c.text, fontSize: 14, fontWeight: '700' },
    reminderHint: { color: c.muted, fontSize: 12, marginTop: 4, lineHeight: 16 },

    shareBtn: {
      marginTop: 6,
      height: 50,
      borderRadius: 14,
      backgroundColor: c.brandStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    shareBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
    pressed: { opacity: 0.85 },
  });
}
