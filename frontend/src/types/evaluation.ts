export interface TextIssue {
  start: number; end: number; message: string; category: string;
}
export interface CategoryScore {
  categoryId: string; score: number; band: 1|2|3|4;
  bandLabel: string; issues: TextIssue[]; suggestions: string[];
}
export interface EvaluationResult {
  id: string; submissionId: string; rubricId: string; rubricVersion: string;
  overallScore: number; letterGrade: string;
  categoryScores: CategoryScore[];
  strengths: string[]; improvements: string[];
  evaluatedAt: string;
}