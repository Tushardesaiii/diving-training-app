import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

interface AppScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  scrollProps?: Omit<ScrollViewProps, 'style' | 'contentContainerStyle'>;
  safeEdges?: ('top' | 'bottom' | 'left' | 'right')[];
  padHorizontal?: boolean;
}

export function AppScreen({
  children,
  scrollable = true,
  style,
  contentStyle,
  scrollProps,
  safeEdges = ['top', 'bottom'],
  padHorizontal = true,
}: AppScreenProps) {
  const contentContainerStyle: ViewStyle = {
    paddingHorizontal: padHorizontal ? Spacing.base : 0,
    paddingBottom: Spacing.xxl,
    flexGrow: 1,
    ...contentStyle,
  };

  return (
    <SafeAreaView style={[styles.safe, style]} edges={safeEdges}>
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.static, padHorizontal && styles.padH, contentStyle]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  static: {
    flex: 1,
  },
  padH: {
    paddingHorizontal: Spacing.base,
  },
});
