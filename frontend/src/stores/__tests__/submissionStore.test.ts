import { describe, it, expect, beforeEach } from 'vitest'
import { useSubmissionStore } from '../submissionStore'
import type { Submission } from '@/types/submission'

const mockSub: Submission = {
  id: 'sub1',
  label: 'Draft',
  text: 'Test essay text',
  wordCount: 3,
  rubricId: 'r1',
  createdAt: '2026-01-01T00:00:00Z',
}

beforeEach(() => {
  useSubmissionStore.setState({ submissions: [] })
})

describe('submissionStore', () => {
  it('adds a submission', () => {
    useSubmissionStore.getState().addSubmission(mockSub)
    expect(useSubmissionStore.getState().submissions).toHaveLength(1)
  })

  it('deletes a submission', () => {
    useSubmissionStore.getState().addSubmission(mockSub)
    useSubmissionStore.getState().deleteSubmission('sub1')
    expect(useSubmissionStore.getState().submissions).toHaveLength(0)
  })

  it('updates a submission', () => {
    useSubmissionStore.getState().addSubmission(mockSub)
    useSubmissionStore.getState().updateSubmission('sub1', { label: 'Final' })
    expect(useSubmissionStore.getState().submissions[0].label).toBe('Final')
  })

  it('does not update non-existent submission', () => {
    useSubmissionStore.getState().addSubmission(mockSub)
    useSubmissionStore.getState().updateSubmission('nonexistent', { label: 'X' })
    expect(useSubmissionStore.getState().submissions[0].label).toBe('Draft')
  })
})