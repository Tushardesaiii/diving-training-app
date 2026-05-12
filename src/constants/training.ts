import { TrainingMode, TrainingTable, SpearfishingPreset } from '../types/app';

export const TRAINING_ROUNDS = 8;

export const BREATHE_UP_DURATION = 120; // 2 minutes standard breathe-up

export const TRAINING_MODES: { mode: TrainingMode; label: string; description: string; color: string }[] = [
  {
    mode: 'CO2',
    label: 'CO₂ Table',
    description: 'Build CO₂ tolerance. Hold constant, rest decreases.',
    color: '#00C8FF',
  },
  {
    mode: 'O2',
    label: 'O₂ Table',
    description: 'Improve O₂ efficiency. Hold increases, rest constant.',
    color: '#00E5C8',
  },
  {
    mode: 'MAX',
    label: 'Max Hold',
    description: 'Single max breath-hold attempt with breathe-up.',
    color: '#7C5CF8',
  },
];

export const SPEARFISHING_PRESETS: SpearfishingPreset[] = [
  {
    id: 'spearo_standard',
    label: 'Standard Dive Day',
    description: 'Repetitive short dives with 2:1 surface interval ratio.',
    targetDepth: '5–15m',
    holdDuration: 45,
    surfaceInterval: 90,
    rounds: 10,
    mode: 'SPEARO',
  },
  {
    id: 'spearo_deep',
    label: 'Deeper Dive Session',
    description: 'Longer holds with extended recovery for depths 15m+.',
    targetDepth: '15–25m',
    holdDuration: 75,
    surfaceInterval: 150,
    rounds: 6,
    mode: 'SPEARO',
  },
  {
    id: 'spearo_shore',
    label: 'Shore Day Mode',
    description: 'Shallow, high-rep session with safety intervals.',
    targetDepth: '2–8m',
    holdDuration: 30,
    surfaceInterval: 60,
    rounds: 15,
    mode: 'SPEARO',
  },
];

export const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'Under 1 minute PB' },
  { value: 'intermediate', label: 'Intermediate', description: '1–3 min PB' },
  { value: 'advanced', label: 'Advanced', description: '3–5 min PB' },
  { value: 'elite', label: 'Elite', description: '5+ min PB' },
] as const;

export type ExperienceLevel = typeof EXPERIENCE_LEVELS[number]['value'];

export const DEFAULT_STATIC_TABLES: Record<string, TrainingTable> = {
  co2_beginner: {
    id: 'co2_beginner',
    mode: 'CO2',
    label: 'CO₂ Beginner',
    rounds: [
      { round: 1, holdDuration: 60, restDuration: 120 },
      { round: 2, holdDuration: 60, restDuration: 105 },
      { round: 3, holdDuration: 60, restDuration: 90 },
      { round: 4, holdDuration: 60, restDuration: 75 },
      { round: 5, holdDuration: 60, restDuration: 60 },
      { round: 6, holdDuration: 60, restDuration: 45 },
      { round: 7, holdDuration: 60, restDuration: 30 },
      { round: 8, holdDuration: 60, restDuration: 0 },
    ],
    totalDuration: 8 * 60 + (120 + 105 + 90 + 75 + 60 + 45 + 30),
  },
  o2_beginner: {
    id: 'o2_beginner',
    mode: 'O2',
    label: 'O₂ Beginner',
    rounds: [
      { round: 1, holdDuration: 45, restDuration: 120 },
      { round: 2, holdDuration: 60, restDuration: 120 },
      { round: 3, holdDuration: 75, restDuration: 120 },
      { round: 4, holdDuration: 90, restDuration: 120 },
      { round: 5, holdDuration: 105, restDuration: 120 },
      { round: 6, holdDuration: 120, restDuration: 120 },
      { round: 7, holdDuration: 135, restDuration: 120 },
      { round: 8, holdDuration: 150, restDuration: 0 },
    ],
    totalDuration: (45 + 60 + 75 + 90 + 105 + 120 + 135 + 150) + 7 * 120,
  },
};

export const PHASE_LABELS: Record<string, string> = {
  breathe: 'BREATHE',
  hold: 'HOLD',
  rest: 'REST',
  complete: 'DONE',
};

export const PHASE_COLORS: Record<string, string> = {
  breathe: '#7C5CF8',
  hold: '#00C8FF',
  rest: '#10C76F',
  complete: '#FFD700',
};
