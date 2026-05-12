import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/spacing';
import { TableRound } from '../types/app';
import { secondsToMMSS } from '../utils/apnea';

interface TableRowCardProps {
  round: TableRound;
  isActive?: boolean;
  isComplete?: boolean;
  isCurrent?: boolean;
  phase?: 'hold' | 'rest';
  style?: ViewStyle;
}

export function TableRowCard({
  round,
  isActive = false,
  isComplete = false,
  isCurrent = false,
  phase,
  style,
}: TableRowCardProps) {
  const holdColor = isCurrent && phase === 'hold' ? Colors.phaseHold : isComplete ? Colors.textTertiary : Colors.text;
  const restColor = isCurrent && phase === 'rest' ? Colors.phaseRest : isComplete ? Colors.textTertiary : Colors.textSecondary;
  const borderColor = isCurrent ? Colors.primary : isComplete ? Colors.borderMuted : Colors.border;
  const bgColor = isCurrent ? Colors.primaryMuted : isComplete ? Colors.borderFaint : Colors.surface;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor,
          borderWidth: isCurrent ? 1.5 : 1,
        },
        style,
      ]}
    >
      {/* Round number badge */}
      <View style={[styles.badge, isCurrent && styles.badgeActive, isComplete && styles.badgeComplete]}>
        {isComplete ? (
          <AppText variant="captionStrong" color={Colors.success}>✓</AppText>
        ) : (
          <AppText variant="captionStrong" color={isCurrent ? Colors.primary : Colors.textSecondary}>
            {round.round}
          </AppText>
        )}
      </View>

      {/* Hold */}
      <View style={styles.cell}>
        <AppText variant="label" color={Colors.textTertiary}>HOLD</AppText>
        <AppText
          variant="metricSmall"
          color={holdColor}
          style={isCurrent && phase === 'hold' ? styles.activeText : undefined}
        >
          {secondsToMMSS(round.holdDuration)}
        </AppText>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Rest */}
      <View style={styles.cell}>
        <AppText variant="label" color={Colors.textTertiary}>REST</AppText>
        {round.restDuration > 0 ? (
          <AppText
            variant="metricSmall"
            color={restColor}
            style={isCurrent && phase === 'rest' ? styles.restActiveText : undefined}
          >
            {secondsToMMSS(round.restDuration)}
          </AppText>
        ) : (
          <AppText variant="bodySmall" color={Colors.textTertiary}>—</AppText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeActive: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  badgeComplete: {
    backgroundColor: Colors.successMuted,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  activeText: {
    color: Colors.phaseHold,
  },
  restActiveText: {
    color: Colors.phaseRest,
  },
});
