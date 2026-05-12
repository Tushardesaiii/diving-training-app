import * as ExpoHaptics from 'expo-haptics';

// Centralized haptic calls — all gated so disabling in settings is a single change

let hapticsEnabled = true;

export function setHapticsEnabled(enabled: boolean): void {
  hapticsEnabled = enabled;
}

export async function hapticLight(): Promise<void> {
  if (!hapticsEnabled) return;
  try {
    await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
  } catch {}
}

export async function hapticMedium(): Promise<void> {
  if (!hapticsEnabled) return;
  try {
    await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium);
  } catch {}
}

export async function hapticHeavy(): Promise<void> {
  if (!hapticsEnabled) return;
  try {
    await ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Heavy);
  } catch {}
}

export async function hapticSuccess(): Promise<void> {
  if (!hapticsEnabled) return;
  try {
    await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success);
  } catch {}
}

export async function hapticWarning(): Promise<void> {
  if (!hapticsEnabled) return;
  try {
    await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Warning);
  } catch {}
}

export async function hapticError(): Promise<void> {
  if (!hapticsEnabled) return;
  try {
    await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error);
  } catch {}
}

export async function hapticSelection(): Promise<void> {
  if (!hapticsEnabled) return;
  try {
    await ExpoHaptics.selectionAsync();
  } catch {}
}

// Phase transition haptics — distinct patterns for each phase
export async function hapticPhaseHold(): Promise<void> {
  await hapticHeavy();
}

export async function hapticPhaseRest(): Promise<void> {
  await hapticMedium();
}

export async function hapticPhaseBreathe(): Promise<void> {
  await hapticLight();
}

export async function hapticSessionComplete(): Promise<void> {
  if (!hapticsEnabled) return;
  try {
    await ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success);
  } catch {}
}
