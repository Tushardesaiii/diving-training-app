import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, Timer, Fish, ChevronRight, LayoutGrid } from 'lucide-react-native';
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

  useFocusEffect(useCallback(() => { loadData(); }, []));

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D1FF" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.greetingRow}>
              <AppText variant="bodySmall" color="rgba(255,255,255,0.6)">Good morning, Diver</AppText>
              <View style={styles.statusDot} />
            </View>
            <AppText variant="h1" style={styles.title}>Ready to train?</AppText>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Bell size={24} color="#FFFFFF" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <AppText style={styles.statLabel}>CURRENT PB</AppText>
            <AppText style={styles.statValue}>{profile ? secondsToMMSS(profile.staticPB) : '2:45'}</AppText>
            <AppText style={styles.statChange}>+12s vs last month</AppText>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <AppText style={styles.statLabel}>STREAK</AppText>
              <AppText style={{ fontSize: 14 }}>🔥</AppText>
            </View>
            <AppText style={styles.statValue}>{streak || '5'}</AppText>
            <AppText style={styles.statSubText}>days</AppText>
          </View>
          <View style={styles.statCard}>
            <AppText style={styles.statLabel}>THIS WEEK</AppText>
            <AppText style={styles.statValue}>
              {weekSessions || '2'}<AppText style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16 }}>/3</AppText>
            </AppText>
            <AppText style={styles.statSubText}>sessions</AppText>
          </View>
        </View>

        {/* Quick Start Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <AppText variant="h3" style={styles.sectionTitle}>Quick Start</AppText>
              <AppText variant="bodySmall" color="rgba(255,255,255,0.5)">Pick a training mode</AppText>
            </View>
            <TouchableOpacity>
              <AppText variant="bodySmall" style={{ color: '#00D1FF', fontWeight: '600' }}>Learn more</AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {/* CO2 Table */}
            <TouchableOpacity 
              style={[styles.gridItem, { borderColor: 'rgba(0, 209, 255, 0.2)' }]}
              onPress={() => startSession('CO2')}
            >
              <View style={[styles.gridIcon, ]}>
                <LungsIcon size={24} color="#00D1FF" />
              </View>
              <View style={styles.itemTextContainer}>
                <AppText style={styles.itemTitle}>CO₂ Table</AppText>
                <AppText style={styles.itemCaption}>Constant hold, decreasing rest</AppText>
              </View>
            </TouchableOpacity>

            {/* O2 Table */}
            <TouchableOpacity 
              style={[styles.gridItem, { borderColor: 'rgba(165, 214, 167, 0.2)' }]}
              onPress={() => startSession('O2')}
            >
              <View style={[styles.gridIcon, ]}>
                <LungsIcon size={24} color="#A5D6A7" />
              </View>
              <View style={styles.itemTextContainer}>
                <AppText style={styles.itemTitle}>O₂ Table</AppText>
                <AppText style={styles.itemCaption}>Increasing hold, constant rest</AppText>
              </View>
            </TouchableOpacity>

            {/* Max Hold */}
            <TouchableOpacity 
              style={[styles.gridItem, { borderColor: 'rgba(124, 92, 248, 0.2)' }]}
              onPress={() => startSession('MAX')}
            >
              <View style={[styles.gridIcon,]}>
                <Timer size={24} color="#7C5CF8" />
              </View>
              <View style={styles.itemTextContainer}>
                <AppText style={styles.itemTitle}>Max Hold</AppText>
                <AppText style={styles.itemCaption}>Max breath-hold attempt</AppText>
              </View>
            </TouchableOpacity>

            {/* Spearfishing */}
            <TouchableOpacity 
              style={[styles.gridItem, { borderColor: 'rgba(20, 184, 166, 0.2)' }]}
              onPress={() => {}}
            >
              <View style={[styles.gridIcon,]}>
                <Fish size={24} color="#14B8A6" />
              </View>
              <View style={styles.itemTextContainer}>
                <AppText style={styles.itemTitle}>Spearfishing</AppText>
                <AppText style={styles.itemCaption}>Spearfishing specific training</AppText>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personalized Plan */}
        <TouchableOpacity style={styles.planCard} activeOpacity={0.85}>
          <View style={styles.planHeader}>
            <View style={styles.planIcon}>
               <LayoutGrid size={24} color="#00D1FF" />
            </View>
            <View style={styles.planInfo}>
              <AppText style={styles.planTitle}>Personalized Plan</AppText>
              <AppText style={styles.planSub}>You have a 8-week plan in progress</AppText>
            </View>
            <ChevronRight size={20} color="rgba(255,255,255,0.2)" />
          </View>
          <View style={styles.progressWrapper}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '35%' }]} />
            </View>
            <AppText style={styles.progressText}>Week 2 of 8</AppText>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020B14' },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20, // Reduced from 40 to bring UI down
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#020B14',
    backgroundColor: '#00D1FF',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
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
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  statChange: {
    fontSize: 11,
    color: '#4ADE80',
    fontWeight: '600',
    marginTop: 2,
  },
  statSubText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
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
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    
  },
  gridIcon: {
    width: 44, // Increased size
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  itemCaption: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    lineHeight: 13,
    marginTop: 2,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  planIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 209, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 209, 255, 0.2)',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  planInfo: {
    flex: 1,
  },
  progressWrapper: {
    gap: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D1FF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
});