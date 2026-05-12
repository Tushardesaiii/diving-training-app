import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Copy } from '../../constants/copy';
import { AppText } from '../../components/AppText';
import { AppButton } from '../../components/AppButton';
import { TableRowCard } from '../../components/TableRowCard';
import { SessionTimer } from '../../components/SessionTimer';
import { RootStackParamList, TrainingSession } from '../../types/app';
import { useSessionTimer } from '../../hooks/useSessionTimer';
import { saveSession, updateStreak, getUserProfile, saveUserProfile, addPBRecord } from '../../storage/appStorage';
import { secondsToMMSS } from '../../utils/apnea';
import { hapticLight } from '../../utils/haptics';

type Route = RouteProp<RootStackParamList, 'Session'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const EFFORT_LABELS = ['Very Easy', 'Easy', 'Moderate', 'Hard', 'Max Effort'];
const EFFORT_COLORS = [Colors.accent, Colors.success, Colors.primary, Colors.warning, Colors.danger];

export function SessionScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { table } = route.params;

  const [timerState, controls] = useSessionTimer(table);
  const [sessionId] = useState(`session_${Date.now()}`);
  const [sessionStart] = useState(Date.now());
  const [showEffortPrompt, setShowEffortPrompt] = useState(false);
  const [selectedEffort, setSelectedEffort] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { status, phase, currentRound, totalRounds, timeRemaining, phaseDuration, completedRounds, totalHoldTime } = timerState;

  // Show effort prompt when session completes
  React.useEffect(() => {
    if (status === 'complete') {
      setShowEffortPrompt(true);
    }
  }, [status]);

  function handleBack() {
    if (status === 'running' || status === 'paused') {
      Alert.alert(
        'End Session?',
        'Your progress will be lost.',
        [
          { text: 'Keep Going', style: 'cancel' },
          {
            text: 'End Session',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }

  async function handleSaveSession(effort: number) {
    setIsSaving(true);
    try {
      const profile = await getUserProfile();
      const endTime = Date.now();

      // Check for new PB (MAX hold mode: single round hold time)
      let isNewPB = false;
      let newPBSeconds: number | undefined;
      if (table.mode === 'MAX' && completedRounds.length > 0 && profile) {
        const holdTime = completedRounds[0]?.actualHoldDuration ?? 0;
        if (holdTime > profile.staticPB) {
          isNewPB = true;
          newPBSeconds = holdTime;
          const updatedProfile = { ...profile, staticPB: holdTime, updatedAt: Date.now() };
          await saveUserProfile(updatedProfile);
          await addPBRecord({ value: holdTime, recordedAt: Date.now(), sessionId });
        }
      }

      const session: TrainingSession = {
        id: sessionId,
        tableId: table.id,
        mode: table.mode,
        tableLabel: table.label,
        startedAt: sessionStart,
        completedAt: endTime,
        duration: Math.round((endTime - sessionStart) / 1000),
        status: 'complete',
        rounds: completedRounds,
        totalHoldTime,
        effortScore: effort,
        isPersonalBest: isNewPB,
        newPB: newPBSeconds,
      };

      await saveSession(session);
      await updateStreak();

      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save session.');
    } finally {
      setIsSaving(false);
    }
  }

  // ─── Effort prompt overlay ────────────────────────────────────────────────

  if (showEffortPrompt) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.effortContainer}>
          {/* Session summary */}
          <View style={styles.effortSummary}>
            <AppText variant="displayMedium" align="center">{Copy.training.sessionComplete}</AppText>
            <View style={styles.effortStats}>
              <View style={styles.effortStat}>
                <AppText variant="label" color={Colors.textSecondary}>{Copy.training.holdTotal}</AppText>
                <AppText variant="metricLarge" color={Colors.primary}>{secondsToMMSS(totalHoldTime)}</AppText>
              </View>
              <View style={styles.effortStat}>
                <AppText variant="label" color={Colors.textSecondary}>{Copy.training.rounds}</AppText>
                <AppText variant="metricLarge">{completedRounds.length}</AppText>
              </View>
            </View>
          </View>

          {/* Effort rating */}
          <View style={styles.effortRating}>
            <AppText variant="h2" align="center">{Copy.training.effortPrompt}</AppText>
            <AppText variant="body" color={Colors.textSecondary} align="center">
              Rate this session to adapt your plan.
            </AppText>
            <View style={styles.effortButtons}>
              {EFFORT_LABELS.map((label, i) => {
                const score = i + 1;
                const isSelected = selectedEffort === score;
                return (
                  <TouchableOpacity
                    key={score}
                    style={[
                      styles.effortBtn,
                      { borderColor: EFFORT_COLORS[i], backgroundColor: isSelected ? `${EFFORT_COLORS[i]}22` : Colors.surface },
                    ]}
                    onPress={async () => {
                      await hapticLight();
                      setSelectedEffort(score);
                    }}
                  >
                    <AppText
                      variant="metricSmall"
                      color={isSelected ? EFFORT_COLORS[i] : Colors.textSecondary}
                    >
                      {score}
                    </AppText>
                    <AppText variant="caption" color={isSelected ? EFFORT_COLORS[i] : Colors.textTertiary}>
                      {label}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.effortActions}>
            <AppButton
              label={Copy.training.saveSession}
              onPress={() => handleSaveSession(selectedEffort ?? 3)}
              variant="primary"
              size="lg"
              loading={isSaving}
            />
            <TouchableOpacity
              style={styles.discardBtn}
              onPress={() => navigation.goBack()}
            >
              <AppText variant="body" color={Colors.textSecondary}>{Copy.training.discardSession}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Active session ───────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <AppText variant="body" color={Colors.textSecondary}>✕</AppText>
        </TouchableOpacity>
        <AppText variant="h3" align="center" style={styles.tableLabel} numberOfLines={1}>
          {table.label}
        </AppText>
        <View style={styles.backBtn} />
      </View>

      {/* Main timer area */}
      <View style={styles.timerArea}>
        <SessionTimer
          phase={phase}
          timeRemaining={timeRemaining}
          phaseDuration={phaseDuration}
          currentRound={currentRound}
          totalRounds={totalRounds}
          size={280}
        />

        {/* Total hold time */}
        {totalHoldTime > 0 && (
          <View style={styles.holdBadge}>
            <AppText variant="label" color={Colors.textSecondary}>TOTAL HOLD</AppText>
            <AppText variant="metricSmall" color={Colors.primary}>{secondsToMMSS(totalHoldTime)}</AppText>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {status === 'idle' && (
          <AppButton
            label="Start"
            onPress={controls.start}
            variant="primary"
            size="lg"
          />
        )}
        {status === 'running' && (
          <View style={styles.controlRow}>
            <AppButton
              label={Copy.training.pauseLabel}
              onPress={controls.pause}
              variant="secondary"
              size="lg"
              style={styles.controlBtn}
            />
            <AppButton
              label="Skip"
              onPress={controls.skipPhase}
              variant="ghost"
              size="lg"
              style={styles.controlBtnSmall}
            />
          </View>
        )}
        {status === 'paused' && (
          <View style={styles.controlRow}>
            <AppButton
              label={Copy.training.resumeLabel}
              onPress={controls.resume}
              variant="primary"
              size="lg"
              style={styles.controlBtn}
            />
            <AppButton
              label={Copy.training.resetLabel}
              onPress={() => {
                Alert.alert('Reset Session?', 'This will restart from round 1.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reset', style: 'destructive', onPress: controls.reset },
                ]);
              }}
              variant="ghost"
              size="lg"
              style={styles.controlBtnSmall}
            />
          </View>
        )}
        {status === 'complete' && (
          <AppButton
            label={Copy.training.completeSession}
            onPress={() => setShowEffortPrompt(true)}
            variant="primary"
            size="lg"
          />
        )}
      </View>

      {/* Round list */}
      <ScrollView
        style={styles.roundList}
        contentContainerStyle={styles.roundListContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {table.rounds.map((round) => {
          const isComplete = completedRounds.some((cr) => cr.round === round.round);
          const isCurrent = round.round === currentRound && status !== 'idle' && !isComplete;
          return (
            <TableRowCard
              key={round.round}
              round={round}
              isComplete={isComplete}
              isCurrent={isCurrent}
              phase={phase === 'rest' ? 'rest' : 'hold'}
              style={styles.roundCard}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableLabel: {
    flex: 1,
  },
  timerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  holdBadge: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  controls: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  controlRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  controlBtn: {
    flex: 2,
  },
  controlBtnSmall: {
    flex: 1,
  },
  roundList: {
    flex: 1,
  },
  roundListContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  roundCard: {},

  // Effort prompt
  effortContainer: {
    flex: 1,
    paddingHorizontal: Spacing.base,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xl,
  },
  effortSummary: {
    alignItems: 'center',
    gap: Spacing.xl,
  },
  effortStats: {
    flexDirection: 'row',
    gap: Spacing.xxl,
  },
  effortStat: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  effortRating: {
    gap: Spacing.base,
  },
  effortButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  effortBtn: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  effortActions: {
    gap: Spacing.base,
  },
  discardBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
});
