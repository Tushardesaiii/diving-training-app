import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  PersonalizedPlan,
  TrainingSession,
  PBRecord,
  AppSettings,
} from '../types/app';
import { STORAGE_KEYS } from './storageKeys';

const DEFAULT_SETTINGS: AppSettings = {
  hapticsEnabled: true,
  soundEnabled: false,
  defaultMode: 'CO2',
  watchPromoSeen: false,
  hasPro: false,
};

// ─── Generic helpers ──────────────────────────────────────────────────────────

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail — storage is best-effort on mobile
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function isOnboardingDone(): Promise<boolean> {
  const val = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE);
  return val === 'true';
}

export async function markOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, 'true');
}

// ─── User profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(): Promise<UserProfile | null> {
  return getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setItem(STORAGE_KEYS.USER_PROFILE, profile);
}

// ─── Plan ─────────────────────────────────────────────────────────────────────

export async function getPlan(): Promise<PersonalizedPlan | null> {
  return getItem<PersonalizedPlan>(STORAGE_KEYS.GENERATED_PLAN);
}

export async function savePlan(plan: PersonalizedPlan): Promise<void> {
  await setItem(STORAGE_KEYS.GENERATED_PLAN, plan);
}

export async function clearPlan(): Promise<void> {
  await removeItem(STORAGE_KEYS.GENERATED_PLAN);
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function getSessions(): Promise<TrainingSession[]> {
  return (await getItem<TrainingSession[]>(STORAGE_KEYS.SESSION_HISTORY)) ?? [];
}

export async function saveSession(session: TrainingSession): Promise<void> {
  const sessions = await getSessions();
  const existing = sessions.findIndex((s) => s.id === session.id);
  if (existing >= 0) {
    sessions[existing] = session;
  } else {
    sessions.unshift(session);
  }
  // Keep last 500 sessions
  const trimmed = sessions.slice(0, 500);
  await setItem(STORAGE_KEYS.SESSION_HISTORY, trimmed);
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_SESSION_DATE, new Date().toISOString().split('T')[0]);
}

export async function getSessionsThisWeek(): Promise<TrainingSession[]> {
  const sessions = await getSessions();
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  return sessions.filter((s) => s.completedAt !== undefined && s.completedAt >= weekAgo && s.status === 'complete');
}

// ─── PB history ───────────────────────────────────────────────────────────────

export async function getPBHistory(): Promise<PBRecord[]> {
  return (await getItem<PBRecord[]>(STORAGE_KEYS.PB_HISTORY)) ?? [];
}

export async function addPBRecord(record: PBRecord): Promise<void> {
  const history = await getPBHistory();
  history.unshift(record);
  await setItem(STORAGE_KEYS.PB_HISTORY, history.slice(0, 100));
}

export async function getCurrentPB(): Promise<number | null> {
  const profile = await getUserProfile();
  return profile?.staticPB ?? null;
}

// ─── Streak ───────────────────────────────────────────────────────────────────

export async function getStreak(): Promise<number> {
  const val = await AsyncStorage.getItem(STORAGE_KEYS.STREAK_COUNT);
  return val ? parseInt(val, 10) : 0;
}

export async function updateStreak(): Promise<number> {
  const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SESSION_DATE);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const current = await getStreak();

  if (lastDate === today) {
    return current;
  }
  const next = lastDate === yesterday ? current + 1 : 1;
  await AsyncStorage.setItem(STORAGE_KEYS.STREAK_COUNT, String(next));
  return next;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  const stored = await getItem<AppSettings>(STORAGE_KEYS.SETTINGS);
  return stored ? { ...DEFAULT_SETTINGS, ...stored } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await setItem(STORAGE_KEYS.SETTINGS, settings);
}

export async function getHasPro(): Promise<boolean> {
  const settings = await getSettings();
  return settings.hasPro;
}

export async function setHasPro(value: boolean): Promise<void> {
  const settings = await getSettings();
  await saveSettings({ ...settings, hasPro: value });
}

// ─── Watch promo ──────────────────────────────────────────────────────────────

export async function markWatchPromoSeen(): Promise<void> {
  const settings = await getSettings();
  await saveSettings({ ...settings, watchPromoSeen: true });
}

// ─── Full clear (for testing / account reset) ─────────────────────────────────

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
}
