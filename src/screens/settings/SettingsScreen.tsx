import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import Screen from '@/components/ui/Screen';
import { APP_LANGUAGES } from '@/data/schema';
import { LANGUAGE_LABELS } from '@/i18n';
import { useProgressStore } from '@/store/progressStore';
import { useReviewStore } from '@/store/reviewStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/theme/levels';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const resetProgress = useProgressStore((state) => state.resetProgress);
  const resetReviews = useReviewStore((state) => state.resetReviews);

  const confirmReset = () =>
    Alert.alert(t('settings.resetConfirmTitle'), t('settings.resetConfirmMessage'), [
      { text: t('settings.cancel'), style: 'cancel' },
      {
        text: t('settings.confirm'),
        style: 'destructive',
        onPress: () => {
          resetProgress();
          resetReviews();
        },
      },
    ]);

  return (
    <Screen>
      <Text className="mb-6 text-2xl font-extrabold text-ink">{t('settings.title')}</Text>

      <Text className="mb-1 text-base font-bold text-ink">{t('settings.interfaceLanguage')}</Text>
      <Text className="mb-3 text-ink-muted">{t('settings.interfaceLanguageHint')}</Text>
      <View className="mb-8 overflow-hidden rounded-2xl bg-surface">
        {APP_LANGUAGES.map((code) => {
          const selected = code === language;
          return (
            <Pressable
              key={code}
              onPress={() => setLanguage(code)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              className="flex-row items-center justify-between border-b border-surface-muted p-4 active:bg-surface-muted"
            >
              <Text className={`text-base ${selected ? 'font-bold text-brand-600' : 'text-ink'}`}>
                {LANGUAGE_LABELS[code]}
              </Text>
              {selected && <Ionicons name="checkmark-circle" size={22} color={colors.brand} />}
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={confirmReset}
        accessibilityRole="button"
        className="items-center rounded-2xl border border-red-300 p-4 active:bg-red-50"
      >
        <Text className="font-bold text-red-600">{t('settings.resetProgress')}</Text>
      </Pressable>
    </Screen>
  );
}
