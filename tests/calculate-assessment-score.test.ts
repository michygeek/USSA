import { describe, expect, it } from 'vitest';
import { calculateAssessmentScore } from '@/features/assessments/calculate-assessment-score';

describe('calculateAssessmentScore', () => {
  // Spot-checked against a published 32-question "number missed" grading scale. Rounds half
  // up, matching every row of that table except 3 missed and 12 missed, where the published
  // table's manual rounding differs by a point from pure arithmetic — an accepted divergence.
  it.each([
    [1, 97],
    [2, 94],
    [4, 88],
    [5, 84],
    [6, 81],
    [7, 78],
    [8, 75],
    [9, 72],
    [10, 69],
    [11, 66],
    [13, 59],
  ])('scores %i missed out of 32 as %i%%', (missedCount, expectedScorePercentage) => {
    const correctCount = 32 - missedCount;
    const { scorePercentage } = calculateAssessmentScore(correctCount, 32, 70);
    expect(scorePercentage).toBe(expectedScorePercentage);
  });

  it('rounds .5 up rather than down', () => {
    expect(calculateAssessmentScore(28, 32, 70).scorePercentage).toBe(88); // 87.5 -> 88
    expect(calculateAssessmentScore(4, 8, 70).scorePercentage).toBe(50); // 50 exactly
  });

  it('passes when the score meets the threshold, fails just below it', () => {
    expect(calculateAssessmentScore(7, 10, 70).passed).toBe(true); // 70%
    expect(calculateAssessmentScore(6, 10, 70).passed).toBe(false); // 60%
  });

  it('scores a perfect run as 100% regardless of question count', () => {
    expect(calculateAssessmentScore(17, 17, 70).scorePercentage).toBe(100);
  });
});
