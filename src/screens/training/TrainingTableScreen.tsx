import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LungsIcon } from '../../components/LungsIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { AppText } from '../../components/AppText';
import { ProgressRing } from '../../components/ProgressRing';

import { ChevronLeft, Settings2 } from 'lucide-react-native';

export function TrainingTableScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerSide} activeOpacity={0.75}>
            <ChevronLeft size={26} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <LungsIcon size={18} color="#00D1FF" />
            <AppText variant="h4" color={Colors.text} style={styles.headerTitle}>
              CO₂ Table
            </AppText>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={[styles.headerSide, styles.headerRight]}
            activeOpacity={0.75}
          >
            <Settings2 size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Round Pill */}
          <View style={styles.roundPill}>
            <AppText variant="label" color={Colors.primary}>Round 3 <AppText variant="label" color={Colors.textSecondary}>of 6</AppText></AppText>
          </View>

          {/* Timer Ring */}
          <View style={styles.timerContainer}>
            <ProgressRing
              size={280}
              strokeWidth={4}
              progress={0.7}
              color={Colors.primary}
              trackColor="rgba(255, 255, 255, 0.05)"
            >
              <View style={styles.timerInner}>
                <AppText variant="label" color={Colors.textSecondary} style={{ letterSpacing: 2 }}>HOLD</AppText>
                <AppText style={styles.timerValue}>2:00</AppText>
                <AppText variant="bodySmall" color={Colors.primary}>Target 2:00</AppText>
              </View>
            </ProgressRing>
          </View>

          <AppText variant="body" color={Colors.textSecondary} align="center" style={styles.quote}>
            Keep calm and breathe slowly
          </AppText>

          {/* Horizontal Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <AppText variant="label" color={Colors.textSecondary}>Rest</AppText>
              <AppText variant="h3">1:30</AppText>
            </View>
            <View style={styles.statItem}>
              <AppText variant="label" color={Colors.textSecondary}>Round</AppText>
              <AppText variant="h3">3/6</AppText>
            </View>
            <View style={styles.statItem}>
              <AppText variant="label" color={Colors.textSecondary}>Total Time</AppText>
              <AppText variant="h3">12:45</AppText>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity activeOpacity={0.8}>
              <LinearGradient
                colors={['#00D1FF', '#10E5C8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtn}
              >
                <AppText variant="h4" color={Colors.textInverse}>End Hold</AppText>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn}>
              <AppText variant="h4" color={Colors.primary}>End Session</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  safe: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(1, 6, 13, 0.8)',
  },
  headerSide: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerTitle: {
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  roundPill: {
    backgroundColor: 'rgba(0, 209, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  timerContainer: {
    marginBottom: 40,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
  },
  timerValue: {
    fontSize: 78,
    fontWeight: '300',
    color: Colors.text,
    marginVertical: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textAlign: 'center',
    lineHeight: 88,
  },
  quote: {
    marginBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  secondaryBtn: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
