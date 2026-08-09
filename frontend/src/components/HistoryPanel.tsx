import { useSubmissionStore } from '@/stores/submissionStore'
import { useEvaluationStore } from '@/stores/evaluationStore'

export default function HistoryPanel() {
  const submissions = useSubmissionStore(state => state.submissions)
  const deleteSubmission = useSubmissionStore(state => state.deleteSubmission)
  const results = useEvaluationStore(state => state.results)

  if (submissions.length === 0) {
    return (
      <div className="text-xs px-2 py-3" style={{ color: '#5e3122' }}>
        No submissions yet.
      </div>
    )
  }

  // Show most recent first
  const sorted = [...submissions].reverse()

  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wide px-1 mb-2" style={{ color: '#1d4533' }}>
        History
      </div>
      {sorted.map(sub => {
        const result = Object.values(results).find(r => r.submissionId === sub.id)
        return (
          <div
            key={sub.id}
            className="rounded-lg px-2 py-2 space-y-1"
            style={{ border: '1px solid #f9d2ba', backgroundColor: 'white' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium truncate max-w-[120px]">
                {sub.label}
              </span>
              {result && (
                <span className="text-xs font-semibold" style={{ color: '#1d4533' }}>
                  {result.overallScore.toFixed(0)}%
                </span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs" style={{ color: '#5e3122' }}>
                {new Date(sub.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => deleteSubmission(sub.id)}
                className="text-xs px-2 py-0.5 rounded font-medium hover:opacity-80"
                style={{ backgroundColor: '#5e3122', color: '#f7eae0' }}
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