import axios from 'axios'
import type { Rubric } from '@/types/rubric'
import type { EvaluationResult } from '@/types/evaluation'

export async function evaluateEssay(text: string, rubric: Rubric): Promise<EvaluationResult> {
  const res = await axios.post('http://127.0.0.1:8000/evaluate', { text, rubric })
  return res.data
}