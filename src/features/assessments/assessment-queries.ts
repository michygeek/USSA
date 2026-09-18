import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { assessmentChoices, assessmentAttempts, assessmentQuestions, courseAssessments } from '@/db/schema';
import type { AssessmentAttempt, AssessmentForLearner, AssessmentWithQuestions } from './assessment-types';

export async function getAssessmentByCourseId(courseId: string) {
  const [assessmentRecord] = await db.select().from(courseAssessments).where(eq(courseAssessments.courseId, courseId));
  return assessmentRecord ?? null;
}

export async function getAssessmentWithQuestions(courseId: string): Promise<AssessmentWithQuestions | null> {
  const assessmentRecord = await getAssessmentByCourseId(courseId);
  if (!assessmentRecord) return null;

  const questionRows = await db
    .select()
    .from(assessmentQuestions)
    .where(eq(assessmentQuestions.assessmentId, assessmentRecord.id))
    .orderBy(asc(assessmentQuestions.position));

  const questions = await Promise.all(
    questionRows.map(async (questionRow) => {
      const choices = await db
        .select()
        .from(assessmentChoices)
        .where(eq(assessmentChoices.questionId, questionRow.id))
        .orderBy(asc(assessmentChoices.position));
      return { ...questionRow, choices };
    }),
  );

  return { ...assessmentRecord, questions };
}

// Strips `isCorrect` before the assessment is ever sent to a learner-facing page.
export function toLearnerView(assessment: AssessmentWithQuestions): AssessmentForLearner {
  return {
    id: assessment.id,
    title: assessment.title,
    passingScorePercentage: assessment.passingScorePercentage,
    questions: assessment.questions.map((question) => ({
      id: question.id,
      questionText: question.questionText,
      choices: question.choices.map((choice) => ({ id: choice.id, choiceText: choice.choiceText })),
    })),
  };
}

export async function listAttemptsForUser(assessmentId: string, userId: string): Promise<AssessmentAttempt[]> {
  return db
    .select()
    .from(assessmentAttempts)
    .where(and(eq(assessmentAttempts.assessmentId, assessmentId), eq(assessmentAttempts.userId, userId)))
    .orderBy(desc(assessmentAttempts.submittedAt));
}

// A course only requires passing its assessment if one has actually been published (has at
// least one question) — an empty assessment shell an instructor is still building shouldn't
// block certificates for a course that otherwise has none configured yet.
export async function hasPassedRequiredAssessment(userId: string, courseId: string): Promise<boolean> {
  const assessment = await getAssessmentByCourseId(courseId);
  if (!assessment) return true;

  const [firstQuestion] = await db
    .select({ id: assessmentQuestions.id })
    .from(assessmentQuestions)
    .where(eq(assessmentQuestions.assessmentId, assessment.id))
    .limit(1);
  if (!firstQuestion) return true;

  const [passingAttempt] = await db
    .select({ id: assessmentAttempts.id })
    .from(assessmentAttempts)
    .where(and(eq(assessmentAttempts.assessmentId, assessment.id), eq(assessmentAttempts.userId, userId), eq(assessmentAttempts.passed, true)))
    .limit(1);
  return !!passingAttempt;
}

export async function getAttemptById(attemptId: string) {
  const [attempt] = await db.select().from(assessmentAttempts).where(eq(assessmentAttempts.id, attemptId));
  return attempt ?? null;
}

export async function getCourseIdByAssessmentId(assessmentId: string): Promise<string | null> {
  const [row] = await db.select({ courseId: courseAssessments.courseId }).from(courseAssessments).where(eq(courseAssessments.id, assessmentId));
  return row?.courseId ?? null;
}

export async function getCourseIdByQuestionId(questionId: string): Promise<string | null> {
  const [row] = await db
    .select({ courseId: courseAssessments.courseId })
    .from(assessmentQuestions)
    .innerJoin(courseAssessments, eq(courseAssessments.id, assessmentQuestions.assessmentId))
    .where(eq(assessmentQuestions.id, questionId));
  return row?.courseId ?? null;
}

export async function getCourseIdByChoiceId(choiceId: string): Promise<string | null> {
  const [row] = await db
    .select({ courseId: courseAssessments.courseId })
    .from(assessmentChoices)
    .innerJoin(assessmentQuestions, eq(assessmentQuestions.id, assessmentChoices.questionId))
    .innerJoin(courseAssessments, eq(courseAssessments.id, assessmentQuestions.assessmentId))
    .where(eq(assessmentChoices.id, choiceId));
  return row?.courseId ?? null;
}
