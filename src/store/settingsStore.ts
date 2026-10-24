import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from './storage';
import type { AppLanguage } from '@/data/schema';
import i18n, { detectDeviceLanguage } from '@/i18n';

interface SettingsState {
  language: AppLanguage;
  speechRate: number;
  setLanguage: (language: AppLanguage) => void;
  setSpeechRate: (rate: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: detectDeviceLanguage(),
      speechRate: 0.9,

      setLanguage: (language) => {
        void i18n.changeLanguage(language);
        set({ language });
      },
      setSpeechRate: (speechRate) => set({ speechRate }),
    }),
    {
      name: 'settings',
      storage: persistStorage,
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) void i18n.changeLanguage(state.language);
      },
    },
  ),
);
