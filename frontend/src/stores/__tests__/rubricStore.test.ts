import { describe, it, expect, beforeEach } from 'vitest'
import { useRubricStore } from '../rubricStore'
import type { Rubric } from '@/types/rubric'

const mockRubric: Rubric = {
  id: 'r1',
  version: '1',
  name: 'Test Rubric',
  wordLimitMin: 100,
  wordLimitMax: 500,
  gradeBands: { A: 85, B: 70, C: 55, D: 40 },
  categories: [
    {
      id: 'cat_grammar',
      name: 'Grammar',
      weight: 100,
      bands: { 4: 'Excellent', 3: 'Good', 2: 'Developing', 1: 'Beginning' }
    }
  ],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
}

beforeEach(() => {
  useRubricStore.setState({ rubrics: [], activeRubricId: null })
})

describe('rubricStore', () => {
  it('adds a rubric', () => {
    useRubricStore.getState().addRubric(mockRubric)
    expect(useRubricStore.getState().rubrics).toHaveLength(1)
  })

  it('updates a rubric', () => {
    useRubricStore.getState().addRubric(mockRubric)
    useRubricStore.getState().updateRubric({ ...mockRubric, name: 'Updated' })
    expect(useRubricStore.getState().rubrics[0].name).toBe('Updated')
  })

  it('deletes a rubric', () => {
    useRubricStore.getState().addRubric(mockRubric)
    useRubricStore.getState().deleteRubric('r1')
    expect(useRubricStore.getState().rubrics).toHaveLength(0)
  })

  it('sets active rubric', () => {
    useRubricStore.getState().setActiveRubric('r1')
    expect(useRubricStore.getState().activeRubricId).toBe('r1')
  })
})