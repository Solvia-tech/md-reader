import { useCallback } from 'react'

export function usePdfExport() {
  const exportPdf = useCallback(async (element: HTMLElement, filename: string) => {
    const html2pdf = (await import('html2pdf.js')).default
    html2pdf()
      .set({
        margin: [15, 15, 15, 15],
        filename: filename.replace(/\.md$/, '.pdf'),
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(element)
      .save()
  }, [])

  return { exportPdf }
}
