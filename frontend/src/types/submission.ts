export interface Submission {
  id: string; label: string; text: string;
  wordCount: number; rubricId: string;
  resultId?: string; createdAt: string;
}