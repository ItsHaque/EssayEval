import type { Editor } from '@tiptap/react'
import type { TextIssue } from '@/types/evaluation'
import { CATEGORY_COLORS } from './highlightEngine'

export function applyHighlights(editor: Editor, issues: TextIssue[]) {
  // Clear existing highlights
  editor.chain()
    .selectAll()
    .unsetMark('issueHighlight')
    .setTextSelection(0)
    .run()

  if (!issues.length) return

  const doc = editor.state.doc
  const docText = doc.textContent

  for (const issue of issues) {
    // TipTap pos = char offset + 1 (document node adds 1)
    const from = issue.start + 1
    const to = issue.end + 1

    if (from < 1 || to > docText.length + 1) continue

    editor.chain()
      .setTextSelection({ from, to })
      .setMark('issueHighlight', {
        category: issue.category,
        message: issue.message,
        color: CATEGORY_COLORS[issue.category] ?? '#888888',
      })
      .run()
  }

  // Deselect
  editor.commands.setTextSelection(0)
}