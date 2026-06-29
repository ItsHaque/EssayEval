import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Rubric } from '@/types/rubric'

interface RubricStore {
  rubrics: Rubric[]
  activeRubricId: string | null
  addRubric: (rubric: Rubric) => void
  updateRubric: (rubric: Rubric) => void
  deleteRubric: (id: string) => void
  setActiveRubric: (id: string) => void
}

export const useRubricStore = create<RubricStore>()(
  persist(
    (set) => ({
      rubrics: [],
      activeRubricId: null,
      addRubric: (rubric) => set((state) => ({ rubrics: [...state.rubrics, rubric] })),
      updateRubric: (rubric) => set((state) => ({
        rubrics: state.rubrics.map(r => r.id === rubric.id ? rubric : r)
      })),
      deleteRubric: (id) => set((state) => ({
        rubrics: state.rubrics.filter(r => r.id !== id)
      })),
      setActiveRubric: (id) => set({ activeRubricId: id }),
    }),
    { name: 'rubric-store' }
  )
)