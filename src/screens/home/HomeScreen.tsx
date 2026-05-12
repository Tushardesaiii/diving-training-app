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
import { Bell, Timer, Fish, ChevronRight, Wind } from 'lucide-react-native';
import { LungsIcon } from '../../components/LungsIcon';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Copy } from '../../constants/copy';
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
import { hapticLight } from '../../utils/haptics';

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
            <Bell size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <AppText variant="label" color={Colors.textSecondary} style={styles.statLabel}>CURRENT PB</AppText>
            <AppText variant="h2" style={styles.statValue}>{profile ? secondsToMMSS(profile.staticPB) : '—'}</AppText>
            <AppText variant="caption" color={Colors.success}>+12s vs last month</AppText>
          </View>
          <View style={[styles.statCard, styles.statCardActive]}>
            <View style={styles.statHeader}>
              <AppText variant="label" color={Colors.textSecondary} style={styles.statLabel}>STREAK</AppText>
              <AppText style={{ fontSize: 14 }}>🔥</AppText>
            </View>
            <AppText variant="h2" style={styles.statValue}>{streak}</AppText>
            <AppText variant="caption" color={Colors.textSecondary}>days</AppText>
          </View>
          <View style={styles.statCard}>
            <AppText variant="label" color={Colors.textSecondary} style={styles.statLabel}>THIS WEEK</AppText>
            <AppText variant="h2" style={styles.statValue}>{weekSessions}<AppText variant="h3" color={Colors.textTertiary}> / 3</AppText></AppText>
            <AppText variant="caption" color={Colors.textSecondary}>sessions</AppText>
          </View>
        </View>

        {/* Quick Start Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <AppText variant="h3">Quick Start</AppText>
              <AppText variant="bodySmall" color={Colors.textSecondary}>Pick a training mode</AppText>
            </View>
            <TouchableOpacity>
              <AppText variant="bodySmall" color={Colors.primary}>Learn more</AppText>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity 
              style={[styles.gridItem, { backgroundColor: 'rgba(0, 209, 255, 0.05)', borderColor: 'rgba(0, 209, 255, 0.2)' }]}
              onPress={() => startSession('CO2')}
            >
              <View style={styles.gridIcon}>
                <LungsIcon size={24} color={Colors.primary} />
              </View>
              <View>
                <AppText variant="h4">CO₂ Table</AppText>
                <AppText variant="caption" color={Colors.textSecondary}>Constant hold, decreasing rest</AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gridItem, { backgroundColor: 'rgba(16, 229, 200, 0.05)', borderColor: 'rgba(16, 229, 200, 0.2)' }]}
              onPress={() => startSession('O2')}
            >
              <View style={styles.gridIcon}>
                <LungsIcon size={24} color={Colors.secondary} />
              </View>
              <View>
                <AppText variant="h4">O₂ Table</AppText>
                <AppText variant="caption" color={Colors.textSecondary}>Increasing hold, constant rest</AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gridItem, { backgroundColor: 'rgba(124, 92, 248, 0.05)', borderColor: 'rgba(124, 92, 248, 0.2)' }]}
              onPress={() => startSession('MAX')}
            >
              <View style={styles.gridIcon}>
                <Timer size={24} color="#7C5CF8" />
              </View>
              <View>
                <AppText variant="h4">Max Hold</AppText>
                <AppText variant="caption" color={Colors.textSecondary}>Max breath-hold attempt</AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.gridItem, { backgroundColor: 'rgba(16, 229, 200, 0.05)', borderColor: 'rgba(16, 229, 200, 0.2)' }]}
              onPress={() => {}}
            >
              <View style={styles.gridIcon}>
                <Fish size={24} color={Colors.secondary} />
              </View>
              <View>
                <AppText variant="h4">Spearfishing</AppText>
                <AppText variant="caption" color={Colors.textSecondary}>Spearfishing specific training</AppText>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personalized Plan */}
        <TouchableOpacity style={styles.planCard} activeOpacity={0.9}>
          <View style={styles.planHeader}>
            <View style={styles.planIcon}>
              <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} style={styles.planIconImg} />
            </View>
            <View style={styles.planInfo}>
              <AppText variant="h4">Personalized Plan</AppText>
              <AppText variant="caption" color={Colors.textSecondary}>You have a 8-week plan in progress</AppText>
            </View>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '25%' }]} />
            </View>
            <AppText variant="caption" color={Colors.textSecondary} style={styles.progressText}>Week 2 of 8</AppText>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00D1FF',
  },
  title: {
    marginTop: 4,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statCardActive: {
    borderColor: 'rgba(0, 209, 255, 0.3)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 24,
    marginVertical: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
    aspectRatio: 1.1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  gridIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  planIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 209, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planIconImg: {
    width: 20,
    height: 20,
    tintColor: Colors.primary,
  },
  planInfo: {
    flex: 1,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
  },
});
