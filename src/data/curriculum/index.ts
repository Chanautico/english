import type { Course, Lesson } from '../schema';
import { validateLesson } from '../validateLesson';

import b101 from './basic/b1-01-greetings.json';
import b102 from './basic/b1-02-verb-to-be.json';
import b103 from './basic/b1-03-numbers.json';
import i101 from './intermediate/i1-01-present-perfect.json';
import a101 from './advanced/a1-01-mixed-conditionals.json';

/**
 * Course registry. Order here is the unlock order: each lesson unlocks after
 * the previous one, and each level after the previous level is finished.
 * To add a lesson extracted from the workbook, drop the JSON in the level
 * folder, import it and append it to the right unit.
 */
export const course: Course = [
  {
    id: 'basic',
    cefr: 'A1–A2',
    units: [
      {
        id: 'basic-unit-1',
        title: { pt: 'Primeiros passos', en: 'First steps', es: 'Primeros pasos' },
        lessons: [b101, b102, b103].map(validateLesson),
      },
    ],
  },
  {
    id: 'intermediate',
    cefr: 'B1–B2',
    units: [
      {
        id: 'intermediate-unit-1',
        title: { pt: 'Tempos verbais', en: 'Verb tenses', es: 'Tiempos verbales' },
        lessons: [i101].map(validateLesson),
      },
    ],
  },
  {
    id: 'advanced',
    cefr: 'C1–C2',
    units: [
      {
        id: 'advanced-unit-1',
        title: { pt: 'Estruturas complexas', en: 'Complex structures', es: 'Estructuras complejas' },
        lessons: [a101].map(validateLesson),
      },
    ],
  },
];

const lessonsById = new Map<string, Lesson>(
  course.flatMap((level) => level.units.flatMap((unit) => unit.lessons)).map((l) => [l.id, l]),
);

export function getLessonById(id: string): Lesson | undefined {
  return lessonsById.get(id);
}
