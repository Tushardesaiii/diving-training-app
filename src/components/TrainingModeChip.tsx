import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/spacing';
import { TrainingMode } from '../types/app';
import { hapticLight } from '../utils/haptics';

const MODE_CONFIG: Record<TrainingMode, { label: string; color: string }> = {
  CO2: { label: 'CO₂', color: Colors.primary },
  O2: { label: 'O₂', color: Colors.accent },
  MAX: { label: 'Max', color: '#7C5CF8' },
  SPEARO: { label: 'Spearo', color: Colors.warning },
};

interface TrainingModeChipProps {
  mode: TrainingMode;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function TrainingModeChip({ mode, selected = false, onPress, style }: TrainingModeChipProps) {
  const config = MODE_CONFIG[mode];

  return (
    <TouchableOpacity
      onPress={async () => {
        await hapticLight();
        onPress?.();
      }}
      activeOpacity={0.75}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? `${config.color}22` : Colors.surfaceElevated,
          borderColor: selected ? config.color : Colors.border,
        },
        style,
      ]}
      disabled={!onPress}
    >
      <AppText
        variant="buttonSmall"
        style={{ color: selected ? config.color : Colors.textSecondary }}
      >
        {config.label}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
