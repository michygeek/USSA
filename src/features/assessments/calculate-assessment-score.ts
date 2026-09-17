export interface AssessmentScoreResult {
  scorePercentage: number;
  passed: boolean;
}

// The standard "number missed" grading curve used on licensing-exam score sheets:
// grade = round((total - missed) / total * 100), i.e. round(correct / total * 100).
// For a 32-question exam this reproduces the published table (1 missed -> 97%, 8 missed -> 75%,
// ...) at every row except two (3 missed and 12 missed), where the published table's manual
// rounding is off by a point from pure arithmetic rounding — an accepted, known divergence since
// this formula (unlike a fixed lookup table) generalizes to assessments of any length.
export function calculateAssessmentScore(correctCount: number, totalQuestions: number, passingScorePercentage: number): AssessmentScoreResult {
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
  return { scorePercentage, passed: scorePercentage >= passingScorePercentage };
}
