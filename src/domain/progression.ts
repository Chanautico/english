import type { Course, Lesson, Level, Unit } from '@/data/schema';

export type LessonStatus = 'completed' | 'current' | 'locked';

export interface LessonNodeModel {
  lesson: Lesson;
  status: LessonStatus;
}

export interface UnitModel {
  unit: Unit;
  lessons: LessonNodeModel[];
}

export interface LevelModel {
  level: Level;
  units: UnitModel[];
  locked: boolean;
  completedCount: number;
  totalCount: number;
}

export interface CourseProgress {
  levels: LevelModel[];
  currentLessonId: string | null;
  completedCount: number;
  totalCount: number;
}

/**
 * Builds the course map. Lessons unlock strictly in order: the first lesson
 * not yet completed is "current" and everything after it is locked. Since
 * levels are sequential too, a level stays locked until every lesson of the
 * previous level is completed.
 */
export function buildCourseProgress(
  course: Course,
  isCompleted: (lessonId: string) => boolean,
): CourseProgress {
  let currentLessonId: string | null = null;
  let completedCount = 0;
  let totalCount = 0;

  const levels = course.map((level): LevelModel => {
    let levelCompleted = 0;
    let levelTotal = 0;
    // A level is reachable only if no earlier lesson is still pending.
    const locked = currentLessonId !== null;

    const units = level.units.map((unit): UnitModel => ({
      unit,
      lessons: unit.lessons.map((lesson): LessonNodeModel => {
        levelTotal += 1;
        if (isCompleted(lesson.id)) {
          levelCompleted += 1;
          return { lesson, status: 'completed' };
        }
        if (currentLessonId === null) {
          currentLessonId = lesson.id;
          return { lesson, status: 'current' };
        }
        return { lesson, status: 'locked' };
      }),
    }));

    completedCount += levelCompleted;
    totalCount += levelTotal;
    return { level, units, locked, completedCount: levelCompleted, totalCount: levelTotal };
  });

  return { levels, currentLessonId, completedCount, totalCount };
}
