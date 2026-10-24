import { useSettingsStore } from '@/store/settingsStore';

export const useAppLanguage = () => useSettingsStore((state) => state.language);
