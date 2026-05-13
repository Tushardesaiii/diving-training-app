import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, ChevronRight, CheckCircle2, Play, Target, Award, TrendingUp } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Copy } from '../../constants/copy';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { KidneyIcon } from '../../components/KidneyIcon';
import { LungsFillIcon } from '../../components/LungsFillIcon';
import { RootStackParamList, PersonalizedPlan, WeeklyPlan, WeeklySession, UserProfile } from '../../types/app';
import { getUserProfile, getPlan } from '../../storage/appStorage';
import { secondsToMMSS, calcPBGrowthPercent } from '../../utils/apnea';
import { hapticLight } from '../../utils/haptics';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const MODE_COLORS: Record<string, string> = {
  CO2: Colors.primary,
  O2: Colors.success,
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
          <LinearGradient
            colors={['rgba(0, 209, 255, 0.2)', 'rgba(0, 209, 255, 0)']}
            style={styles.emptyGlow}
          />
          <KidneyIcon size={80} color={Colors.primary} />
          <AppText variant="h1" align="center" style={{ marginTop: 20 }}>No Plan Yet</AppText>
          <AppText variant="body" color={Colors.textSecondary} align="center" style={styles.emptyBody}>
            Set your personal best and we'll generate an 8-week progressive training plan tailored to your level.
          </AppText>
          <AppButton
            label="Start Setup"
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
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText variant="displayMedium" style={styles.title}>{Copy.plan.title}</AppText>
          <AppText variant="body" color={Colors.textSecondary}>Your journey to {secondsToMMSS(plan.targetPB)}</AppText>
        </View>

        {/* Plan Overview Card */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
          style={styles.overviewCard}
        >
          <View style={styles.overviewHeader}>
            <View style={styles.overviewIcon}>
              <Target size={20} color={Colors.primary} />
            </View>
            <View>
              <AppText variant="label" color={Colors.textTertiary}>CURRENT GOAL</AppText>
              <AppText variant="h3">8-Week Progression</AppText>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <AppText variant="label" color={Colors.textSecondary}>BASE</AppText>
              <AppText variant="h2">{secondsToMMSS(plan.basePB)}</AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <AppText variant="label" color={Colors.textSecondary}>TARGET</AppText>
              <AppText variant="h2" color={Colors.primary}>{secondsToMMSS(plan.targetPB)}</AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <AppText variant="label" color={Colors.textSecondary}>GAINS</AppText>
              <AppText variant="h2" color={Colors.success}>+{growthPercent}%</AppText>
            </View>
          </View>

          <View style={styles.progressContainer}>
             <View style={styles.progressLabelRow}>
                <AppText variant="captionStrong" color={Colors.textSecondary}>PROGRESS</AppText>
                <AppText variant="captionStrong" color={Colors.primary}>{Math.round((plan.currentWeek / 8) * 100)}%</AppText>
             </View>
             <View style={styles.fullProgressBar}>
                <LinearGradient
                  colors={[Colors.primary, Colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.fullProgressFill, { width: `${(plan.currentWeek / 8) * 100}%` }]}
                />
             </View>
          </View>
        </LinearGradient>

        {/* Roadmap Title */}
        <View style={styles.sectionHeader}>
          <AppText variant="h3">Training Roadmap</AppText>
          <AppText variant="caption" color={Colors.textSecondary}>Week {plan.currentWeek} of 8</AppText>
        </View>

        {/* Week list */}
        <View style={styles.roadmapContainer}>
          {plan.weeks.map((week, idx) => (
            <WeekCard
              key={week.week}
              week={week}
              isExpanded={expandedWeek === week.week}
              isLast={idx === plan.weeks.length - 1}
              onToggle={async () => {
                await hapticLight();
                setExpandedWeek((prev) => (prev === week.week ? null : week.week));
              }}
              onStartSession={(session) => {
                navigation.navigate('Session', { table: session.table, isPersonalized: true, weekIndex: week.week - 1 });
              }}
            />
          ))}
        </View>

        <AppText variant="caption" color={Colors.textTertiary} align="center" style={styles.adaptNote}>
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
  isLast?: boolean;
  onToggle: () => void;
  onStartSession: (session: WeeklySession) => void;
}

function WeekCard({ week, isExpanded, isLast, onToggle, onStartSession }: WeekCardProps) {
  const completedCount = week.sessions.filter((s) => s.isComplete).length;
  const isComplete = completedCount === week.sessions.length;
  const isActive = week.isCurrentWeek;
  const isLocked = !week.isUnlocked;
  
  const accentColor = isActive ? Colors.primary : isComplete ? Colors.success : Colors.textTertiary;

  return (
    <View style={styles.weekCardWrapper}>
      {/* Connector Line */}
      {!isLast && <View style={[styles.connector, isComplete && { backgroundColor: Colors.success }]} />}
      
      <View style={styles.weekCardContainer}>
        <TouchableOpacity
          activeOpacity={isLocked ? 1 : 0.7}
          onPress={isLocked ? undefined : onToggle}
          style={[
            styles.weekCard,
            isActive && styles.weekCardActive,
            isLocked && styles.weekCardLocked,
          ]}
        >
          {isActive && (
            <LinearGradient
              colors={['rgba(0, 209, 255, 0.12)', 'rgba(0, 209, 255, 0.03)']}
              style={StyleSheet.absoluteFill}
            />
          )}
          
          <View style={styles.weekHeader}>
            <View style={[
              styles.weekIndicator, 
              { backgroundColor: isComplete ? Colors.success : isLocked ? Colors.surfaceElevated : Colors.surfaceHighlight },
              isActive && { backgroundColor: Colors.primary, ...styles.indicatorGlow }
            ]}>
              {isComplete ? (
                <CheckCircle2 size={16} color="#FFFFFF" />
              ) : isLocked ? (
                <Lock size={14} color={Colors.textTertiary} />
              ) : (
                <AppText variant="captionStrong" color={isActive ? "#FFFFFF" : Colors.textSecondary}>{week.week}</AppText>
              )}
            </View>

            <View style={styles.weekMain}>
              <View style={styles.weekTitleRow}>
                <AppText variant="h3" color={isLocked ? Colors.textTertiary : Colors.text}>
                  Week {week.week}
                </AppText>
                {isActive && (
                  <View style={styles.currentBadge}>
                    <AppText variant="captionStrong" color={Colors.primary}>ACTIVE</AppText>
                  </View>
                )}
              </View>
              <AppText variant="caption" color={Colors.textSecondary}>
                Target: {secondsToMMSS(week.projectedPB)} · {completedCount}/{week.sessions.length} sessions
              </AppText>
            </View>

            {!isLocked && (
               <ChevronRight 
                size={20} 
                color={Colors.textTertiary} 
                style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }} 
              />
            )}
          </View>

          {/* Session list (expanded) */}
          {isExpanded && !isLocked && (
            <View style={styles.sessionList}>
              {week.sessions.map((session, i) => {
                const color = MODE_COLORS[session.type] ?? Colors.primary;
                const isSessComplete = session.isComplete;
                const Icon = session.type === 'MAX' ? KidneyIcon : LungsFillIcon;

                return (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.sessionRow,
                      isSessComplete && styles.sessionRowComplete,
                    ]}
                    onPress={() => !isSessComplete && onStartSession(session)}
                    disabled={isSessComplete}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.sessionIconBox, { backgroundColor: `${color}15` }]}>
                      <Icon size={20} color={isSessComplete ? Colors.textTertiary : color} />
                    </View>
                    
                    <View style={styles.sessionContent}>
                      <View style={styles.sessionMeta}>
                        <AppText variant="captionStrong" color={isSessComplete ? Colors.textTertiary : color}>
                          {DAY_LABELS[i].toUpperCase()} · {session.type}
                        </AppText>
                      </View>
                      <AppText variant="body" color={isSessComplete ? Colors.textTertiary : Colors.text} numberOfLines={1}>
                        {session.description}
                      </AppText>
                    </View>

                    {isSessComplete ? (
                      <CheckCircle2 size={20} color={Colors.success} />
                    ) : (
                      <View style={[styles.playBtn, { borderColor: color }]}>
                        <Play size={12} color={color} fill={color} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: 120,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  overviewCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 32,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  overviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 209, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 209, 255, 0.2)',
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressContainer: {
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fullProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roadmapContainer: {
    gap: 0,
  },
  weekCardWrapper: {
    flexDirection: 'row',
    minHeight: 80,
  },
  connector: {
    position: 'absolute',
    left: 20,
    top: 40,
    bottom: -16,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: -1,
  },
  weekCardContainer: {
    flex: 1,
    marginBottom: 16,
  },
  weekCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  weekCardActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 209, 255, 0.02)',
  },
  weekCardLocked: {
    opacity: 0.7,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  weekIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  indicatorGlow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  weekMain: {
    flex: 1,
    gap: 2,
  },
  weekTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentBadge: {
    backgroundColor: 'rgba(0, 209, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sessionList: {
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  sessionRowComplete: {
    opacity: 0.5,
  },
  sessionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionContent: {
    flex: 1,
    gap: 2,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: '20%',
    zIndex: -1,
  },
  emptyBody: {
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 32,
  },
  emptyBtn: {
    width: 200,
  },
  adaptNote: {
    marginTop: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});

