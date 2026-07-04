import { Mark, mergeAttributes } from '@tiptap/core'

export const CATEGORY_COLORS: Record<string, string> = {
  grammar: '#dc2626',
  clarity: '#2563eb',
  vocabulary: '#7c3aed',
  relevance: '#ea580c',
  organization: '#0d9488',
  argument: '#ca8a04',
}

export const IssueHighlight = Mark.create({
  name: 'issueHighlight',
  addAttributes() {
    return {
      category: { default: null },
      message: { default: null },
      color: { default: '#dc2626' },
    }
  },
  parseHTML() {
    return [{ tag: 'span[data-issue]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, {
      'data-issue': true,
      style: `background-color: ${HTMLAttributes.color}22; border-bottom: 2px solid ${HTMLAttributes.color}; cursor: pointer;`,
      title: HTMLAttributes.message,
    }), 0]
  },
})
