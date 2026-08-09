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
      <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: '#1d4533' }}>Rubrics</h2>

      {rubrics.length === 0 && (
        <p className="text-xs text-gray-400">No rubrics yet. Create one below.</p>
      )}

      {rubrics.map(r => (
        <div
          key={r.id}
          className="rounded-lg p-2 space-y-2 cursor-pointer"
          style={{
            border: activeRubricId === r.id ? '2px solid #1d4533' : '1px solid #f9d2ba',
            backgroundColor: activeRubricId === r.id ? '#f9d2ba' : 'white',
          }}
          onClick={() => setActiveRubric(r.id)}
        >
          <div className="text-sm font-medium">{r.name}</div>
          <div className="flex gap-2">
            <button
              onClick={e => { e.stopPropagation(); onEdit(r.id) }}
              className="text-xs px-2 py-0.5 rounded font-medium hover:opacity-80" style={{ backgroundColor: '#1d4533', color: '#f7eae0' }}
            >
              Edit
            </button>
            <button
              onClick={e => { e.stopPropagation(); handleExport(r.id) }}
              className="text-xs px-2 py-0.5 rounded font-medium hover:opacity-80" style={{ backgroundColor: '#8B4513', color: '#f7eae0' }}
            >
              Export
            </button>
            <button
              onClick={e => { e.stopPropagation(); deleteRubric(r.id) }}
              className="text-xs px-2 py-0.5 rounded font-medium hover:opacity-80" style={{ backgroundColor: '#5e3122', color: '#f7eae0' }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <label className="block text-xs px-3 py-1.5 rounded text-center font-medium cursor-pointer hover:opacity-80" style={{ backgroundColor: '#f9d2ba', color: '#1d4533' }}>
        Import JSON
        <input type="file" accept=".json" className="hidden" onChange={handleImport} />
      </label>
    </div>
  )
}