import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Copy } from '../../constants/copy';
import { AppText } from '../../components/AppText';
import { AppCard } from '../../components/AppCard';
import { AppButton } from '../../components/AppButton';
import { RootStackParamList, PersonalizedPlan, WeeklyPlan, WeeklySession, UserProfile } from '../../types/app';
import { getUserProfile, getPlan } from '../../storage/appStorage';
import { secondsToMMSS, calcPBGrowthPercent } from '../../utils/apnea';
import { hapticLight } from '../../utils/haptics';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MODE_COLORS: Record<string, string> = {
  CO2: Colors.primary,
  O2: Colors.accent,
  MAX: '#7C5CF8',
};

const DAY_LABELS = ['Mon', 'Wed', 'Fri'];

export function PersonalizedPlanScreen() {
  const navigation = useNavigation<Nav>();
  const [plan, setPlan] = useState<PersonalizedPlan | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [p, pl] = await Promise.all([getUserProfile(), getPlan()]);
        setProfile(p);
        setPlan(pl);
        if (pl) {
          setExpandedWeek(pl.currentWeek);
        }
      }
      load();
    }, [])
  );

  if (!profile || !plan) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.emptyState}>
          <AppText style={{ fontSize: 56 }} align="center">◈</AppText>
          <AppText variant="h1" align="center">No Plan Yet</AppText>
          <AppText variant="body" color={Colors.textSecondary} align="center" style={styles.emptyBody}>
            Set your personal best and we'll generate an 8-week progressive training plan.
          </AppText>
          <AppButton
            label="Set My PB"
            onPress={() => navigation.navigate('PersonalBestSetup')}
            variant="primary"
            size="lg"
            fullWidth={false}
            style={styles.emptyBtn}
          />
        </View>
      </SafeAreaView>
    );
  }

  const growthPercent = calcPBGrowthPercent(plan.basePB, plan.targetPB);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText variant="displayMedium">{Copy.plan.title}</AppText>
          <View style={styles.planMeta}>
            <View style={styles.planMetaItem}>
              <AppText variant="label" color={Colors.textSecondary}>BASE PB</AppText>
              <AppText variant="metricSmall" color={Colors.text}>{secondsToMMSS(plan.basePB)}</AppText>
            </View>
            <View style={styles.planMetaDivider} />
            <View style={styles.planMetaItem}>
              <AppText variant="label" color={Colors.textSecondary}>TARGET PB</AppText>
              <AppText variant="metricSmall" color={Colors.primary}>{secondsToMMSS(plan.targetPB)}</AppText>
            </View>
            <View style={styles.planMetaDivider} />
            <View style={styles.planMetaItem}>
              <AppText variant="label" color={Colors.textSecondary}>IMPROVEMENT</AppText>
              <AppText variant="metricSmall" color={Colors.success}>+{growthPercent}%</AppText>
            </View>
          </View>
        </View>

        {/* Week progress bar */}
        <View style={styles.progressBar}>
          {plan.weeks.map((w) => (
            <View
              key={w.week}
              style={[
                styles.progressSegment,
                {
                  backgroundColor: w.isCurrentWeek
                    ? Colors.primary
                    : w.sessions.every((s) => s.isComplete)
                    ? Colors.success
                    : Colors.surfaceElevated,
                },
              ]}
            />
          ))}
        </View>
        <AppText variant="caption" color={Colors.textSecondary}>
          Week {plan.currentWeek} of 8
        </AppText>

        {/* Week list */}
        {plan.weeks.map((week) => (
          <WeekCard
            key={week.week}
            week={week}
            isExpanded={expandedWeek === week.week}
            onToggle={async () => {
              await hapticLight();
              setExpandedWeek((prev) => (prev === week.week ? null : week.week));
            }}
            onStartSession={(session) => {
              navigation.navigate('Session', { table: session.table, isPersonalized: true, weekIndex: week.week - 1 });
            }}
          />
        ))}

        {/* Adapt note */}
        <AppText variant="caption" color={Colors.textSecondary} align="center" style={styles.adaptNote}>
          {Copy.plan.adaptNote}
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Week card sub-component ───────────────────────────────────────────────────

interface WeekCardProps {
  week: WeeklyPlan;
  isExpanded: boolean;
  onToggle: () => void;
  onStartSession: (session: WeeklySession) => void;
}

function WeekCard({ week, isExpanded, onToggle, onStartSession }: WeekCardProps) {
  const completedCount = week.sessions.filter((s) => s.isComplete).length;
  const isComplete = completedCount === week.sessions.length;
  const accentColor = week.isCurrentWeek ? Colors.primary : isComplete ? Colors.success : Colors.border;

  return (
    <AppCard
      accent={accentColor}
      onPress={week.isUnlocked ? onToggle : undefined}
      style={styles.weekCard}
      noPad
    >
      {/* Week header */}
      <View style={styles.weekHeader}>
        <View style={styles.weekHeaderLeft}>
          <View style={[styles.weekBadge, { backgroundColor: `${accentColor}18`, borderColor: accentColor }]}>
            <AppText variant="captionStrong" color={accentColor}>{week.week}</AppText>
          </View>
          <View style={styles.weekInfo}>
            <AppText variant="h3" color={week.isUnlocked ? Colors.text : Colors.textTertiary}>
              Week {week.week}
              {week.isCurrentWeek ? ' · Current' : ''}
            </AppText>
            <AppText variant="caption" color={Colors.textSecondary}>
              Target PB: {secondsToMMSS(week.projectedPB)} · {completedCount}/{week.sessions.length} done
            </AppText>
          </View>
        </View>
        {!week.isUnlocked && (
          <AppText style={{ fontSize: 16, color: Colors.textTertiary }}>🔒</AppText>
        )}
        {week.isUnlocked && (
          <AppText variant="body" color={Colors.textSecondary}>{isExpanded ? '∧' : '∨'}</AppText>
        )}
      </View>

      {/* Session list (expanded) */}
      {isExpanded && week.isUnlocked && (
        <View style={styles.sessionList}>
          {week.sessions.map((session, i) => {
            const color = MODE_COLORS[session.type] ?? Colors.primary;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.sessionRow,
                  session.isComplete && styles.sessionRowComplete,
                ]}
                onPress={() => !session.isComplete && onStartSession(session)}
                disabled={session.isComplete}
                activeOpacity={0.7}
              >
                <View style={[styles.sessionDot, { backgroundColor: session.isComplete ? Colors.success : color }]} />
                <View style={styles.sessionInfo}>
                  <AppText variant="label" color={session.isComplete ? Colors.textTertiary : color}>
                    {DAY_LABELS[i]} · {session.type}
                  </AppText>
                  <AppText variant="body" color={session.isComplete ? Colors.textTertiary : Colors.text}>
                    {session.description}
                  </AppText>
                  <AppText variant="caption" color={Colors.textSecondary}>
                    {session.table.rounds.length} rounds · ~{Math.round(session.table.totalDuration / 60)} min
                  </AppText>
                </View>
                {session.isComplete ? (
                  <AppText variant="body" color={Colors.success}>✓</AppText>
                ) : (
                  <AppText style={{ fontSize: 18, color }}>▷</AppText>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.huge,
    gap: Spacing.base,
  },
  header: {
    paddingTop: Spacing.lg,
    gap: Spacing.base,
  },
  planMeta: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.base,
    alignItems: 'center',
  },
  planMetaItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  planMetaDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  progressBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    gap: 4,
    overflow: 'hidden',
  },
  progressSegment: {
    flex: 1,
    borderRadius: 3,
  },
  weekCard: {
    padding: 0,
    overflow: 'hidden',
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  weekHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  weekBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekInfo: {
    gap: 2,
  },
  sessionList: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderFaint,
    gap: Spacing.md,
  },
  sessionRowComplete: {
    opacity: 0.6,
  },
  sessionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sessionInfo: {
    flex: 1,
    gap: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.base,
  },
  emptyBody: {
    lineHeight: 24,
  },
  emptyBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.xxl,
  },
  adaptNote: {
    marginTop: Spacing.sm,
  },
});
