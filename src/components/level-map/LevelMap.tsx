import { View } from 'react-native';

import LevelSection from './LevelSection';
import type { LevelModel } from '@/domain/progression';

interface LevelMapProps {
  levels: LevelModel[];
  onOpenLesson: (lessonId: string) => void;
}

export default function LevelMap({ levels, onOpenLesson }: LevelMapProps) {
  return (
    <View>
      {levels.map((model) => (
        <LevelSection key={model.level.id} model={model} onOpenLesson={onOpenLesson} />
      ))}
    </View>
  );
}
