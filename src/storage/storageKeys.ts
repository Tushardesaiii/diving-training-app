export const STORAGE_KEYS = {
  ONBOARDING_DONE: 'onboarding_done',
  PERSONAL_BEST: 'personal_best',
  TARGET_GOAL: 'target_goal',
  PREFERRED_MODE: 'preferred_mode',
  GENERATED_PLAN: 'generated_plan',
  SESSION_HISTORY: 'session_history',
  LAST_SESSION_DATE: 'last_session_date',
  STREAK_COUNT: 'streak_count',
  HAS_PRO: 'has_pro',
  WATCH_PROMO_SEEN: 'watch_promo_seen',
  SETTINGS: 'settings',
  USER_PROFILE: 'user_profile',
  PB_HISTORY: 'pb_history',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
