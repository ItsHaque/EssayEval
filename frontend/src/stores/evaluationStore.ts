import { create } from 'zustand'
import type { EvaluationResult } from '@/types/evaluation'

interface EvaluationStore {
  results: Record<string, EvaluationResult>
  isEvaluating: boolean
  addResult: (result: EvaluationResult) => void
  setEvaluating: (val: boolean) => void
}

export const useEvaluationStore = create<EvaluationStore>()((set) => ({
  results: {},
  isEvaluating: false,
  addResult: (result) => set((state) => ({
    results: { ...state.results, [result.id]: result }
  })),
  setEvaluating: (val) => set({ isEvaluating: val }),
}))