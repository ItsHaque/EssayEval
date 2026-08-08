import * as mammoth from 'mammoth'

export async function parseFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  }

  if (ext === 'pdf') {
    const arrayBuffer = await file.arrayBuffer()
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.mjs',
      import.meta.url,
    ).toString()

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const pages = await Promise.all(
      Array.from({ length: pdf.numPages }, (_, i) =>
        pdf.getPage(i + 1).then(page =>
          page.getTextContent().then(content =>
            content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ')
          )
        )
      )
    )
    return pages.join('\n\n')
  }

  throw new Error(`Unsupported file type: .${ext}`)
}