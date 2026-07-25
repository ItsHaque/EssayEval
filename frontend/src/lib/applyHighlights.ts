import type { Editor } from '@tiptap/react'
import type { TextIssue } from '@/types/evaluation'
import { CATEGORY_COLORS } from './highlightEngine'

const CATEGORY_PRIORITY: Record<string, number> = {
  grammar: 1,
  clarity: 2,
  argument: 3,
  relevance: 4,
  organization: 5,
  vocabulary: 6,
}

export function applyHighlights(editor: Editor, issues: TextIssue[]) {
  editor.chain()
    .selectAll()
    .unsetMark('issueHighlight')
    .setTextSelection(0)
    .run()

  if (!issues.length) return

  // Sort by priority, then by start position
  const sorted = [...issues].sort((a, b) => {
    const pa = CATEGORY_PRIORITY[a.category] ?? 99
    const pb = CATEGORY_PRIORITY[b.category] ?? 99
    return pa !== pb ? pa - pb : a.start - b.start
  })

  // Track claimed character ranges
  const claimed: Array<{ from: number; to: number }> = []

  const overlaps = (from: number, to: number) =>
    claimed.some(r => from < r.to && to > r.from)

  const docLength = editor.state.doc.content.size

  for (const issue of sorted) {
    const from = issue.start + 1
    const to = issue.end + 1

    if (from < 1 || to > docLength) continue
    if (overlaps(from, to)) continue

    editor.chain()
      .setTextSelection({ from, to })
      .setMark('issueHighlight', {
        category: issue.category,
        message: issue.message,
        color: CATEGORY_COLORS[issue.category] ?? '#888888',
      })
      .run()

    claimed.push({ from, to })
  }

  editor.commands.setTextSelection(0)
}