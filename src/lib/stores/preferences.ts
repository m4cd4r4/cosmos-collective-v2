import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AgeMode } from '@/types/common';

interface UserPreferencesState {
  ageMode: AgeMode;
  setAgeMode: (mode: AgeMode) => void;

  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  reducedMotion: boolean;
  setReducedMotion: (reduced: boolean) => void;

  hasVisitedBefore: boolean;
  setHasVisitedBefore: (visited: boolean) => void;
}

export const useUserPreferences = create<UserPreferencesState>()(
  persist(
    (set) => ({
      ageMode: 'cadet', // Default mode
      soundEnabled: false,
      reducedMotion: false,
      hasVisitedBefore: false,

      setAgeMode: (mode) => set({ ageMode: mode }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setReducedMotion: (reduced) => set({ reducedMotion: reduced }),
      setHasVisitedBefore: (visited) => set({ hasVisitedBefore: visited }),
    }),
    {
      name: 'thegreatexpanse-preferences',
    }
  )
);
