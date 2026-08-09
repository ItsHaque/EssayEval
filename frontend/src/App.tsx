import { useState } from 'react'
import Layout from '@/components/Layout'
import RubricBuilder from '@/components/RubricBuilder'
import RubricSelector from '@/components/RubricSelector'
import { useRubricStore } from '@/stores/rubricStore'
import type { Rubric } from '@/types/rubric'
import EssayEditor from '@/components/EssayEditor'
import ResultsPanel from './components/ResultsPanel'

function App() {
  const [showBuilder, setShowBuilder] = useState(false)
  const { addRubric, updateRubric } = useRubricStore()
  const [editingRubricId, setEditingRubricId] = useState<string | null>(null)
  const rubrics = useRubricStore(state => state.rubrics)

  const editingRubric = rubrics.find(r => r.id === editingRubricId)

  const handleSave = (rubric: Rubric) => {
    const exists = useRubricStore.getState().rubrics.find(r => r.id === rubric.id)
    exists ? updateRubric(rubric) : addRubric(rubric)
    setShowBuilder(false)
  }

  return (
    <Layout
      left={
        <div className="flex flex-col h-full">
          <RubricSelector onEdit={(id) => { setEditingRubricId(id); setShowBuilder(true) }} />
          <button
            onClick={() => { setShowBuilder(b => !b); setEditingRubricId(null) }}
            className="mx-4 mb-4 py-2 rounded text-sm font-medium hover:opacity-90"
            style={{ backgroundColor: '#1d4533', color: '#f7eae0' }}
          >
            {showBuilder ? 'Hide Builder' : '+ New Rubric'}
          </button>
          {showBuilder && (
            <RubricBuilder
              onSave={handleSave}
              initialRubric={editingRubric}
            />
          )}
        </div>
      }
      center={<EssayEditor />}
      right={<ResultsPanel />}
    />
  )
}

export default App