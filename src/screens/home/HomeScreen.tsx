import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, Timer, Fish, ChevronRight, LayoutGrid } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LungsIcon } from '../../components/LungsIcon';
import { KidneyIcon } from '../../components/KidneyIcon';
import { LungsFillIcon } from '../../components/LungsFillIcon';
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

const { width } = Dimensions.get('window');
const GRID_SPACING = 16;
const ITEM_WIDTH = (width - 40 - GRID_SPACING) / 2;

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
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
              <AppText variant="bodySmall" color="rgba(255,255,255,0.5)">Select a training mode to begin</AppText>
            </View>
            <TouchableOpacity>
              <AppText variant="bodySmall" style={{ color: Colors.primary, fontWeight: '600' }}>Learn more</AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {/* CO2 Table */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => startSession('CO2')}
            >
              <LinearGradient
                colors={['rgba(0, 209, 255, 0.08)', 'rgba(0, 209, 255, 0.02)']}
                style={[styles.gridItem, { borderColor: 'rgba(0, 209, 255, 0.15)' }]}
              >
                <View style={[styles.gridIcon, { backgroundColor: 'rgba(0, 209, 255, 0.1)' }]}>
                  <LungsFillIcon size={32} color={Colors.primary} />
                </View>
                <View style={styles.itemTextContainer}>
                  <AppText style={styles.itemTitle}>CO₂ Table</AppText>
                  <AppText style={styles.itemCaption}>Build CO₂ tolerance with decreasing rest</AppText>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* O2 Table */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => startSession('O2')}
            >
              <LinearGradient
                colors={['rgba(16, 199, 111, 0.08)', 'rgba(16, 199, 111, 0.02)']}
                style={[styles.gridItem, { borderColor: 'rgba(16, 199, 111, 0.15)' }]}
              >
                <View style={[styles.gridIcon, { backgroundColor: 'rgba(16, 199, 111, 0.1)' }]}>
                  <LungsFillIcon size={32} color={Colors.success} />
                </View>
                <View style={styles.itemTextContainer}>
                  <AppText style={styles.itemTitle}>O₂ Table</AppText>
                  <AppText style={styles.itemCaption}>Improve O₂ efficiency with increasing hold</AppText>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Max Hold */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => startSession('MAX')}
            >
              <LinearGradient
                colors={['rgba(124, 92, 248, 0.08)', 'rgba(124, 92, 248, 0.02)']}
                style={[styles.gridItem, { borderColor: 'rgba(124, 92, 248, 0.15)' }]}
              >
                <View style={[styles.gridIcon, { backgroundColor: 'rgba(124, 92, 248, 0.1)' }]}>
                  <KidneyIcon size={32} color={Colors.phaseBreathe} />
                </View>
                <View style={styles.itemTextContainer}>
                  <AppText style={styles.itemTitle}>Max Hold</AppText>
                  <AppText style={styles.itemCaption}>Test your limits with a maximum hold</AppText>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Spearfishing */}
            <TouchableOpacity 
              activeOpacity={0.7}
              onPress={() => {}}
            >
              <LinearGradient
                colors={['rgba(255, 184, 0, 0.08)', 'rgba(255, 184, 0, 0.02)']}
                style={[styles.gridItem, { borderColor: 'rgba(255, 184, 0, 0.15)' }]}
              >
                <View style={[styles.gridIcon, { backgroundColor: 'rgba(255, 184, 0, 0.1)' }]}>
                  <KidneyIcon size={32} color={Colors.warning} />
                </View>
                <View style={styles.itemTextContainer}>
                  <AppText style={styles.itemTitle}>MDR Prep</AppText>
                  <AppText style={styles.itemCaption}>Trigger Mammalian Dive Reflex response</AppText>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personalized Plan */}
        <TouchableOpacity style={styles.planCard} activeOpacity={0.85}>
          <View style={styles.planHeader}>
            <View style={styles.planIcon}>
               <LayoutGrid size={24} color={Colors.primary} />
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
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 120,
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
    borderColor: Colors.background,
    backgroundColor: Colors.primary,
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
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    padding: 14,
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
    color: Colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  statSubText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 2,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_SPACING,
  },
  gridItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.15,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    justifyContent: 'space-between',
  },
  gridIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextContainer: {
    marginTop: 12,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  itemCaption: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 15,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 20,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primaryGlow,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  planInfo: {
    flex: 1,
  },
  progressWrapper: {
    gap: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
});