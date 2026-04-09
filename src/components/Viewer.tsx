import { useRef, useEffect, useCallback } from 'react'
import { useFiles } from '../context/FileContext'
import MarkdownRenderer from './MarkdownRenderer'

export default function Viewer() {
  const { files, activeFileId } = useFiles()
  const contentRef = useRef<HTMLDivElement>(null)
  const activeFile = activeFileId ? files.get(activeFileId) : null

  const handleExportPdf = useCallback(async () => {
    if (!contentRef.current || !activeFile) return

    // Clone content and force light-mode styles for PDF
    const clone = contentRef.current.cloneNode(true) as HTMLElement
    clone.style.cssText = `
      --bg-primary: #ffffff;
      --bg-secondary: #f7f7f5;
      --text-primary: #2b2b2b;
      --text-secondary: #6b6b68;
      --border-color: #e0e0dc;
      --accent: #2383e2;
      --code-bg: #f7f6f3;
      color: #2b2b2b;
      font-size: 13px;
      line-height: 1.7;
      padding: 0;
    `
    // Force color on all child elements to override dark mode inherited styles
    // and apply page-break rules to avoid splitting content across pages
    clone.querySelectorAll('*').forEach((el) => {
      const htmlEl = el as HTMLElement
      const computed = window.getComputedStyle(el)
      const color = computed.color
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (match) {
        const brightness = (parseInt(match[1]) + parseInt(match[2]) + parseInt(match[3])) / 3
        if (brightness > 150) {
          htmlEl.style.color = '#2b2b2b'
        }
      }
    })

    // Prevent page breaks from splitting paragraphs, headings, code blocks, etc.
    clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, pre, blockquote, li, tr, img').forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.breakInside = 'avoid'
      htmlEl.style.pageBreakInside = 'avoid'
    })
    // Keep headings together with the content that follows them
    clone.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.breakAfter = 'avoid'
      htmlEl.style.pageBreakAfter = 'avoid'
    })

    const wrapper = document.createElement('div')
    wrapper.style.cssText = 'position: absolute; left: -9999px; top: 0; background: #ffffff;'
    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)

    const html2pdf = (await import('html2pdf.js')).default
    await html2pdf()
      .set({
        margin: [20, 22, 20, 22],
        filename: activeFile.name.replace(/\.md$/, '.pdf'),
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css'] },
      })
      .from(clone)
      .save()

    document.body.removeChild(wrapper)
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
