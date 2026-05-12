import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radius, Shadow } from '../constants/spacing';
import { hapticLight } from '../utils/haptics';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
  accent?: string;
  noPad?: boolean;
}

export function AppCard({ children, style, onPress, elevated = false, accent, noPad = false }: AppCardProps) {
  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? Colors.surfaceElevated : Colors.surface,
    borderColor: accent ?? Colors.border,
    borderWidth: accent ? 1 : 1,
    borderLeftWidth: accent ? 3 : 1,
    padding: noPad ? 0 : Spacing.base,
    borderRadius: Radius.lg,
    ...Shadow.sm,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={async () => {
          await hapticLight();
          onPress();
        }}
        activeOpacity={0.8}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

export function AppCardRow({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
