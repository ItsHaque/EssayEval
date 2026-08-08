import { describe, it, expect, beforeEach } from 'vitest'
import { useEvaluationStore } from '../evaluationStore'
import type { EvaluationResult } from '@/types/evaluation'

const mockResult: EvaluationResult = {
  id: 'result1',
  submissionId: 'sub1',
  rubricId: 'r1',
  rubricVersion: '1',
  overallScore: 75,
  letterGrade: 'B',
  categoryScores: [],
  strengths: ['Good grammar'],
  improvements: ['Improve clarity'],
  evaluatedAt: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  useEvaluationStore.setState({ results: {}, isEvaluating: false })
})

describe('evaluationStore', () => {
  it('adds a result', () => {
    useEvaluationStore.getState().addResult(mockResult)
    expect(useEvaluationStore.getState().results['result1']).toBeDefined()
  })

  it('stores result by id', () => {
    useEvaluationStore.getState().addResult(mockResult)
    expect(useEvaluationStore.getState().results['result1'].overallScore).toBe(75)
  })

  it('sets evaluating state', () => {
    useEvaluationStore.getState().setEvaluating(true)
    expect(useEvaluationStore.getState().isEvaluating).toBe(true)
  })

  it('clears evaluating state', () => {
    useEvaluationStore.getState().setEvaluating(true)
    useEvaluationStore.getState().setEvaluating(false)
    expect(useEvaluationStore.getState().isEvaluating).toBe(false)
  })
})