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
    <div className="border rounded-lg overflow-hidden dark:border-gray-700">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
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
          <span className="text-xs text-gray-400">{score.bandLabel}</span>
          <span className="text-xs text-gray-400">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Body */}
      {open && (
        <div className="px-3 pb-3 space-y-2 border-t dark:border-gray-700">
          {/* Band descriptor from rubric */}
          {bandDescriptor && (
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-2 italic">
              {bandDescriptor}
            </p>
          )}

          {/* Suggestions */}
          {score.suggestions.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                Suggestions
              </div>
              <ul className="space-y-1">
                {score.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex gap-1">
                    <span style={{ color }}>→</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Issue count */}
          {score.issues.length > 0 && (
            <div className="text-xs text-gray-400">
              {score.issues.length} issue{score.issues.length > 1 ? 's' : ''} detected
            </div>
          )}
        </div>
      )}
    </div>
  )
}