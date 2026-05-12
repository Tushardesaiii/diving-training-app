import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { ProgressRing } from './ProgressRing';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { secondsToMMSS } from '../utils/apnea';
import { PHASE_COLORS, PHASE_LABELS } from '../constants/training';
import { TrainingPhase } from '../types/app';

interface SessionTimerProps {
  phase: TrainingPhase;
  timeRemaining: number;
  phaseDuration: number;
  currentRound: number;
  totalRounds: number;
  size?: number;
}

export function SessionTimer({
  phase,
  timeRemaining,
  phaseDuration,
  currentRound,
  totalRounds,
  size = 260,
}: SessionTimerProps) {
  const progress = phaseDuration > 0 ? 1 - timeRemaining / phaseDuration : 1;
  const phaseColor = PHASE_COLORS[phase] ?? Colors.primary;
  const phaseLabel = PHASE_LABELS[phase] ?? phase.toUpperCase();

  return (
    <View style={styles.container}>
      <ProgressRing
        size={size}
        strokeWidth={6}
        progress={progress}
        color={phaseColor}
        trackColor={Colors.border}
      >
        <View style={styles.inner}>
          {/* Phase label */}
          <AppText variant="label" color={phaseColor} style={styles.phaseLabel}>
            {phaseLabel}
          </AppText>

          {/* Main timer */}
          <AppText
            variant="timerDisplay"
            color={Colors.text}
            style={styles.timer}
          >
            {secondsToMMSS(timeRemaining)}
          </AppText>

          {/* Round indicator */}
          {phase !== 'complete' && (
            <AppText variant="bodySmall" color={Colors.textSecondary}>
              Round {currentRound} of {totalRounds}
            </AppText>
          )}

          {phase === 'complete' && (
            <AppText variant="bodySmall" color={Colors.success}>
              Session Complete
            </AppText>
          )}
        </View>
      </ProgressRing>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  phaseLabel: {
    letterSpacing: 3,
  },
  timer: {
    lineHeight: 88,
  },
});
