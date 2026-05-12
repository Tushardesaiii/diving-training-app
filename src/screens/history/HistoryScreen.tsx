import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Copy } from '../../constants/copy';
import { AppText } from '../../components/AppText';
import { AppCard } from '../../components/AppCard';
import { MetricCard, MetricRow } from '../../components/MetricCard';
import { TrainingSession, PBRecord } from '../../types/app';
import {
  getSessions,
  getPBHistory,
  getStreak,
  getUserProfile,
  getSessionsThisWeek,
} from '../../storage/appStorage';
import { secondsToMMSS, calcPBGrowthPercent } from '../../utils/apnea';
import { formatRelativeDate, formatShortDate } from '../../utils/dates';

const MODE_COLORS: Record<string, string> = {
  CO2: Colors.primary,
  O2: Colors.accent,
  MAX: '#7C5CF8',
  SPEARO: Colors.warning,
};

export function HistoryScreen() {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [pbHistory, setPbHistory] = useState<PBRecord[]>([]);
  const [streak, setStreak] = useState(0);
  const [weekSessions, setWeekSessions] = useState(0);
  const [startingPB, setStartingPB] = useState<number | null>(null);
  const [currentPB, setCurrentPB] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const [s, pb, st, ws, profile] = await Promise.all([
      getSessions(),
      getPBHistory(),
      getStreak(),
      getSessionsThisWeek(),
      getUserProfile(),
    ]);
    setSessions(s.filter((session) => session.status === 'complete').slice(0, 50));
    setPbHistory(pb.slice(0, 20));
    setStreak(st);
    setWeekSessions(ws.length);
    setCurrentPB(profile?.staticPB ?? null);
    setStartingPB(pb.length > 0 ? pb[pb.length - 1]?.value ?? null : null);
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const totalHoldTime = sessions.reduce((acc, s) => acc + s.totalHoldTime, 0);
  const growthPercent = startingPB && currentPB ? calcPBGrowthPercent(startingPB, currentPB) : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText variant="displayMedium">{Copy.history.title}</AppText>
        </View>

        {/* Key metrics */}
        <MetricRow style={styles.metricRow}>
          <MetricCard
            label={Copy.home.streakLabel}
            value={String(streak)}
            unit="days"
            accent={Colors.accent}
            style={styles.metricFlex}
          />
          <MetricCard
            label="This Week"
            value={String(weekSessions)}
            unit="sessions"
            style={styles.metricFlex}
          />
        </MetricRow>
        <MetricRow style={styles.metricRow}>
          <MetricCard
            label="Total Sessions"
            value={String(sessions.length)}
            style={styles.metricFlex}
          />
          <MetricCard
            label="Total Hold Time"
            value={secondsToMMSS(totalHoldTime)}
            accent={Colors.primary}
            style={styles.metricFlex}
          />
        </MetricRow>

        {/* PB growth */}
        {currentPB && (
          <View style={styles.section}>
            <AppText variant="label" style={styles.sectionTitle}>PB TIMELINE</AppText>
            <AppCard accent={Colors.primary} elevated>
              <View style={styles.pbRow}>
                <View style={styles.pbItem}>
                  <AppText variant="label" color={Colors.textSecondary}>STARTING PB</AppText>
                  <AppText variant="metricSmall">
                    {startingPB ? secondsToMMSS(startingPB) : '—'}
                  </AppText>
                </View>
                <AppText style={{ fontSize: 20, color: Colors.textTertiary }}>→</AppText>
                <View style={styles.pbItem}>
                  <AppText variant="label" color={Colors.textSecondary}>CURRENT PB</AppText>
                  <AppText variant="metricSmall" color={Colors.primary}>{secondsToMMSS(currentPB)}</AppText>
                </View>
                {growthPercent !== null && growthPercent > 0 && (
                  <>
                    <AppText style={{ fontSize: 20, color: Colors.textTertiary }}>→</AppText>
                    <View style={styles.pbItem}>
                      <AppText variant="label" color={Colors.textSecondary}>GROWTH</AppText>
                      <AppText variant="metricSmall" color={Colors.success}>+{growthPercent}%</AppText>
                    </View>
                  </>
                )}
              </View>
              {pbHistory.length > 1 && (
                <View style={styles.pbHistory}>
                  {pbHistory.slice(0, 5).map((record, i) => (
                    <View key={i} style={styles.pbHistoryRow}>
                      <AppText variant="caption" color={Colors.textSecondary}>
                        {formatShortDate(record.recordedAt)}
                      </AppText>
                      <AppText variant="captionStrong" color={Colors.primary}>
                        {secondsToMMSS(record.value)}
                      </AppText>
                    </View>
                  ))}
                </View>
              )}
            </AppCard>
          </View>
        )}

        {/* Session list */}
        <View style={styles.section}>
          <AppText variant="label" style={styles.sectionTitle}>{Copy.history.recentSessions.toUpperCase()}</AppText>
          {sessions.length === 0 ? (
            <AppCard>
              <AppText variant="body" color={Colors.textSecondary} align="center">
                {Copy.history.noHistory}
              </AppText>
            </AppCard>
          ) : (
            <View style={styles.sessionList}>
              {sessions.map((session) => (
                <SessionHistoryRow key={session.id} session={session} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SessionHistoryRow({ session }: { session: TrainingSession }) {
  const accentColor = MODE_COLORS[session.mode] ?? Colors.primary;
  const roundsComplete = session.rounds.length;

  return (
    <View style={styles.sessionRow}>
      <View style={[styles.sessionModeDot, { backgroundColor: accentColor }]} />
      <View style={styles.sessionInfo}>
        <View style={styles.sessionTop}>
          <AppText variant="h3">{session.tableLabel}</AppText>
          {session.isPersonalBest && (
            <View style={styles.pbBadge}>
              <AppText variant="captionStrong" color={Colors.pro}>PB</AppText>
            </View>
          )}
        </View>
        <AppText variant="caption" color={Colors.textSecondary}>
          {formatRelativeDate(session.startedAt)} · {roundsComplete} rounds · Hold {secondsToMMSS(session.totalHoldTime)}
        </AppText>
        {session.effortScore !== undefined && (
          <AppText variant="caption" color={Colors.textTertiary}>
            Effort: {session.effortScore}/5
          </AppText>
        )}
      </View>
      <View style={styles.sessionMode}>
        <AppText variant="label" color={accentColor}>{session.mode}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.huge,
    gap: Spacing.xl,
  },
  header: {
    paddingTop: Spacing.lg,
  },
  metricRow: {
    gap: Spacing.sm,
    marginTop: -Spacing.sm,
  },
  metricFlex: {
    flex: 1,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: 2,
  },
  pbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pbItem: {
    alignItems: 'center',
    gap: 4,
  },
  pbHistory: {
    marginTop: Spacing.md,
    gap: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
  },
  pbHistoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionList: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderFaint,
    gap: Spacing.md,
  },
  sessionModeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  sessionInfo: {
    flex: 1,
    gap: 3,
  },
  sessionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pbBadge: {
    backgroundColor: Colors.proMuted,
    borderRadius: Radius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sessionMode: {
    alignItems: 'flex-end',
  },
});
