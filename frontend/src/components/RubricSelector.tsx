import { useRubricStore } from '@/stores/rubricStore'

interface Props {
  onEdit: (id: string) => void
}

export default function RubricSelector({ onEdit }: Props) {
  const { rubrics, activeRubricId, setActiveRubric, deleteRubric } = useRubricStore()

  const handleExport = (id: string) => {
    const rubric = rubrics.find(r => r.id === id)
    if (!rubric) return
    const blob = new Blob([JSON.stringify(rubric, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${rubric.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const rubric = JSON.parse(reader.result as string)
        useRubricStore.getState().addRubric(rubric)
      } catch {
        alert('Invalid rubric file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-sm font-semibold">Rubrics</h2>

      {rubrics.length === 0 && (
        <p className="text-xs text-gray-400">No rubrics yet. Create one below.</p>
      )}

      {rubrics.map(r => (
        <div
          key={r.id}
          className={`border rounded p-2 space-y-1 cursor-pointer ${
            activeRubricId === r.id
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'dark:border-gray-700'
          }`}
          onClick={() => setActiveRubric(r.id)}
        >
          <div className="text-sm font-medium">{r.name}</div>
          <div className="flex gap-2">
            <button
              onClick={e => { e.stopPropagation(); onEdit(r.id) }}
              className="text-xs text-blue-500"
            >
              Edit
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleExport(r.id) }}
              className="text-xs text-green-500"
            >
              Export
            </button>
            <button
              onClick={e => { e.stopPropagation(); deleteRubric(r.id) }}
              className="text-xs text-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <label className="block text-xs text-purple-500 cursor-pointer">
        Import JSON
        <input type="file" accept=".json" className="hidden" onChange={handleImport} />
      </label>
    </div>
  )
}