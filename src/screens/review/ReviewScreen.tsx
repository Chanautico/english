import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import Screen from '@/components/ui/Screen';
import { isDue } from '@/domain/srs';
import { useReviewStore } from '@/store/reviewStore';
import { colors } from '@/theme/levels';

export default function ReviewScreen() {
  const { t } = useTranslation();
  const cards = useReviewStore((state) => state.cards);
  const dueCount = useMemo(() => Object.values(cards).filter((card) => isDue(card)).length, [cards]);

  return (
    <Screen scroll={false}>
      <Text className="mb-6 text-2xl font-extrabold text-ink">{t('review.title')}</Text>
      <View className="items-center gap-3 rounded-3xl bg-surface p-8">
        <Ionicons name="repeat" size={48} color={colors.brand} />
        <Text className="text-center text-base text-ink">
          {dueCount > 0 ? t('review.due', { count: dueCount }) : t('review.empty')}
        </Text>
      </View>
    </Screen>
  );
}
