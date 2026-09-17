'use server';

import { asc, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { assessmentAttemptAnswers, assessmentAttempts, assessmentChoices, assessmentQuestions } from '@/db/schema';
import { ApiError } from '@/api-response/api-error';
import { API_ERROR_CODE } from '@/api-response/api-error-codes';
import { requireAuthenticatedUserFromSession } from '@/features/auth/require-authenticated-user';
import { getCourseById } from '@/features/courses/course-queries';
import { requireCourseAssessmentAccess } from './require-course-assessment-access';
import { getAssessmentByCourseId } from './assessment-queries';
import { calculateAssessmentScore } from './calculate-assessment-score';

export interface SubmittedAnswer {
  questionId: string;
  selectedChoiceId: string;
}

export async function submitAssessmentAttempt(courseId: string, answers: SubmittedAnswer[]) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();

  const courseRecord = await getCourseById(courseId);
  if (!courseRecord) throw new ApiError(404, API_ERROR_CODE.COURSE_NOT_FOUND, 'Course not found.');
  await requireCourseAssessmentAccess(authenticatedUser, courseRecord);

  const assessmentRecord = await getAssessmentByCourseId(courseId);
  if (!assessmentRecord) throw new ApiError(404, API_ERROR_CODE.ASSESSMENT_NOT_FOUND, 'This course has no assessment.');

  const questionRows = await db
    .select()
    .from(assessmentQuestions)
    .where(eq(assessmentQuestions.assessmentId, assessmentRecord.id))
    .orderBy(asc(assessmentQuestions.position));
  if (questionRows.length === 0) {
    throw new ApiError(404, API_ERROR_CODE.ASSESSMENT_NOT_FOUND, 'This assessment has no questions yet.');
  }

  const selectedChoiceIdByQuestionId = new Map(answers.map((answer) => [answer.questionId, answer.selectedChoiceId]));
  if (questionRows.some((question) => !selectedChoiceIdByQuestionId.has(question.id))) {
    throw new ApiError(400, API_ERROR_CODE.ASSESSMENT_INVALID_SUBMISSION, 'Answer every question before submitting.');
  }

  const choiceRows = await db
    .select()
    .from(assessmentChoices)
    .where(
      inArray(
        assessmentChoices.questionId,
        questionRows.map((question) => question.id),
      ),
    );
  const correctChoiceIdByQuestionId = new Map(
    choiceRows.filter((choice) => choice.isCorrect).map((choice) => [choice.questionId, choice.id]),
  );

  let correctCount = 0;
  const answerRecords = questionRows.map((question) => {
    const selectedChoiceId = selectedChoiceIdByQuestionId.get(question.id);
    const isValidChoice = choiceRows.some((choice) => choice.id === selectedChoiceId && choice.questionId === question.id);
    if (!isValidChoice) {
      throw new ApiError(400, API_ERROR_CODE.ASSESSMENT_INVALID_SUBMISSION, 'One of the submitted answers is invalid.');
    }
    const isCorrect = correctChoiceIdByQuestionId.get(question.id) === selectedChoiceId;
    if (isCorrect) correctCount += 1;
    return { questionId: question.id, selectedChoiceId: selectedChoiceId!, isCorrect };
  });

  const totalQuestions = questionRows.length;
  const { scorePercentage, passed } = calculateAssessmentScore(correctCount, totalQuestions, assessmentRecord.passingScorePercentage);

  const [attempt] = await db
    .insert(assessmentAttempts)
    .values({
      assessmentId: assessmentRecord.id,
      userId: authenticatedUser.userId,
      correctCount,
      totalQuestions,
      scorePercentage,
      passed,
    })
    .returning();
  if (!attempt) throw new ApiError(500, API_ERROR_CODE.INTERNAL_ERROR, 'Failed to record your attempt.');

  await db.insert(assessmentAttemptAnswers).values(answerRecords.map((answer) => ({ ...answer, attemptId: attempt.id })));

  revalidatePath(`/dashboard/courses/${courseRecord.slug}/assessment`);
  return attempt;
}
