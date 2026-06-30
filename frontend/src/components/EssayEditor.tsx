import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'
import { useSubmissionStore } from '@/stores/submissionStore'
import { useRubricStore } from '@/stores/rubricStore'

export default function EssayEditor() {
  const [wordCount, setWordCount] = useState(0)
  const activeRubricId = useRubricStore(state => state.activeRubricId)
  const rubrics = useRubricStore(state => state.rubrics)
  const addSubmission = useSubmissionStore(state => state.addSubmission)
  const activeRubric = rubrics.find(r => r.id === activeRubricId)

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      const words = text.trim().split(/\s+/).filter(Boolean)
      setWordCount(words.length)
    },
  })

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
      addSubmission({
        id: crypto.randomUUID(),
        label: 'Draft',
        text,
        wordCount,
        rubricId: activeRubricId ?? '',
        createdAt: new Date().toISOString(),
      })
    }, 500)
    return () => clearTimeout(timeout)
  }, [wordCount])

  const isOutsideLimit = activeRubric
    ? wordCount < activeRubric.wordLimitMin || wordCount > activeRubric.wordLimitMax
    : false

  const handlePaste = () => {} // TipTap handles paste natively

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    const reader = new FileReader()
    reader.onload = () => {
      editor.commands.setContent(reader.result as string)
    }
    reader.readAsText(file)
  }

  if (!editor) return null

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-semibold">Essay</h2>
        <label className="text-xs text-purple-500 cursor-pointer">
          Upload .txt
          <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="border rounded p-3 min-h-[300px] dark:border-gray-700">
        <EditorContent editor={editor} />
      </div>

      <div className={`text-xs ${isOutsideLimit ? 'text-red-500' : 'text-gray-400'}`}>
        {wordCount} words
        {activeRubric && ` (limit: ${activeRubric.wordLimitMin}–${activeRubric.wordLimitMax})`}
      </div>
    </div>
  )
}