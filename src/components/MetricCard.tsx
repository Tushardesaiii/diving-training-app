import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { AppCard } from './AppCard';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  subtext?: string;
  accent?: string;
  style?: ViewStyle;
  onPress?: () => void;
}

export function MetricCard({ label, value, unit, subtext, accent, style, onPress }: MetricCardProps) {
  return (
    <AppCard style={style} accent={accent} onPress={onPress} elevated>
      <AppText variant="label" color={accent ?? Colors.textSecondary}>
        {label}
      </AppText>
      <View style={styles.valueRow}>
        <AppText variant="metricLarge" color={accent ?? Colors.text}>
          {value}
        </AppText>
        {unit ? (
          <AppText variant="bodySmall" color={Colors.textSecondary} style={styles.unit}>
            {unit}
          </AppText>
        ) : null}
      </View>
      {subtext ? (
        <AppText variant="caption" style={styles.subtext}>
          {subtext}
        </AppText>
      ) : null}
    </AppCard>
  );
}

export function MetricRow({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  valueRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  unit: {
    marginBottom: 4,
  },
  subtext: {
    marginTop: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
