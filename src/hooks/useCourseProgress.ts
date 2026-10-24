import { useMemo } from 'react';

import { course } from '@/data/curriculum';
import { buildCourseProgress } from '@/domain/progression';
import { useProgressStore } from '@/store/progressStore';

export function useCourseProgress() {
  const completedLessons = useProgressStore((state) => state.completedLessons);

  return useMemo(
    () => buildCourseProgress(course, (id) => id in completedLessons),
    [completedLessons],
  );
}
