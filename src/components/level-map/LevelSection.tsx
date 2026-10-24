import { Text, View } from 'react-native';

import LessonNode from './LessonNode';
import LevelBanner from './LevelBanner';
import type { LevelModel } from '@/domain/progression';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { localize } from '@/utils/localize';

/** Repeating horizontal offsets that give the path its zig-zag. */
const PATH_OFFSETS = [0, 45, 70, 45, 0, -45, -70, -45];

interface LevelSectionProps {
  model: LevelModel;
  onOpenLesson: (lessonId: string) => void;
}

export default function LevelSection({ model, onOpenLesson }: LevelSectionProps) {
  const language = useAppLanguage();
  let nodeIndex = 0;

  return (
    <View className="mb-10">
      <LevelBanner model={model} />

      {model.units.map(({ unit, lessons }) => (
        <View key={unit.id} className="mt-6 items-center gap-6">
          <Text className="text-sm font-bold uppercase tracking-wider text-ink-muted">
            {localize(unit.title, language)}
          </Text>
          {lessons.map((node) => (
            <LessonNode
              key={node.lesson.id}
              node={node}
              levelId={model.level.id}
              offsetX={PATH_OFFSETS[nodeIndex++ % PATH_OFFSETS.length]}
              onPress={onOpenLesson}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
