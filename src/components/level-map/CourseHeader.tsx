import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import PrimaryButton from '@/components/ui/PrimaryButton';
import ProgressBar from '@/components/ui/ProgressBar';
import StatChip from '@/components/ui/StatChip';

interface CourseHeaderProps {
  completed: number;
  total: number;
  xp: number;
  streak: number;
  currentLessonTitle: string | null;
  onContinue: () => void;
}

export default function CourseHeader({
  completed,
  total,
  xp,
  streak,
  currentLessonTitle,
  onContinue,
}: CourseHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="mb-6 gap-4">
      <Text className="text-2xl font-extrabold text-ink">{t('home.greeting')}</Text>

      <View className="flex-row gap-2">
        <StatChip icon="flame" iconColor="#F97316" label={t('home.streak', { count: streak })} />
        <StatChip icon="star" iconColor="#EAB308" label={t('home.xp', { count: xp })} />
      </View>

      <View className="gap-2 rounded-2xl bg-surface p-4">
        <View className="flex-row justify-between">
          <Text className="font-semibold text-ink">{t('home.overallProgress')}</Text>
          <Text className="text-ink-muted">{t('home.lessonsProgress', { completed, total })}</Text>
        </View>
        <ProgressBar value={total ? completed / total : 0} />
      </View>

      {currentLessonTitle ? (
        <PrimaryButton
          icon="play"
          label={t('home.continueLesson', { title: currentLessonTitle })}
          onPress={onContinue}
        />
      ) : (
        <Text className="text-center font-semibold text-basic-dark">
          {t('home.courseCompleted')}
        </Text>
      )}
    </View>
  );
}
