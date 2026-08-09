import { useEvaluationStore } from '@/stores/evaluationStore'
import { useRubricStore } from '@/stores/rubricStore'
import { useSubmissionStore } from '@/stores/submissionStore'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
} from 'chart.js'
import { Bar, Radar } from 'react-chartjs-2'
import FeedbackCard from './FeedbackCard'
import { exportToPDF } from '@/lib/reportExporter'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, RadialLinearScale,
  PointElement, LineElement, Filler, Tooltip, Legend,
)

const BAND_COLORS: Record<number, string> = {
  4: '#16a34a', 3: '#ca8a04', 2: '#ea580c', 1: '#dc2626',
}

const BAND_LABELS: Record<number, string> = {
  4: 'Excellent', 3: 'Good', 2: 'Developing', 1: 'Beginning'
}

const gradeColor: Record<string, string> = {
  A: 'text-green-700', B: 'text-green-600',
  C: 'text-yellow-700', D: 'text-orange-700', F: 'text-red-700'
}

export default function ResultsPanel() {
  const results = useEvaluationStore(state => state.results)
  const rubrics = useRubricStore(state => state.rubrics)
  const activeRubricId = useRubricStore(state => state.activeRubricId)
  const activeRubric = rubrics.find(r => r.id === activeRubricId)
  const submissions = useSubmissionStore(state => state.submissions)

  const latestResult = Object.values(results).at(-1)

  if (!latestResult) {
    return (
      <div className="p-4 text-sm text-gray-600">
        No results yet. Select a rubric and click Evaluate.
      </div>
    )
  }

  const activeSubmission = submissions.find(s => s.id === latestResult.submissionId)

  const labels = latestResult.categoryScores.map(c =>
    activeRubric?.categories.find(cat => cat.id === c.categoryId)?.name ?? c.categoryId
  )
  const scores = latestResult.categoryScores.map(c => c.score)
  const colors = latestResult.categoryScores.map(c => BAND_COLORS[c.band])

  const barData = {
    labels,
    datasets: [{ label: 'Score', data: scores, backgroundColor: colors }]
  }

  const radarData = {
    labels,
    datasets: [{
      label: 'Scores', data: scores,
      backgroundColor: 'rgba(29, 69, 51, 0.2)',
      borderColor: 'rgba(29, 69, 51, 0.8)',
      pointBackgroundColor: 'rgba(29, 69, 51, 1)',
    }]
  }

  const overallBand = latestResult.overallScore >= 85 ? 4
    : latestResult.overallScore >= 70 ? 3
    : latestResult.overallScore >= 50 ? 2 : 1

  return (
    <div className="p-4 space-y-4" aria-live="polite">

      {/* Export button */}
      <div className="flex justify-end">
        <button
          onClick={() => exportToPDF(activeSubmission?.label ?? 'Report')}
          className="text-xs px-3 py-1 rounded font-medium hover:opacity-80"
          style={{ backgroundColor: '#5e3122', color: '#f7eae0' }}
        >
          Export PDF
        </button>
      </div>

      {/* Report content */}
      <div id="report" className="space-y-4 p-2" style={{ backgroundColor: '#f7eae0' }}>

        {/* Overall score */}
        <div className="text-center">
          <div className="text-4xl font-bold">{latestResult.overallScore}%</div>
          <div className={`text-2xl font-semibold ${gradeColor[latestResult.letterGrade] ?? ''}`}>
            {latestResult.letterGrade}
          </div>
          <div className="text-sm text-gray-500">{BAND_LABELS[overallBand]}</div>
          <div className="text-xs text-gray-600 mt-1">
            Evaluated {new Date(latestResult.evaluatedAt).toLocaleTimeString()}
          </div>
        </div>

        {/* Bar chart */}
        <div style={{ height: '280px' }}>
          <Bar
            data={barData}
            options={{
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
              scales: { x: { min: 0, max: 100 } },
              plugins: { legend: { display: false } }
            }}
          />
        </div>

        {/* Radar chart */}
        <Radar data={radarData} options={{
          responsive: true,
          scales: { r: { min: 0, max: 100 } },
          plugins: { legend: { display: false } }
        }} />

        {/* Feedback Cards */}
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1d4533' }}>
            Category Feedback
          </div>
          {latestResult.categoryScores.map(score => (
            <FeedbackCard
              key={score.categoryId}
              score={score}
              rubricCategory={activeRubric?.categories.find(c => c.id === score.categoryId)}
            />
          ))}
        </div>

        {/* Strengths */}
        {latestResult.strengths.length > 0 && (
          <div>
            <div className="text-xs font-semibold mb-1" style={{ color: '#1d4533' }}>Strengths</div>
            {latestResult.strengths.map((s, i) => (
              <div key={i} className="text-xs text-gray-600 dark:text-gray-300">✓ {s}</div>
            ))}
          </div>
        )}

        {/* Improvements */}
        {latestResult.improvements.length > 0 && (
          <div>
            <div className="text-xs font-semibold mb-1" style={{ color: '#5e3122' }}>Improvements</div>
            {latestResult.improvements.map((s, i) => (
              <div key={i} className="text-xs text-gray-600 dark:text-gray-300">✗ {s}</div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}