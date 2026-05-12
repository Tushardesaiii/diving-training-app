import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, Timer, Fish, ChevronRight, ClipboardList } from 'lucide-react-native';
import { LungsIcon } from '../../components/LungsIcon';
import { Colors } from '../../constants/colors';
import { AppText } from '../../components/AppText';
import { RootStackParamList, TrainingMode, UserProfile, PersonalizedPlan } from '../../types/app';
import {
  getUserProfile,
  getPlan,
  getStreak,
  getSessionsThisWeek,
} from '../../storage/appStorage';
import {
  secondsToMMSS,
  buildCO2TrainingTable,
  buildO2TrainingTable,
  buildMaxHoldTable,
} from '../../utils/apnea';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [plan, setPlan] = useState<PersonalizedPlan | null>(null);
  const [streak, setStreak] = useState(0);
  const [weekSessions, setWeekSessions] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const [p, pl, s, weeklyS] = await Promise.all([
      getUserProfile(),
      getPlan(),
      getStreak(),
      getSessionsThisWeek(),
    ]);
    setProfile(p);
    setPlan(pl);
    setStreak(s);
    setWeekSessions(weeklyS.length);
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

  function startSession(mode: TrainingMode) {
    if (!profile) {
      navigation.navigate('PersonalBestSetup');
      return;
    }
    const pb = profile.staticPB;
    const tableId = `quick_${mode}_${Date.now()}`;
    let table;
    if (mode === 'CO2') table = buildCO2TrainingTable(pb, tableId);
    else if (mode === 'O2') table = buildO2TrainingTable(pb, tableId);
    else table = buildMaxHoldTable(pb, tableId);

    navigation.navigate('Session', { table });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.greetingRow}>
              <AppText variant="body" color={Colors.textSecondary}>Good morning, Diver</AppText>
              <View style={styles.statusDot} />
            </View>
            <AppText variant="h1" style={styles.title}>Ready to train?</AppText>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Bell size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <AppText variant="label" color={Colors.textSecondary} style={styles.statLabel}>CURRENT PB</AppText>
            <AppText variant="h2" style={styles.statValue}>{profile ? secondsToMMSS(profile.staticPB) : '—'}</AppText>
            <AppText variant="caption" color="#4ADE80">+12s vs last month</AppText>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <AppText variant="label" color={Colors.textSecondary} style={styles.statLabel}>STREAK</AppText>
              <AppText style={{ fontSize: 12 }}>🔥</AppText>
            </View>
            <AppText variant="h2" style={styles.statValue}>{streak}</AppText>
            <AppText variant="caption" color={Colors.textSecondary}>days</AppText>
          </View>
          <View style={styles.statCard}>
            <AppText variant="label" color={Colors.textSecondary} style={styles.statLabel}>THIS WEEK</AppText>
            <AppText variant="h2" style={styles.statValue}>{weekSessions}<AppText variant="h3" color="rgba(255,255,255,0.3)">/3</AppText></AppText>
            <AppText variant="caption" color={Colors.textSecondary}>sessions</AppText>
          </View>
        </View>

        {/* Quick Start Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <AppText variant="h3" style={{ color: '#FFFFFF', fontSize: 18 }}>Quick Start</AppText>
              <AppText variant="bodySmall" color={Colors.textSecondary}>Pick a training mode</AppText>
            </View>
            <TouchableOpacity>
              <AppText variant="bodySmall" style={{ color: '#00D1FF' }}>Learn more</AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {/* CO2 Table */}
            <TouchableOpacity 
              style={[styles.gridItem, { borderColor: 'rgba(0, 209, 255, 0.15)' }]}
              onPress={() => startSession('CO2')}
            >
              <View style={[styles.gridIcon, { backgroundColor: 'rgba(0, 209, 255, 0.1)' }]}>
                <LungsIcon size={20} color="#00D1FF" />
              </View>
              <View style={styles.itemTextContainer}>
                <AppText variant="h4" style={styles.itemTitle}>CO₂ Table</AppText>
                <AppText variant="caption" color={Colors.textSecondary} numberOfLines={2} style={{ fontSize: 11 }}>
                  Constant hold, decreasing rest
                </AppText>
              </View>
            </TouchableOpacity>

            {/* O2 Table */}
            <TouchableOpacity 
              style={[styles.gridItem, { borderColor: 'rgba(165, 214, 167, 0.15)' }]}
              onPress={() => startSession('O2')}
            >
              <View style={[styles.gridIcon, { backgroundColor: 'rgba(165, 214, 167, 0.1)' }]}>
                <LungsIcon size={20} color="#A5D6A7" />
              </View>
              <View style={styles.itemTextContainer}>
                <AppText variant="h4" style={styles.itemTitle}>O₂ Table</AppText>
                <AppText variant="caption" color={Colors.textSecondary} numberOfLines={2} style={{ fontSize: 11 }}>
                  Increasing hold, constant rest
                </AppText>
              </View>
            </TouchableOpacity>

            {/* Max Hold */}
            <TouchableOpacity 
              style={[styles.gridItem, { borderColor: 'rgba(124, 92, 248, 0.15)', backgroundColor: 'rgba(124, 92, 248, 0.03)' }]}
              onPress={() => startSession('MAX')}
            >
              <View style={[styles.gridIcon, { backgroundColor: 'rgba(124, 92, 248, 0.1)' }]}>
                <Timer size={20} color="#7C5CF8" />
              </View>
              <View style={styles.itemTextContainer}>
                <AppText variant="h4" style={styles.itemTitle}>Max Hold</AppText>
                <AppText variant="caption" color={Colors.textSecondary} numberOfLines={2} style={{ fontSize: 11 }}>
                  Max breath-hold attempt
                </AppText>
              </View>
            </TouchableOpacity>

            {/* Spearfishing */}
            <TouchableOpacity 
              style={[styles.gridItem, { borderColor: 'rgba(20, 184, 166, 0.15)' }]}
              onPress={() => {}}
            >
              <View style={[styles.gridIcon, { backgroundColor: 'rgba(20, 184, 166, 0.1)' }]}>
                <Fish size={20} color="#14B8A6" />
              </View>
              <View style={styles.itemTextContainer}>
                <AppText variant="h4" style={styles.itemTitle}>Spearfishing</AppText>
                <AppText variant="caption" color={Colors.textSecondary} numberOfLines={2} style={{ fontSize: 11 }}>
                  Spearfishing specific training
                </AppText>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personalized Plan */}
        <TouchableOpacity style={styles.planCard} activeOpacity={0.9}>
          <View style={styles.planHeader}>
            <View style={styles.planIcon}>
               <ClipboardList size={22} color="#00D1FF" />
            </View>
            <View style={styles.planInfo}>
              <AppText variant="h4" style={{ fontSize: 15, color: '#FFFFFF' }}>Personalized Plan</AppText>
              <AppText variant="caption" color={Colors.textSecondary}>You have a 8-week plan in progress</AppText>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.3)" />
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '35%' }]} />
            </View>
            <AppText variant="caption" color={Colors.textSecondary} style={styles.progressText}>Week 2 of 8</AppText>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020B14' }, // Matched background from image
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#020B14',
    backgroundColor: '#00D1FF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 2,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  gridItem: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  gridIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 1,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  planIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 209, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 209, 255, 0.15)',
  },
  planInfo: {
    flex: 1,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D1FF',
  },
  progressText: {
    fontSize: 11,
    fontWeight: '500',
  },
});