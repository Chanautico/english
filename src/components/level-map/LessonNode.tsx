import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { LevelId } from '@/data/schema';
import type { LessonNodeModel } from '@/domain/progression';
import { colors, levelTheme } from '@/theme/levels';

interface LessonNodeProps {
  node: LessonNodeModel;
  levelId: LevelId;
  /** Horizontal shift that draws the zig-zag path. */
  offsetX: number;
  onPress: (lessonId: string) => void;
}

export default function LessonNode({ node, levelId, offsetX, onPress }: LessonNodeProps) {
  const { t } = useTranslation();
  const theme = levelTheme[levelId];
  const { lesson, status } = node;
  const locked = status === 'locked';
  const current = status === 'current';

  const circleClass = locked
    ? 'bg-locked border-locked-dark'
    : `${theme.node} ${theme.nodeBorder}`;
  const icon = status === 'completed' ? 'checkmark' : current ? 'star' : 'lock-closed';

  return (
    <View className="items-center" style={{ transform: [{ translateX: offsetX }] }}>
      {current && (
        <View className="mb-2 rounded-xl bg-surface px-3 py-1 shadow-sm">
          <Text className={`text-xs font-bold uppercase ${theme.text}`}>{t('common.start')}</Text>
        </View>
      )}
      <Pressable
        disabled={locked}
        onPress={() => onPress(lesson.id)}
        accessibilityRole="button"
        accessibilityState={{ disabled: locked }}
        accessibilityLabel={locked ? `${lesson.title}, ${t('common.locked')}` : lesson.title}
        className={`h-[72px] w-[72px] items-center justify-center rounded-full border-b-[6px] active:opacity-80 ${circleClass} ${current ? 'scale-110' : ''}`}
      >
        <Ionicons name={icon} size={30} color={locked ? colors.locked : colors.white} />
      </Pressable>
      <Text
        className={`mt-2 max-w-[140px] text-center text-sm font-semibold ${locked ? 'text-ink-faint' : 'text-ink'}`}
        numberOfLines={2}
      >
        {lesson.title}
      </Text>
    </View>
  );
}
