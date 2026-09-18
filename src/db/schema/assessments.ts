import { pgTable, uuid, text, integer, boolean, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { courses } from './courses';
import { users } from './users';

export const courseAssessments = pgTable('course_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id')
    .notNull()
    .unique()
    .references(() => courses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  passingScorePercentage: integer('passing_score_percentage').notNull().default(70),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const assessmentQuestions = pgTable(
  'assessment_questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => courseAssessments.id, { onDelete: 'cascade' }),
    questionText: text('question_text').notNull(),
    position: integer('position').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    assessmentIdIndex: index('assessment_questions_assessment_id_index').on(table.assessmentId),
  }),
);

export const assessmentChoices = pgTable(
  'assessment_choices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    questionId: uuid('question_id')
      .notNull()
      .references(() => assessmentQuestions.id, { onDelete: 'cascade' }),
    choiceText: text('choice_text').notNull(),
    isCorrect: boolean('is_correct').notNull().default(false),
    position: integer('position').notNull(),
  },
  (table) => ({
    questionIdIndex: index('assessment_choices_question_id_index').on(table.questionId),
  }),
);

// One row per submitted attempt — a real record of what happened, not derived data, so
// (unlike lesson progress) it needs its own table even though it looks similar in shape.
export const assessmentAttempts = pgTable(
  'assessment_attempts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assessmentId: uuid('assessment_id')
      .notNull()
      .references(() => courseAssessments.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    correctCount: integer('correct_count').notNull(),
    totalQuestions: integer('total_questions').notNull(),
    scorePercentage: integer('score_percentage').notNull(),
    passed: boolean('passed').notNull(),
    submittedAt: timestamp('submitted_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    assessmentIdUserIdIndex: index('assessment_attempts_assessment_id_user_id_index').on(table.assessmentId, table.userId),
  }),
);

export const assessmentAttemptAnswers = pgTable(
  'assessment_attempt_answers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    attemptId: uuid('attempt_id')
      .notNull()
      .references(() => assessmentAttempts.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => assessmentQuestions.id, { onDelete: 'cascade' }),
    selectedChoiceId: uuid('selected_choice_id').references(() => assessmentChoices.id),
    isCorrect: boolean('is_correct').notNull(),
  },
  (table) => ({
    attemptIdIndex: index('assessment_attempt_answers_attempt_id_index').on(table.attemptId),
    attemptIdQuestionIdUnique: uniqueIndex('assessment_attempt_answers_attempt_id_question_id_unique').on(
      table.attemptId,
      table.questionId,
    ),
  }),
);
