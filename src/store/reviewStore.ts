import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage } from './storage';
import { cardId, createCard, scheduleCard, type ReviewCard } from '@/domain/srs';

interface ReviewState {
  cards: Record<string, ReviewCard>;
  /** Records an answer from a lesson or a review session and reschedules the card. */
  recordAnswer: (lessonId: string, exerciseId: string, correct: boolean) => void;
  resetReviews: () => void;
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set) => ({
      cards: {},

      recordAnswer: (lessonId, exerciseId, correct) =>
        set((state) => {
          const id = cardId(lessonId, exerciseId);
          const card = state.cards[id] ?? createCard(lessonId, exerciseId);
          return { cards: { ...state.cards, [id]: scheduleCard(card, correct) } };
        }),

      resetReviews: () => set({ cards: {} }),
    }),
    { name: 'reviews', storage: persistStorage, version: 1 },
  ),
);
