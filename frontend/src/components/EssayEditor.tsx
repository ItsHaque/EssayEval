import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useRubricStore } from '@/stores/rubricStore'
import { evaluateEssay } from '@/api/evaluate'
import { useEvaluationStore } from '@/stores/evaluationStore'
import { IssueHighlight } from '@/lib/highlightEngine'
import { applyHighlights } from '@/lib/applyHighlights'
import { parseFile } from '@/lib/fileParser'

export default function EssayEditor() {
  const [wordCount, setWordCount] = useState(0)
  const activeRubricId = useRubricStore(state => state.activeRubricId)
  const rubrics = useRubricStore(state => state.rubrics)
  const activeRubric = rubrics.find(r => r.id === activeRubricId)
  

  const editor = useEditor({
    extensions: [StarterKit, IssueHighlight],
    content: '',
    editorProps: {
      attributes: {
        'aria-label': 'Essay text editor',
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter(Boolean)
      setWordCount(words.length)
    },
  })

  const setEvaluating = useEvaluationStore(state => state.setEvaluating)
  const addResult = useEvaluationStore(state => state.addResult)
  const isEvaluating = useEvaluationStore(state => state.isEvaluating)

  const handleEvaluate = async () => {
    if (!editor || !activeRubric) return
    const text = editor.getText()
    const store = useSubmissionStore.getState()
    const submission = store.submissions[store.submissions.length - 1]
    setEvaluating(true)
    try {
      const result = await evaluateEssay(text, activeRubric, submission?.id ?? '')
      addResult(result)
    } catch (err) {
      console.error('Evaluation failed:', err)
    } finally {
      setEvaluating(false)
    }
  }

  useEffect(() => {
    if (!editor) return
    const submissions = useSubmissionStore.getState().submissions
    const latest = submissions[submissions.length - 1]
    if (latest) {
        editor.commands.setContent(latest.text)
        setWordCount(latest.wordCount)
    }
    }, [editor])

  // Debounced autosave
  useEffect(() => {
    if (!editor) return
    const timeout = setTimeout(() => {
      const text = editor.getText()
      if (!text.trim()) return
      const store = useSubmissionStore.getState()
      const existing = store.submissions[store.submissions.length - 1]
      if (existing) {
        store.updateSubmission(existing.id, { text, wordCount, rubricId: activeRubricId ?? '' })
      } else {
        store.addSubmission({
          id: crypto.randomUUID(),
          label: 'Draft',
          text,
          wordCount,
          rubricId: activeRubricId ?? '',
          createdAt: new Date().toISOString(),
        })
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [wordCount])

  const results = useEvaluationStore(state => state.results)
  const latestResult = Object.values(results).at(-1)

  useEffect(() => {
    if (!editor || !latestResult) return
    const allIssues = latestResult.categoryScores.flatMap(c => c.issues)
    applyHighlights(editor, allIssues)
  }, [latestResult, editor])

  const isOutsideLimit = activeRubric
    ? wordCount < activeRubric.wordLimitMin || wordCount > activeRubric.wordLimitMax
    : false


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    try {
      const text = await parseFile(file)
      editor.commands.setContent(text)
    } catch (err) {
      console.error('File parse failed:', err)
      alert(`Could not read file: ${(err as Error).message}`)
    }
  }

  if (!editor) return null

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Essay</h2>
        <label className="text-xs font-medium px-3 py-1 rounded cursor-pointer hover:opacity-80" style={{ backgroundColor: '#f9d2ba', color: '#1d4533' }}>
          Upload .docx / .pdf
          <input type="file" accept=".docx,.pdf" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="rounded p-3 min-h-[300px]" style={{ border: '1px solid #f9d2ba' }}>
        <EditorContent
          editor={editor}
        />
      </div>

      <div className={`text-xs ${isOutsideLimit ? 'text-red-500' : 'text-gray-600'}`}>
        {wordCount} words
        {activeRubric && ` (limit: ${activeRubric.wordLimitMin}–${activeRubric.wordLimitMax})`}
      </div>
      <button
        onClick={handleEvaluate}
        disabled={!activeRubric || isEvaluating}
        className="w-full py-2 rounded text-sm font-semibold disabled:opacity-50 hover:opacity-90"
        style={{ backgroundColor: '#1d4533', color: '#f7eae0' }}
      >
        {isEvaluating ? 'Evaluating...' : 'Evaluate'}
      </button>
    </div>
  )
}