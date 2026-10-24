/**
 * Content schema for the course.
 *
 * Every lesson extracted from the workbook photos is a JSON file that must
 * match `Lesson`. See docs/content-schema.md for the authoring guide.
 */

export const APP_LANGUAGES = ['pt', 'en', 'es'] as const;
export type AppLanguage = (typeof APP_LANGUAGES)[number];

/** Text shown in the interface language. Portuguese is the reference language. */
export type LocalizedText = { pt: string } & Partial<Record<Exclude<AppLanguage, 'pt'>, string>>;

export type LevelId = 'basic' | 'intermediate' | 'advanced';

export interface LessonSource {
  book: string;
  page?: number;
}

export interface TheoryExample {
  /** English sentence (read aloud with Text-to-Speech). */
  en: string;
  translation?: LocalizedText;
}

export interface TheoryBlock {
  heading: LocalizedText;
  body: LocalizedText;
  examples?: TheoryExample[];
}

export interface VocabularyItem {
  term: string;
  translation: LocalizedText;
  example?: string;
}

interface BaseExercise {
  id: string;
  prompt: LocalizedText;
  /** Shown after the answer, both on hits and misses (immediate feedback). */
  explanation: LocalizedText;
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple_choice';
  /** Optional English sentence the question refers to. */
  question?: string;
  options: string[];
  correctIndex: number;
}

export interface FillBlankExercise extends BaseExercise {
  type: 'fill_blank';
  /** English sentence with `___` marking each gap. */
  sentence: string;
  /** One entry per gap; each entry lists the accepted answers. */
  answers: string[][];
}

export interface ListeningExercise extends BaseExercise {
  type: 'listening';
  /** Text spoken with Text-to-Speech; never shown before answering. */
  audioText: string;
  options: string[];
  correctIndex: number;
}

export type Exercise = MultipleChoiceExercise | FillBlankExercise | ListeningExercise;
export type ExerciseType = Exercise['type'];

export interface Lesson {
  id: string;
  title: string;
  subtitle?: LocalizedText;
  source?: LessonSource;
  theory: TheoryBlock[];
  vocabulary?: VocabularyItem[];
  exercises: Exercise[];
}

export interface Unit {
  id: string;
  title: LocalizedText;
  lessons: Lesson[];
}

export interface Level {
  id: LevelId;
  /** CEFR range, e.g. "A1–A2". */
  cefr: string;
  units: Unit[];
}

export type Course = Level[];
