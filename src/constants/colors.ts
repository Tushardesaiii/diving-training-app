export const Colors = {
  // Core backgrounds — deep ocean palette
  background: '#000C1C', // Deep navy background used across the app
  surface: '#0B121D', // Dark navy surface
  surfaceElevated: '#121B29',
  surfaceMuted: '#1A2332',
  surfaceHighlight: '#222E3F',

  // Borders
  border: '#1A2332',
  borderMuted: '#121B29',
  borderFaint: '#0B121D',

  // Brand accents
  primary: '#00D1FF', // The vibrant cyan from the ring
  primaryMuted: 'rgba(0, 209, 255, 0.12)',
  primaryGlow: 'rgba(0, 209, 255, 0.22)',
  primaryStrong: 'rgba(0, 209, 255, 0.35)',

  secondary: '#00E5C8', // Secondary teal/cyan
  secondaryMuted: 'rgba(0, 229, 200, 0.12)',

  accent: '#00D1FF',
  accentMuted: 'rgba(0, 209, 255, 0.12)',

  // Text
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  textInverse: '#01060D',

  // Semantic
  success: '#10C76F',
  successMuted: 'rgba(16, 199, 111, 0.12)',
  warning: '#FFB800', 
  warningMuted: 'rgba(255, 184, 0, 0.12)',
  danger: '#FF4D6A',
  dangerMuted: 'rgba(255, 77, 106, 0.12)',

  // Pro / monetization
  pro: '#FFB800',
  proMuted: 'rgba(255, 184, 0, 0.12)',
  proGlow: 'rgba(255, 184, 0, 0.22)',
  proGradient: ['#FFB800', '#FF8A00'],

  // Training phase colors
  phaseHold: '#00D1FF',
  phaseHoldMuted: 'rgba(0, 209, 255, 0.15)',
  phaseRest: '#00E5C8',
  phaseRestMuted: 'rgba(0, 229, 200, 0.15)',
  phaseBreathe: '#7C5CF8',
  phaseBreatheMuted: 'rgba(124, 92, 248, 0.15)',
  phaseComplete: '#FFB800',

  // Overlay / glass
  overlay: 'rgba(1, 6, 13, 0.95)',
  glass: 'rgba(11, 18, 29, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',

  // Tab bar
  tabActive: '#00D1FF',
  tabInactive: '#64748B',
} as const;

export type AppColor = typeof Colors[keyof typeof Colors];
