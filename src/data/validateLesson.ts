import type { Exercise, Lesson, LocalizedText } from './schema';

/**
 * Light runtime validation for lesson JSON files. JSON imports are typed
 * loosely by TypeScript, so this is the single place where raw content
 * becomes a `Lesson`. Errors name the offending field to make fixing
 * extracted content quick.
 */

type Json = Record<string, unknown>;

class LessonValidationError extends Error {
  constructor(lessonId: string, path: string, message: string) {
    super(`[lesson ${lessonId}] ${path}: ${message}`);
  }
}

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isLocalized = (value: unknown): value is LocalizedText =>
  isObject(value) && typeof value.pt === 'string' && value.pt.length > 0;

function checkExercise(lessonId: string, raw: unknown, index: number): Exercise {
  const path = `exercises[${index}]`;
  const fail = (message: string) => {
    throw new LessonValidationError(lessonId, path, message);
  };

  if (!isObject(raw)) fail('must be an object');
  const ex = raw as Json;
  if (typeof ex.id !== 'string') fail('missing "id"');
  if (!isLocalized(ex.prompt)) fail('"prompt" must be localized text with "pt"');
  if (!isLocalized(ex.explanation)) fail('"explanation" must be localized text with "pt"');

  switch (ex.type) {
    case 'multiple_choice':
    case 'listening': {
      const options = ex.options;
      if (!Array.isArray(options) || options.length < 2) fail('"options" needs at least 2 items');
      const correct = ex.correctIndex;
      if (typeof correct !== 'number' || correct < 0 || correct >= (options as unknown[]).length) {
        fail('"correctIndex" is out of range');
      }
      if (ex.type === 'listening' && typeof ex.audioText !== 'string') fail('missing "audioText"');
      break;
    }
    case 'fill_blank': {
      if (typeof ex.sentence !== 'string') fail('missing "sentence"');
      const gaps = (ex.sentence as string).split('___').length - 1;
      if (!Array.isArray(ex.answers) || ex.answers.length !== gaps) {
        fail(`"answers" must have one entry per "___" (found ${gaps} gaps)`);
      }
      break;
    }
    default:
      fail(`unknown exercise type "${String(ex.type)}"`);
  }

  return ex as unknown as Exercise;
}

export function validateLesson(raw: unknown): Lesson {
  if (!isObject(raw) || typeof raw.id !== 'string') {
    throw new LessonValidationError('?', 'root', 'lesson must be an object with an "id"');
  }
  const id = raw.id;
  if (typeof raw.title !== 'string') throw new LessonValidationError(id, 'title', 'missing');
  if (!Array.isArray(raw.theory)) throw new LessonValidationError(id, 'theory', 'must be an array');
  if (!Array.isArray(raw.exercises)) {
    throw new LessonValidationError(id, 'exercises', 'must be an array');
  }

  raw.theory.forEach((block, i) => {
    if (!isObject(block) || !isLocalized(block.heading) || !isLocalized(block.body)) {
      throw new LessonValidationError(id, `theory[${i}]`, 'needs localized "heading" and "body"');
    }
  });
  raw.exercises.forEach((exercise, i) => checkExercise(id, exercise, i));

  return raw as unknown as Lesson;
}
