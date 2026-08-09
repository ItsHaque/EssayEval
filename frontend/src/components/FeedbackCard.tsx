import { useState } from 'react'
import type { CategoryScore } from '@/types/evaluation'
import type { RubricCategory } from '@/types/rubric'

const CATEGORY_COLORS: Record<string, string> = {
  grammar: '#dc2626',
  clarity: '#2563eb',
  vocabulary: '#7c3aed',
  relevance: '#ea580c',
  organization: '#0d9488',
  argument: '#ca8a04',
  ml_quality: '#1d4533',
}

interface Props {
  score: CategoryScore
  rubricCategory?: RubricCategory
}

export default function FeedbackCard({ score, rubricCategory }: Props) {
  const defaultOpen = score.band <= 2
  const [open, setOpen] = useState(defaultOpen)

  const categoryKey = score.categoryId.replace('cat_', '')
  const color = CATEGORY_COLORS[categoryKey] ?? '#888888'
  const bandDescriptor = rubricCategory?.bands[score.band as 1|2|3|4] ?? ''

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #f9d2ba' }}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:opacity-80"
        style={{ backgroundColor: '#f7eae0' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium">
            {rubricCategory?.name ?? score.categoryId}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color }}>
            {score.score.toFixed(0)}%
          </span>
          <span className="text-xs" style={{ color: '#5e3122' }}>{score.bandLabel}</span>
          <span className="text-xs" style={{ color: '#5e3122' }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="px-3 pb-3 space-y-2" style={{ borderTop: '1px solid #f9d2ba' }}>
          {/* Band descriptor from rubric */}
          {bandDescriptor && (
            <p className="text-xs pt-2 italic" style={{ color: '#5e3122' }}>
              {bandDescriptor}
            </p>
          )}

          {/* Suggestions */}
          {score.suggestions.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-1" style={{ color: '#1d4533' }}>
                Suggestions
              </div>
              <ul className="space-y-1">
                {score.suggestions.map((s, i) => (
                  <li key={i} className="text-xs flex gap-1" style={{ color: '#1d4533' }}>
                    <span style={{ color }}>→</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Issue count */}
          {score.issues.length > 0 && (
            <div className="text-xs" style={{ color: '#5e3122' }}>
              {score.issues.length} issue{score.issues.length > 1 ? 's' : ''} detected
            </div>
          )}
        </div>
      )}
    </div>
  )
}