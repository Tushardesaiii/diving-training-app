import React from 'react';
import { View, TouchableOpacity, Switch, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from './AppText';
import { Colors } from '../constants/colors';
import { Spacing, Radius } from '../constants/spacing';
import { hapticLight } from '../utils/haptics';

interface SettingsRowProps {
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
  style?: ViewStyle;
  chevron?: boolean;
  leftIcon?: React.ReactNode;
}

export function SettingsRow({
  label,
  subtitle,
  onPress,
  rightElement,
  toggle,
  toggleValue,
  onToggle,
  destructive = false,
  style,
  chevron = true,
  leftIcon,
}: SettingsRowProps) {
  const content = (
    <View style={[styles.row, style]}>
      {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
      <View style={styles.text}>
        <AppText
          variant="body"
          color={destructive ? Colors.danger : Colors.text}
        >
          {label}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" style={styles.subtitle}>{subtitle}</AppText>
        ) : null}
      </View>
      {toggle && onToggle !== undefined ? (
        <Switch
          value={toggleValue ?? false}
          onValueChange={onToggle}
          trackColor={{ false: Colors.surfaceMuted, true: Colors.primaryMuted }}
          thumbColor={toggleValue ? Colors.primary : Colors.textSecondary}
          ios_backgroundColor={Colors.surfaceMuted}
        />
      ) : null}
      {rightElement && !toggle ? rightElement : null}
      {!toggle && !rightElement && onPress && chevron ? (
        <AppText variant="body" color={Colors.textTertiary}>›</AppText>
      ) : null}
    </View>
  );

  if (onPress && !toggle) {
    return (
      <TouchableOpacity
        onPress={async () => {
          await hapticLight();
          onPress();
        }}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export function SettingsSection({
  title,
  children,
  style,
}: {
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.section, style]}>
      {title ? (
        <AppText variant="label" style={styles.sectionTitle}>{title}</AppText>
      ) : null}
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderFaint,
    gap: Spacing.md,
  },
  leftIcon: {
    width: 32,
    alignItems: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  subtitle: {
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  sectionBody: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
