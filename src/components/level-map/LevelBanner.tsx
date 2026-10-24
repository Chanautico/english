import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import ProgressBar from '@/components/ui/ProgressBar';
import type { LevelModel } from '@/domain/progression';
import { colors, levelTheme } from '@/theme/levels';

export default function LevelBanner({ model }: { model: LevelModel }) {
  const { t } = useTranslation();
  const { level, locked, completedCount, totalCount } = model;
  const theme = levelTheme[level.id];

  return (
    <View className={`gap-3 rounded-3xl p-5 ${locked ? 'bg-ink-muted' : theme.banner}`}>
      <View className="flex-row items-center gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/25">
          <Ionicons name={locked ? 'lock-closed' : theme.icon} size={26} color={colors.white} />
        </View>
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase text-white/80">{level.cefr}</Text>
          <Text className="text-xl font-extrabold text-white">{t(`levels.${level.id}.title`)}</Text>
        </View>
        <Text className="font-bold text-white">
          {completedCount}/{totalCount}
        </Text>
      </View>
      <Text className="text-white/90">
        {locked ? t('home.levelLocked') : t(`levels.${level.id}.description`)}
      </Text>
      <ProgressBar
        value={totalCount ? completedCount / totalCount : 0}
        barClassName="bg-white"
        trackClassName="bg-white/30"
      />
    </View>
  );
}
