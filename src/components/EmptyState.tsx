import { FileText, FolderOpen, Upload } from 'lucide-react'

interface Props {
  onOpenFolder: () => void
  onSelectFiles: () => void
}

export default function EmptyState({ onOpenFolder, onSelectFiles }: Props) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6">
      <div className="flex flex-col items-center max-w-md text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--bg-secondary)', marginBottom: '32px' }}
        >
          <FileText size={36} style={{ color: 'var(--text-secondary)' }} />
        </div>

        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '12px' }}
        >
          md-reader
        </h1>

        <p
          className="text-base"
          style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '40px' }}
        >
          Visualize seus arquivos Markdown de forma bonita.
          <br />
          Arraste arquivos ou abra uma pasta para começar.
        </p>

        <div className="flex" style={{ gap: '16px' }}>
          <button
            onClick={onOpenFolder}
            className="flex items-center text-sm font-medium text-white rounded-lg transition-colors cursor-pointer"
            style={{ background: 'var(--accent)', padding: '12px 24px', gap: '10px' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            <FolderOpen size={16} />
            Abrir Pasta
          </button>

          <button
            onClick={onSelectFiles}
            className="flex items-center text-sm font-medium rounded-lg transition-colors cursor-pointer"
            style={{
              color: 'var(--text-primary)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              padding: '12px 24px',
              gap: '10px',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
          >
            <Upload size={16} />
            Selecionar Arquivos
          </button>
        </div>

        <div
          className="flex items-center gap-2 text-xs"
          style={{ color: 'var(--text-secondary)', marginTop: '48px' }}
        >
          <FileText size={12} />
          Suporta arquivos .md (Markdown)
        </div>
      </div>
    </div>
  )
}
