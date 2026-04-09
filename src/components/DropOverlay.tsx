import { FileText } from 'lucide-react'

export default function DropOverlay() {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ background: 'var(--drop-overlay)', backdropFilter: 'blur(4px)' }}
    >
      <div className="flex flex-col items-center" style={{ gap: '16px' }}>
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--hover-bg)' }}
        >
          <FileText size={32} style={{ color: 'var(--accent)' }} />
        </div>
        <p className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
          Solte os arquivos .md aqui
        </p>
      </div>
    </div>
  )
}
