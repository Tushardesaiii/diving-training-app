// ─── Training types ───────────────────────────────────────────────────────────

export type TrainingMode = 'CO2' | 'O2' | 'MAX' | 'SPEARO';

export type TrainingPhase = 'breathe' | 'hold' | 'rest' | 'complete';

export interface TableRound {
  round: number;
  holdDuration: number;  // seconds
  restDuration: number;  // seconds (0 = no rest, last round)
}

export interface TrainingTable {
  id: string;
  mode: TrainingMode;
  label: string;
  rounds: TableRound[];
  totalDuration: number;  // seconds, estimated
  isPersonalized?: boolean;
  basedOnPB?: number;     // PB in seconds used to generate
}

export interface SpearfishingPreset {
  id: string;
  label: string;
  description: string;
  targetDepth: string;
  holdDuration: number;
  surfaceInterval: number;
  rounds: number;
  mode: 'SPEARO';
}

// ─── Session types ────────────────────────────────────────────────────────────

export type SessionStatus = 'active' | 'paused' | 'complete' | 'abandoned';

export interface CompletedRound {
  round: number;
  holdDuration: number;
  actualHoldDuration: number;  // may differ if paused early
  restDuration: number;
  completedAt: number;          // timestamp ms
}

export interface TrainingSession {
  id: string;
  tableId: string;
  mode: TrainingMode;
  tableLabel: string;
  startedAt: number;            // timestamp ms
  completedAt?: number;         // timestamp ms
  duration: number;             // seconds
  status: SessionStatus;
  rounds: CompletedRound[];
  totalHoldTime: number;        // seconds
  effortScore?: number;         // 1–5
  isPersonalBest?: boolean;
  newPB?: number;               // seconds if PB broken
}

// ─── User profile / plan types ────────────────────────────────────────────────

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'elite';

export interface UserProfile {
  staticPB: number;             // seconds
  targetImprovement: number;    // fraction e.g. 0.20
  experienceLevel: ExperienceLevel;
  preferredMode: TrainingMode;
  createdAt: number;
  updatedAt: number;
}

export interface WeeklySession {
  day: number;                  // 1, 3, or 5 (Mon/Wed/Fri within week)
  type: TrainingMode;
  table: TrainingTable;
  description: string;
  isComplete?: boolean;
  effortScore?: number;
}

export interface WeeklyPlan {
  week: number;                 // 1–8
  sessions: WeeklySession[];
  projectedPB: number;          // seconds
  isUnlocked: boolean;
  isCurrentWeek: boolean;
}

export interface PersonalizedPlan {
  id: string;
  basePB: number;
  targetPB: number;
  targetImprovement: number;
  weeks: WeeklyPlan[];
  generatedAt: number;
  currentWeek: number;
  currentDayIndex: number;
  lastAdaptedAt?: number;
}

// ─── History / progress types ─────────────────────────────────────────────────

export interface PBRecord {
  value: number;                // seconds
  recordedAt: number;           // timestamp ms
  sessionId?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string;      // YYYY-MM-DD
}

export interface ProgressStats {
  totalSessions: number;
  totalHoldTime: number;        // seconds
  currentPB: number;            // seconds
  startingPB: number;           // seconds
  pbGrowthPercent: number;
  streak: StreakData;
  sessionsThisWeek: number;
  avgEffortScore: number;
}

// ─── Settings types ───────────────────────────────────────────────────────────

export interface AppSettings {
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  defaultMode: TrainingMode;
  watchPromoSeen: boolean;
  hasPro: boolean;
}

// ─── Navigation types ─────────────────────────────────────────────────────────

export type RootStackParamList = {
  Onboarding: undefined;
  PersonalBestSetup: undefined;
  MainTabs: undefined;
  Session: {
    table: TrainingTable;
    isPersonalized?: boolean;
    weekIndex?: number;
    dayIndex?: number;
  };
  SpearfishingModule: undefined;
  ProUpgrade: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Training: undefined;
  Plan: undefined;
  History: undefined;
  Settings: undefined;
};

// ─── Storage types ────────────────────────────────────────────────────────────

export interface StoredAppData {
  profile?: UserProfile;
  plan?: PersonalizedPlan;
  sessions: TrainingSession[];
  pbHistory: PBRecord[];
  settings: AppSettings;
  onboardingDone: boolean;
}
