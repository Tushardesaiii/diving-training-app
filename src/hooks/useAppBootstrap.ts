import { useState, useEffect } from 'react';
import { UserProfile, PersonalizedPlan, AppSettings } from '../types/app';
import {
  isOnboardingDone,
  getUserProfile,
  getPlan,
  getSettings,
} from '../storage/appStorage';
import { setHapticsEnabled } from '../utils/haptics';

export interface AppBootstrapState {
  isReady: boolean;
  onboardingDone: boolean;
  profile: UserProfile | null;
  plan: PersonalizedPlan | null;
  settings: AppSettings;
}

const DEFAULT_SETTINGS: AppSettings = {
  hapticsEnabled: true,
  soundEnabled: false,
  defaultMode: 'CO2',
  watchPromoSeen: false,
  hasPro: false,
};

export function useAppBootstrap(): AppBootstrapState {
  const [state, setState] = useState<AppBootstrapState>({
    isReady: false,
    onboardingDone: false,
    profile: null,
    plan: null,
    settings: DEFAULT_SETTINGS,
  });

  useEffect(() => {
    async function bootstrap() {
      try {
        const [done, profile, plan, settings] = await Promise.all([
          isOnboardingDone(),
          getUserProfile(),
          getPlan(),
          getSettings(),
        ]);

        setHapticsEnabled(settings.hapticsEnabled);

        setState({
          isReady: true,
          onboardingDone: done,
          profile,
          plan,
          settings,
        });
      } catch {
        setState((prev) => ({ ...prev, isReady: true }));
      }
    }

    bootstrap();
  }, []);

  return state;
}
