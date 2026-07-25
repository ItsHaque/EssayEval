import { useEvaluationStore } from '@/stores/evaluationStore'
import { useRubricStore } from '@/stores/rubricStore'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Radar } from 'react-chartjs-2'
import FeedbackCard from './FeedbackCard'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
)

const BAND_COLORS: Record<number, string> = {
  4: '#16a34a',  // green
  3: '#ca8a04',  // yellow
  2: '#ea580c',  // orange
  1: '#dc2626',  // red
}

export default function ResultsPanel() {
  const results = useEvaluationStore(state => state.results)
  const rubrics = useRubricStore(state => state.rubrics)
  const activeRubricId = useRubricStore(state => state.activeRubricId)
  const activeRubric = rubrics.find(r => r.id === activeRubricId)

  const latestResult = Object.values(results).at(-1)

  if (!latestResult) {
    return (
      <div className="p-4 text-sm text-gray-400">
        No results yet. Select a rubric and click Evaluate.
      </div>
    )
  }

  // replace with this
  const labels = latestResult.categoryScores.map(c =>
    activeRubric?.categories.find(cat => cat.id === c.categoryId)?.name ?? c.categoryId
  )
  const scores = latestResult.categoryScores.map(c => c.score)
  const colors = latestResult.categoryScores.map(c => BAND_COLORS[c.band])

  const barData = {
    labels,
    datasets: [{
      label: 'Score',
      data: scores,
      backgroundColor: colors,
    }]
  }

  const radarData = {
    labels,
    datasets: [{
      label: 'Scores',
      data: scores,
      backgroundColor: 'rgba(147, 51, 234, 0.2)',
      borderColor: 'rgba(147, 51, 234, 0.8)',
      pointBackgroundColor: 'rgba(147, 51, 234, 1)',
    }]
  }

  const gradeColor: Record<string, string> = {
    A: 'text-green-600', B: 'text-blue-600',
    C: 'text-yellow-600', D: 'text-orange-600', F: 'text-red-600'
  }

  const BAND_LABELS: Record<number, string> = {
    4: 'Excellent', 3: 'Good', 2: 'Developing', 1: 'Beginning'
  }
  const overallBand = latestResult.overallScore >= 85 ? 4
    : latestResult.overallScore >= 70 ? 3
    : latestResult.overallScore >= 50 ? 2 : 1

  return (
    <div className="p-4 space-y-4" aria-live="polite">
      {/* Overall score */}
      <div className="text-center">
        <div className="text-4xl font-bold">{latestResult.overallScore}%</div>
        <div className={`text-2xl font-semibold ${gradeColor[latestResult.letterGrade] ?? ''}`}>
          {latestResult.letterGrade}
        </div>
        <div className="text-sm text-gray-500">{BAND_LABELS[overallBand]}</div>
        <div className="text-xs text-gray-400 mt-1">
          Evaluated {new Date(latestResult.evaluatedAt).toLocaleTimeString()}
        </div>
      </div>

      {/* Bar chart */}
      <Bar
        data={barData}
        options={{
          indexAxis: 'y',
          responsive: true,
          scales: { x: { min: 0, max: 100 } },
          plugins: { legend: { display: false } }
        }}
      />

      {/* Radar chart */}
      <Radar
        data={radarData}
        options={{
          responsive: true,
          scales: { r: { min: 0, max: 100 } },
          plugins: { legend: { display: false } }
        }}
      />
      {/* Feedback Cards */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
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

      {/* Strengths & improvements */}
      {latestResult.strengths.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-green-600 mb-1">Strengths</div>
          {latestResult.strengths.map((s, i) => (
            <div key={i} className="text-xs text-gray-600 dark:text-gray-300">✓ {s}</div>
          ))}
        </div>
      )}
      {latestResult.improvements.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-red-500 mb-1">Improvements</div>
          {latestResult.improvements.map((s, i) => (
            <div key={i} className="text-xs text-gray-600 dark:text-gray-300">✗ {s}</div>
          ))}
        </div>
      )}
    </div>
  )
}