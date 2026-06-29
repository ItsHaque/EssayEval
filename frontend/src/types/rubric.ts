export interface RubricBands { 4: string; 3: string; 2: string; 1: string; }
export interface RubricCategory {
  id: string; name: string; weight: number; bands: RubricBands;
}
export interface Rubric {
  id: string; version: string; name: string;
  prompt?: string;
  wordLimitMin: number; wordLimitMax: number;
  gradeBands: Record<string, number>;
  categories: RubricCategory[];
  createdAt: string; updatedAt: string;
}