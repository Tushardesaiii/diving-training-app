import { TextStyle } from 'react-native';
import { Colors } from './colors';

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
  mono: 'Courier',
} as const;

export const Typography: Record<string, TextStyle> = {
  // Timer display — the hero element
  timerDisplay: {
    fontSize: 80,
    fontWeight: '200',
    letterSpacing: -2,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerLarge: {
    fontSize: 56,
    fontWeight: '200',
    letterSpacing: -1,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerMedium: {
    fontSize: 40,
    fontWeight: '300',
    letterSpacing: -0.5,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },

  // Display
  displayLarge: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: Colors.text,
    lineHeight: 42,
  },
  displayMedium: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: Colors.text,
    lineHeight: 34,
  },

  // Headings
  h1: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.2,
    color: Colors.text,
    lineHeight: 30,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.1,
    color: Colors.text,
    lineHeight: 26,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0,
    color: Colors.text,
    lineHeight: 22,
  },
  h4: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0,
    color: Colors.text,
    lineHeight: 20,
  },

  // Body
  bodyLarge: {
    fontSize: 17,
    fontWeight: '400',
    color: Colors.text,
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: Colors.text,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  // Labels
  labelLarge: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: Colors.textSecondary,
  },

  // Numeric / metric display
  metricLarge: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  metric: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },
  metricSmall: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: Colors.text,
    fontVariant: ['tabular-nums'],
  },

  // Phase label — large phase indicator
  phaseLabel: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: Colors.text,
  },

  // Caption
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textTertiary,
    lineHeight: 16,
  },
  captionStrong: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },

  // Button text
  buttonLarge: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  button: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  buttonSmall: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
};
