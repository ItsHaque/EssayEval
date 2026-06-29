import { useState } from 'react'
import type { Rubric, RubricCategory } from '@/types/rubric'

const FIXED_CATEGORIES: Pick<RubricCategory, 'id' | 'name'>[] = [
  { id: 'cat_grammar', name: 'Grammar' },
  { id: 'cat_clarity', name: 'Clarity' },
  { id: 'cat_vocabulary', name: 'Vocabulary' },
  { id: 'cat_relevance', name: 'Relevance' },
  { id: 'cat_organization', name: 'Organization' },
  { id: 'cat_argument', name: 'Argument Quality' },
]

const BAND_DESCRIPTORS: Record<string, Record<number, string>> = {
  cat_grammar: {
    4: 'Writing is virtually error-free',
    3: 'Minor errors that do not impede meaning',
    2: 'Frequent errors that sometimes obscure meaning',
    1: 'Errors throughout that impede understanding',
  },
  cat_clarity: {
    4: 'Ideas are expressed clearly and concisely throughout',
    3: 'Most ideas are clear with occasional awkward phrasing',
    2: 'Some ideas are unclear or difficult to follow',
    1: 'Writing is consistently unclear and hard to follow',
  },
  cat_vocabulary: {
    4: 'Sophisticated and varied vocabulary used accurately',
    3: 'Good range of vocabulary with minor inaccuracies',
    2: 'Limited vocabulary with some inaccurate word choices',
    1: 'Very limited vocabulary that impedes communication',
  },
  cat_relevance: {
    4: 'Essay directly and fully addresses the prompt throughout',
    3: 'Essay mostly addresses the prompt with minor digressions',
    2: 'Essay partially addresses the prompt with notable gaps',
    1: 'Essay largely ignores or misunderstands the prompt',
  },
  cat_organization: {
    4: 'Well-structured with clear intro, body, and conclusion',
    3: 'Generally well-organized with minor structural issues',
    2: 'Some structure evident but inconsistent organization',
    1: 'Little to no discernible organizational structure',
  },
  cat_argument: {
    4: 'Claims are well-supported with clear evidence throughout',
    3: 'Most claims supported with adequate evidence',
    2: 'Some claims lack supporting evidence',
    1: 'Claims are unsupported or reasoning is unclear',
  },
}

interface Props {
  onSave: (rubric: Rubric) => void
  initialRubric?: Rubric
}

export default function RubricBuilder({ onSave, initialRubric }: Props) {
  const [name, setName] = useState(initialRubric?.name ?? '')
  const [prompt, setPrompt] = useState(initialRubric?.prompt ?? '')
  const [wordLimitMin, setWordLimitMin] = useState(initialRubric?.wordLimitMin ?? 250)
  const [wordLimitMax, setWordLimitMax] = useState(initialRubric?.wordLimitMax ?? 500)
  const [weights, setWeights] = useState<Record<string, number>>(
    initialRubric
      ? Object.fromEntries(initialRubric.categories.map(c => [c.id, c.weight]))
      : Object.fromEntries(FIXED_CATEGORIES.map(c => [c.id, 0]))
  )

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  const weightValid = totalWeight === 100

  const updateWeight = (id: string, val: number) => {
    setWeights(w => ({ ...w, [id]: val }))
  }

  const handleSave = () => {
    if (!weightValid || !name.trim()) return
    const rubric: Rubric = {
        id: initialRubric?.id ?? crypto.randomUUID(),
        version: '1',
        name,
        prompt,
        wordLimitMin,
        wordLimitMax,
        gradeBands: { A: 85, B: 70, C: 55, D: 40 },
        categories: FIXED_CATEGORIES.map(c => ({
            id: c.id,
            name: c.name,
            weight: weights[c.id],
            bands: BAND_DESCRIPTORS[c.id] as unknown as RubricCategory['bands'],
        })),
        createdAt: initialRubric?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
    onSave(rubric)
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-lg font-semibold">Rubric Builder</h2>

      {/* Metadata */}
      <div className="space-y-2">
        <input
          className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600"
          placeholder="Rubric name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <textarea
          className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600"
          placeholder="Essay prompt (optional)"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={2}
        />
        <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500">Word limit</label>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600"
            placeholder="Min words"
            value={wordLimitMin}
            onChange={e => setWordLimitMin(Number(e.target.value))}
          />
          <input
            type="number"
            className="w-full border rounded px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600"
            placeholder="Max words"
            value={wordLimitMax}
            onChange={e => setWordLimitMax(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Weight validator */}
      <div className={`text-sm font-medium ${weightValid ? 'text-green-600' : 'text-red-500'}`}>
        Total weight: {totalWeight}% {weightValid ? '✓' : '✗ (must be 100%)'}
      </div>

      {/* Categories */}
      {FIXED_CATEGORIES.map(cat => (
        <div key={cat.id} className="border rounded p-3 space-y-2 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm">{cat.name}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                className="w-16 border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600"
                value={weights[cat.id]}
                onChange={e => updateWeight(cat.id, Number(e.target.value))}
              />
              <span className="text-sm">%</span>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        disabled={!weightValid || !name.trim()}
        className="w-full py-2 rounded bg-purple-600 text-white text-sm font-medium disabled:opacity-50"
      >
        Save Rubric
      </button>
    </div>
  )
}