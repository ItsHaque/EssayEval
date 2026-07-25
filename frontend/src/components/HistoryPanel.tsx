import { useSubmissionStore } from '@/stores/submissionStore'
import { useEvaluationStore } from '@/stores/evaluationStore'

export default function HistoryPanel() {
  const submissions = useSubmissionStore(state => state.submissions)
  const deleteSubmission = useSubmissionStore(state => state.deleteSubmission)
  const results = useEvaluationStore(state => state.results)

  if (submissions.length === 0) {
    return (
      <div className="text-xs text-gray-400 px-2 py-3">
        No submissions yet.
      </div>
    )
  }

  // Show most recent first
  const sorted = [...submissions].reverse()

  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-2">
        History
      </div>
      {sorted.map(sub => {
        const result = Object.values(results).find(r => r.submissionId === sub.id)
        return (
          <div
            key={sub.id}
            className="rounded-lg px-2 py-2 border dark:border-gray-700 space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium truncate max-w-[120px]">
                {sub.label}
              </span>
              {result && (
                <span className="text-xs font-semibold text-purple-600">
                  {result.overallScore.toFixed(0)}%
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {new Date(sub.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => deleteSubmission(sub.id)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}