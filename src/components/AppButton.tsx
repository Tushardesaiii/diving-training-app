import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { AppText } from './AppText';
import { hapticLight, hapticMedium } from '../utils/haptics';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'pro';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: Colors.primary, text: Colors.textInverse },
  secondary: { bg: Colors.surfaceElevated, text: Colors.text, border: Colors.border },
  ghost: { bg: 'transparent', text: Colors.primary },
  danger: { bg: Colors.danger, text: Colors.text },
  pro: { bg: Colors.pro, text: '#1A1000' },
};

const SIZE_STYLES: Record<ButtonSize, { height: number; px: number; textVariant: 'buttonLarge' | 'button' | 'buttonSmall' }> = {
  lg: { height: 56, px: Spacing.xl, textVariant: 'buttonLarge' },
  md: { height: 48, px: Spacing.lg, textVariant: 'button' },
  sm: { height: 38, px: Spacing.md, textVariant: 'buttonSmall' },
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  icon,
}: AppButtonProps) {
  const variantStyle = VARIANT_STYLES[variant];
  const sizeStyle = SIZE_STYLES[size];

  async function handlePress() {
    if (variant === 'primary' || variant === 'pro') {
      await hapticMedium();
    } else {
      await hapticLight();
    }
    onPress();
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          backgroundColor: variantStyle.bg,
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.px,
          borderColor: variantStyle.border ?? 'transparent',
          borderWidth: variantStyle.border ? 1 : 0,
          opacity: disabled ? 0.45 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text} size="small" />
      ) : (
        <View style={styles.row}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <AppText
            variant={sizeStyle.textVariant}
            style={{ color: variantStyle.text } as TextStyle}
          >
            {label}
          </AppText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
});
