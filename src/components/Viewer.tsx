import { useRef, useEffect, useCallback } from 'react'
import { useFiles } from '../context/FileContext'
import MarkdownRenderer from './MarkdownRenderer'

export default function Viewer() {
  const { files, activeFileId } = useFiles()
  const contentRef = useRef<HTMLDivElement>(null)
  const activeFile = activeFileId ? files.get(activeFileId) : null

  const handleExportPdf = useCallback(async () => {
    if (!contentRef.current || !activeFile) return
    const html2pdf = (await import('html2pdf.js')).default
    html2pdf()
      .set({
        margin: [15, 15, 15, 15],
        filename: activeFile.name.replace(/\.md$/, '.pdf'),
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(contentRef.current)
      .save()
  }, [activeFile])

  useEffect(() => {
    const handler = () => handleExportPdf()
    window.addEventListener('md-reader:export-pdf', handler)
    return () => window.removeEventListener('md-reader:export-pdf', handler)
  }, [handleExportPdf])

  if (!activeFile) return null

  return (
    <div className="h-full overflow-y-auto">
      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        padding: '80px 48px 200px 48px',
      }}>
        <MarkdownRenderer ref={contentRef} content={activeFile.content} />
      </div>
    </div>
  )
}
