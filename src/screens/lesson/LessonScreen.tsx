import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import PrimaryButton from '@/components/ui/PrimaryButton';
import Screen from '@/components/ui/Screen';
import { getLessonById } from '@/data/curriculum';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import type { RootStackScreenProps } from '@/navigation/types';
import { speakEnglish, stopSpeaking } from '@/services/speech';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { colors } from '@/theme/levels';
import { localize } from '@/utils/localize';

/**
 * Lesson overview: theory with Text-to-Speech examples. The interactive
 * exercise player (multiple choice, fill in the blanks, listening) plugs in
 * here in the next step.
 */
export default function LessonScreen({ route, navigation }: RootStackScreenProps<'Lesson'>) {
  const { t } = useTranslation();
  const language = useAppLanguage();
  const speechRate = useSettingsStore((state) => state.speechRate);
  const completeLesson = useProgressStore((state) => state.completeLesson);
  const lesson = getLessonById(route.params.lessonId);
  // Translating English examples into English adds nothing.
  const showTranslations = language !== 'en';

  useEffect(() => stopSpeaking, []);

  if (!lesson) {
    return (
      <Screen safeTop={false}>
        <Text className="text-ink">{t('lesson.notFound')}</Text>
      </Screen>
    );
  }

  return (
    <Screen safeTop={false}>
      {lesson.subtitle && (
        <Text className="mb-4 text-lg text-ink-muted">{localize(lesson.subtitle, language)}</Text>
      )}

      <Text className="mb-3 text-xl font-extrabold text-ink">{t('lesson.theory')}</Text>
      {lesson.theory.map((block, i) => (
        <View key={i} className="mb-4 gap-2 rounded-2xl bg-surface p-4">
          <Text className="text-base font-bold text-ink">{localize(block.heading, language)}</Text>
          <Text className="leading-6 text-ink">{localize(block.body, language)}</Text>
          {block.examples?.map((example) => (
            <Pressable
              key={example.en}
              onPress={() => speakEnglish(example.en, { rate: speechRate })}
              accessibilityRole="button"
              accessibilityLabel={`${t('lesson.listen')}: ${example.en}`}
              className="flex-row items-center gap-3 rounded-xl bg-brand-50 p-3 active:bg-brand-100"
            >
              <Ionicons name="volume-high" size={22} color={colors.brand} />
              <View className="flex-1">
                <Text className="font-semibold text-brand-700">{example.en}</Text>
                {showTranslations && example.translation && (
                  <Text className="text-ink-muted">{localize(example.translation, language)}</Text>
                )}
              </View>
            </Pressable>
          ))}
        </View>
      ))}

      {lesson.vocabulary && lesson.vocabulary.length > 0 && (
        <>
          <Text className="mb-3 mt-2 text-xl font-extrabold text-ink">{t('lesson.vocabulary')}</Text>
          <View className="mb-4 rounded-2xl bg-surface p-2">
            {lesson.vocabulary.map((item) => (
              <Pressable
                key={item.term}
                onPress={() => speakEnglish(item.term, { rate: speechRate })}
                className="flex-row items-center justify-between rounded-xl p-3 active:bg-surface-muted"
              >
                <Text className="font-semibold text-ink">{item.term}</Text>
                {showTranslations && (
                  <Text className="text-ink-muted">{localize(item.translation, language)}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </>
      )}

      <View className="mb-4 gap-1 rounded-2xl border border-dashed border-locked-dark p-4">
        <Text className="font-bold text-ink">
          {t('lesson.exercises', { count: lesson.exercises.length })}
        </Text>
        <Text className="text-ink-muted">{t('lesson.playerComingSoon')}</Text>
      </View>

      <PrimaryButton
        icon="checkmark-circle"
        label={t('lesson.markComplete')}
        onPress={() => {
          completeLesson(lesson.id, 100);
          navigation.goBack();
        }}
      />
    </Screen>
  );
}
