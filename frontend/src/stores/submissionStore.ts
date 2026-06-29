import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Submission } from '@/types/submission'

const MAX_STORAGE_BYTES = 8 * 1024 * 1024

interface SubmissionStore {
  submissions: Submission[]
  addSubmission: (submission: Submission) => void
  deleteSubmission: (id: string) => void
}

export const useSubmissionStore = create<SubmissionStore>()(
  persist(
    (set) => ({
      submissions: [],
      addSubmission: (submission) => set((state) => {
        const updated = [...state.submissions, submission]
        const size = new Blob([JSON.stringify(updated)]).size
        if (size > MAX_STORAGE_BYTES) updated.shift() // LRU eviction
        return { submissions: updated }
      }),
      deleteSubmission: (id) => set((state) => ({
        submissions: state.submissions.filter(s => s.id !== id)
      })),
    }),
    { name: 'submission-store' }
  )
)