import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from './storage';
import { daysBetween, todayKey } from '@/utils/date';

export interface LessonResult {
  /** Percentage of correct answers, 0–100. */
  score: number;
  completedAt: string;
}

interface ProgressState {
  completedLessons: Record<string, LessonResult>;
  xp: number;
  streak: number;
  lastStudyDay: string | null;
  completeLesson: (lessonId: string, score: number) => void;
  resetProgress: () => void;
}

const XP_PER_LESSON = 10;

const initialState = {
  completedLessons: {},
  xp: 0,
  streak: 0,
  lastStudyDay: null,
} satisfies Partial<ProgressState>;

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      ...initialState,

      completeLesson: (lessonId, score) =>
        set((state) => {
          const today = todayKey();
          const gap = state.lastStudyDay ? daysBetween(state.lastStudyDay, today) : null;
          const streak = gap === 0 ? state.streak : gap === 1 ? state.streak + 1 : 1;
          const previous = state.completedLessons[lessonId];

          return {
            completedLessons: {
              ...state.completedLessons,
              [lessonId]: {
                score: Math.max(score, previous?.score ?? 0),
                completedAt: new Date().toISOString(),
              },
            },
            xp: state.xp + XP_PER_LESSON,
            streak,
            lastStudyDay: today,
          };
        }),

      resetProgress: () => set(initialState),
    }),
    { name: 'progress', storage: persistStorage, version: 1 },
  ),
);
