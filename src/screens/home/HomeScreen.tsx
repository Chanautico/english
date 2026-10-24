import { useCallback } from 'react';

import { CourseHeader, LevelMap } from '@/components/level-map';
import Screen from '@/components/ui/Screen';
import { getLessonById } from '@/data/curriculum';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import type { MainTabScreenProps } from '@/navigation/types';
import { useProgressStore } from '@/store/progressStore';

export default function HomeScreen({ navigation }: MainTabScreenProps<'Home'>) {
  const progress = useCourseProgress();
  const xp = useProgressStore((state) => state.xp);
  const streak = useProgressStore((state) => state.streak);

  const openLesson = useCallback(
    (lessonId: string) => navigation.navigate('Lesson', { lessonId }),
    [navigation],
  );

  const currentLesson = progress.currentLessonId ? getLessonById(progress.currentLessonId) : null;

  return (
    <Screen>
      <CourseHeader
        completed={progress.completedCount}
        total={progress.totalCount}
        xp={xp}
        streak={streak}
        currentLessonTitle={currentLesson?.title ?? null}
        onContinue={() => currentLesson && openLesson(currentLesson.id)}
      />
      <LevelMap levels={progress.levels} onOpenLesson={openLesson} />
    </Screen>
  );
}
