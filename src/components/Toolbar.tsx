import { PanelLeftClose, PanelLeftOpen, Pencil, Eye, Download, Save } from 'lucide-react'
import { useFiles } from '../context/FileContext'
import Tooltip from './Tooltip'

export default function Toolbar() {
  const { files, activeFileId, mode, setMode, sidebarOpen, toggleSidebar, saveFile } = useFiles()
  const activeFile = activeFileId ? files.get(activeFileId) : null

  if (!activeFile) return null

  const handleExportPdf = () => {
    window.dispatchEvent(new CustomEvent('md-reader:export-pdf'))
  }

  return (
    <div
      className="flex items-center justify-between shrink-0 sticky top-0 z-10"
      style={{
        height: '52px',
        padding: '0 24px',
        background: 'var(--toolbar-bg)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div className="flex items-center min-w-0" style={{ gap: '14px' }}>
        <Tooltip label={sidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'} shortcut="⌘B">
          <button
            onClick={toggleSidebar}
            className="rounded-md transition-colors cursor-pointer shrink-0"
            style={{ color: 'var(--text-secondary)', padding: '6px' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </Tooltip>
        <span
          className="text-sm font-medium truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {activeFile.name}
        </span>
        {activeFile.dirty && (
          <Tooltip label="Alterações não salvas">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: 'var(--accent)', display: 'inline-block' }}
            />
          </Tooltip>
        )}
      </div>

      <div className="flex items-center" style={{ gap: '10px' }}>
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border-color)' }}
        >
          <Tooltip label="Modo visualização">
            <button
              onClick={() => setMode('view')}
              className="flex items-center text-xs font-medium transition-colors cursor-pointer"
              style={{
                padding: '6px 14px',
                gap: '6px',
                background: mode === 'view' ? 'var(--hover-bg)' : 'transparent',
                color: mode === 'view' ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              <Eye size={14} />
              Visualizar
            </button>
          </Tooltip>
          <Tooltip label="Modo edição">
            <button
              onClick={() => setMode('edit')}
              className="flex items-center text-xs font-medium transition-colors cursor-pointer"
              style={{
                padding: '6px 14px',
                gap: '6px',
                background: mode === 'edit' ? 'var(--hover-bg)' : 'transparent',
                color: mode === 'edit' ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderLeft: '1px solid var(--border-color)',
              }}
            >
              <Pencil size={14} />
              Editar
            </button>
          </Tooltip>
        </div>

        {mode === 'edit' && activeFile.dirty && (
          <Tooltip label="Salvar arquivo" shortcut="⌘S">
            <button
              onClick={() => saveFile(activeFile.id)}
              className="flex items-center text-xs font-medium rounded-lg transition-colors cursor-pointer"
              style={{ color: 'var(--accent)', padding: '6px 14px', gap: '6px' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Save size={14} />
              Salvar
            </button>
          </Tooltip>
        )}

        {mode === 'view' && (
          <Tooltip label="Exportar como PDF" shortcut="⌘P">
            <button
              onClick={handleExportPdf}
              className="flex items-center text-xs font-medium rounded-lg transition-colors cursor-pointer"
              style={{ color: 'var(--text-secondary)', padding: '6px 14px', gap: '6px' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <Download size={14} />
              PDF
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  )
}
