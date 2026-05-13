import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Timer, Activity, TrendingUp, Trophy, Calendar, Award } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Copy } from '../../constants/copy';
import { AppText } from '../../components/AppText';
import { LungsFillIcon } from '../../components/LungsFillIcon';
import { KidneyIcon } from '../../components/KidneyIcon';
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

const { width } = Dimensions.get('window');
const METRIC_WIDTH = (width - 40 - 12) / 2;

const MODE_COLORS: Record<string, string> = {
  CO2: Colors.primary,
  O2: Colors.success,
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <AppText variant="displayMedium" style={styles.title}>{Copy.history.title}</AppText>
          <AppText variant="body" color={Colors.textSecondary}>Your training performance and milestones</AppText>
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          <LinearGradient
            colors={['rgba(255, 184, 0, 0.1)', 'rgba(255, 184, 0, 0.02)']}
            style={styles.metricCard}
          >
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(255, 184, 0, 0.1)' }]}>
              <Flame size={20} color="#FFB800" />
            </View>
            <View>
              <AppText variant="label" color={Colors.textTertiary}>STREAK</AppText>
              <AppText variant="h2">{streak} <AppText variant="bodySmall" color={Colors.textSecondary}>days</AppText></AppText>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(0, 209, 255, 0.1)', 'rgba(0, 209, 255, 0.02)']}
            style={styles.metricCard}
          >
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(0, 209, 255, 0.1)' }]}>
              <Activity size={20} color={Colors.primary} />
            </View>
            <View>
              <AppText variant="label" color={Colors.textTertiary}>THIS WEEK</AppText>
              <AppText variant="h2">{weekSessions} <AppText variant="bodySmall" color={Colors.textSecondary}>sess</AppText></AppText>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(16, 199, 111, 0.1)', 'rgba(16, 199, 111, 0.02)']}
            style={styles.metricCard}
          >
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(16, 199, 111, 0.1)' }]}>
              <Trophy size={20} color={Colors.success} />
            </View>
            <View>
              <AppText variant="label" color={Colors.textTertiary}>SESSIONS</AppText>
              <AppText variant="h2">{sessions.length}</AppText>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={['rgba(124, 92, 248, 0.1)', 'rgba(124, 92, 248, 0.02)']}
            style={styles.metricCard}
          >
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(124, 92, 248, 0.1)' }]}>
              <Timer size={20} color="#7C5CF8" />
            </View>
            <View>
              <AppText variant="label" color={Colors.textTertiary}>TOTAL HOLD</AppText>
              <AppText variant="h2">{secondsToMMSS(totalHoldTime)}</AppText>
            </View>
          </LinearGradient>
        </View>

        {/* PB Timeline Section */}
        {currentPB && (
          <View style={styles.section}>
             <View style={styles.sectionHeader}>
                <AppText variant="h3">PB Progression</AppText>
                <TrendingUp size={18} color={Colors.primary} />
             </View>
            
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
              style={styles.pbTimelineCard}
            >
              <View style={styles.pbVisual}>
                <View style={styles.pbPoint}>
                  <AppText variant="label" color={Colors.textTertiary}>STARTING</AppText>
                  <AppText variant="h3">{startingPB ? secondsToMMSS(startingPB) : '—'}</AppText>
                </View>
                <View style={styles.pbLineContainer}>
                  <View style={styles.pbLine} />
                  <LinearGradient
                    colors={[Colors.primary, Colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.pbLineFill}
                  />
                </View>
                <View style={styles.pbPoint}>
                  <AppText variant="label" color={Colors.textTertiary}>CURRENT</AppText>
                  <AppText variant="h3" color={Colors.primary}>{secondsToMMSS(currentPB)}</AppText>
                </View>
              </View>

              {growthPercent !== null && growthPercent > 0 && (
                <View style={styles.growthBadge}>
                  <Award size={14} color={Colors.success} />
                  <AppText variant="captionStrong" color={Colors.success}>+{growthPercent}% IMPROVEMENT</AppText>
                </View>
              )}

              {pbHistory.length > 1 && (
                <View style={styles.miniPbList}>
                  {pbHistory.slice(0, 3).map((record, i) => (
                    <View key={i} style={styles.miniPbRow}>
                       <View style={styles.miniPbDot} />
                       <AppText variant="caption" color={Colors.textSecondary} style={{ flex: 1, marginLeft: 12 }}>
                        {formatShortDate(record.recordedAt)}
                      </AppText>
                      <AppText variant="captionStrong" color={Colors.text}>
                        {secondsToMMSS(record.value)}
                      </AppText>
                    </View>
                  ))}
                </View>
              )}
            </LinearGradient>
          </View>
        )}

        {/* Recent Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3">{Copy.history.recentSessions}</AppText>
            <Calendar size={18} color={Colors.textTertiary} />
          </View>
          
          {sessions.length === 0 ? (
            <View style={styles.emptyCard}>
              <AppText variant="body" color={Colors.textSecondary} align="center">
                {Copy.history.noHistory}
              </AppText>
            </View>
          ) : (
            <View style={styles.sessionList}>
              {sessions.map((session, idx) => (
                <SessionHistoryRow 
                  key={session.id} 
                  session={session} 
                  isLast={idx === sessions.length - 1} 
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SessionHistoryRow({ session, isLast }: { session: TrainingSession; isLast?: boolean }) {
  const accentColor = MODE_COLORS[session.mode] ?? Colors.primary;
  const Icon = session.mode === 'MAX' ? KidneyIcon : LungsFillIcon;

  return (
    <View style={styles.sessionRowWrapper}>
       {!isLast && <View style={styles.sessionConnector} />}
       <View style={[styles.sessionIconBox, { backgroundColor: `${accentColor}15`, borderColor: `${accentColor}30` }]}>
          <Icon size={18} color={accentColor} />
       </View>
       
       <View style={styles.sessionMain}>
          <View style={styles.sessionTopRow}>
            <AppText variant="bodyStrong">{session.tableLabel}</AppText>
            <AppText variant="caption" color={Colors.textTertiary}>{formatRelativeDate(session.startedAt)}</AppText>
          </View>
          
          <View style={styles.sessionMetaRow}>
            <View style={styles.sessionMetaItem}>
               <AppText variant="caption" color={Colors.textSecondary}>
                {session.rounds.length} rounds · {secondsToMMSS(session.totalHoldTime)} hold
               </AppText>
            </View>
            {session.isPersonalBest && (
              <View style={styles.pbBadgeMini}>
                <AppText variant="captionStrong" color={Colors.pro}>PB</AppText>
              </View>
            )}
          </View>
       </View>

       <View style={styles.sessionRight}>
          <AppText variant="label" color={accentColor} style={{ fontSize: 10 }}>{session.mode}</AppText>
          {session.effortScore !== undefined && (
             <View style={styles.effortRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                   <View 
                    key={s} 
                    style={[
                      styles.effortDot, 
                      { backgroundColor: s <= session.effortScore ? accentColor : 'rgba(255,255,255,0.1)' }
                    ]} 
                  />
                ))}
             </View>
          )}
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
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  metricCard: {
    width: METRIC_WIDTH,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 12,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pbTimelineCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  pbVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pbPoint: {
    alignItems: 'center',
    gap: 4,
  },
  pbLineContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 16,
    borderRadius: 2,
    marginTop: 18,
  },
  pbLine: {
    ...StyleSheet.absoluteFillObject,
  },
  pbLineFill: {
    height: '100%',
    width: '100%',
    borderRadius: 2,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 199, 111, 0.1)',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    gap: 6,
    marginBottom: 20,
  },
  miniPbList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 16,
    gap: 10,
  },
  miniPbRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniPbDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  sessionList: {
    gap: 0,
  },
  sessionRowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 16,
  },
  sessionConnector: {
    position: 'absolute',
    left: 20,
    top: 40,
    bottom: -16,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: -1,
  },
  sessionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  sessionMain: {
    flex: 1,
    gap: 2,
  },
  sessionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pbBadgeMini: {
    backgroundColor: Colors.proMuted,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  sessionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  effortRow: {
    flexDirection: 'row',
    gap: 3,
  },
  effortDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  emptyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
});

