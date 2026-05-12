import { useState, useCallback } from 'react';
import { PersonalizedPlan, UserProfile } from '../types/app';
import { generatePersonalizedPlan, adaptPlanAfterSession } from '../utils/apnea';
import { savePlan, getPlan, saveUserProfile, getUserProfile, addPBRecord } from '../storage/appStorage';

export interface PlanState {
  plan: PersonalizedPlan | null;
  profile: UserProfile | null;
  isGenerating: boolean;
}

export function usePersonalizedPlan(initialPlan: PersonalizedPlan | null, initialProfile: UserProfile | null) {
  const [state, setState] = useState<PlanState>({
    plan: initialPlan,
    profile: initialProfile,
    isGenerating: false,
  });

  const generate = useCallback(async (profile: UserProfile) => {
    setState((prev) => ({ ...prev, isGenerating: true }));
    try {
      const plan = generatePersonalizedPlan(profile.staticPB, profile.targetImprovement);

      // Unlock weeks progressively — only week 1 unlocked initially
      const updatedWeeks = plan.weeks.map((w) => ({
        ...w,
        isUnlocked: w.week === 1,
        isCurrentWeek: w.week === 1,
      }));
      const finalPlan = { ...plan, weeks: updatedWeeks };

      await Promise.all([
        savePlan(finalPlan),
        saveUserProfile(profile),
        addPBRecord({ value: profile.staticPB, recordedAt: Date.now() }),
      ]);

      setState({ plan: finalPlan, profile, isGenerating: false });
    } catch {
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  }, []);

  const adapt = useCallback(async (effortScore: number, completedWeek: number) => {
    if (!state.plan) return;
    const adapted = adaptPlanAfterSession(state.plan, effortScore, completedWeek);
    await savePlan(adapted);
    setState((prev) => ({ ...prev, plan: adapted }));
  }, [state.plan]);

  const advanceDay = useCallback(async () => {
    if (!state.plan) return;

    const { plan } = state;
    const currentWeekIndex = plan.weeks.findIndex((w) => w.isCurrentWeek);
    if (currentWeekIndex < 0) return;

    const currentWeek = plan.weeks[currentWeekIndex];
    const nextIncompleteDay = currentWeek.sessions.findIndex((s) => !s.isComplete);

    let updatedPlan = { ...plan };

    if (nextIncompleteDay >= 0) {
      // Mark current session complete
      const updatedSessions = [...currentWeek.sessions];
      updatedSessions[nextIncompleteDay] = { ...updatedSessions[nextIncompleteDay], isComplete: true };
      updatedPlan.weeks = plan.weeks.map((w) =>
        w.week === currentWeek.week ? { ...w, sessions: updatedSessions } : w
      );

      // Check if week is now complete
      const allDone = updatedSessions.every((s) => s.isComplete);
      if (allDone && currentWeekIndex < plan.weeks.length - 1) {
        // Unlock next week
        updatedPlan.weeks = updatedPlan.weeks.map((w) => {
          if (w.week === currentWeek.week) return { ...w, isCurrentWeek: false };
          if (w.week === currentWeek.week + 1) return { ...w, isUnlocked: true, isCurrentWeek: true };
          return w;
        });
        updatedPlan.currentWeek = currentWeek.week + 1;
        updatedPlan.currentDayIndex = 0;
      } else {
        updatedPlan.currentDayIndex = nextIncompleteDay + 1;
      }
    }

    await savePlan(updatedPlan);
    setState((prev) => ({ ...prev, plan: updatedPlan }));
  }, [state.plan]);

  const refresh = useCallback(async () => {
    const [plan, profile] = await Promise.all([getPlan(), getUserProfile()]);
    setState({ plan, profile, isGenerating: false });
  }, []);

  return { ...state, generate, adapt, advanceDay, refresh };
}
