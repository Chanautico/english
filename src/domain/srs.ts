/**
 * Simplified SM-2 spaced repetition.
 *
 * Every exercise answered becomes a review card. Correct answers push the
 * next review further away (1 day, 3 days, then interval × ease); a miss
 * resets the card so it comes back tomorrow and lowers its ease.
 */

export interface ReviewCard {
  /** `${lessonId}:${exerciseId}` */
  id: string;
  lessonId: string;
  exerciseId: string;
  ease: number;
  intervalDays: number;
  repetitions: number;
  /** ISO date of the next review. */
  dueAt: string;
  lapses: number;
}

const MIN_EASE = 1.3;
const DEFAULT_EASE = 2.5;
const DAY_MS = 24 * 60 * 60 * 1000;

export const cardId = (lessonId: string, exerciseId: string) => `${lessonId}:${exerciseId}`;

export function createCard(lessonId: string, exerciseId: string, now = new Date()): ReviewCard {
  return {
    id: cardId(lessonId, exerciseId),
    lessonId,
    exerciseId,
    ease: DEFAULT_EASE,
    intervalDays: 0,
    repetitions: 0,
    dueAt: now.toISOString(),
    lapses: 0,
  };
}

export function scheduleCard(card: ReviewCard, correct: boolean, now = new Date()): ReviewCard {
  if (!correct) {
    return {
      ...card,
      repetitions: 0,
      intervalDays: 1,
      lapses: card.lapses + 1,
      ease: Math.max(MIN_EASE, card.ease - 0.2),
      dueAt: new Date(now.getTime() + DAY_MS).toISOString(),
    };
  }

  const repetitions = card.repetitions + 1;
  const intervalDays =
    repetitions === 1 ? 1 : repetitions === 2 ? 3 : Math.round(card.intervalDays * card.ease);

  return {
    ...card,
    repetitions,
    intervalDays,
    ease: card.ease + 0.1,
    dueAt: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
  };
}

export function isDue(card: ReviewCard, now = new Date()): boolean {
  return new Date(card.dueAt).getTime() <= now.getTime();
}
