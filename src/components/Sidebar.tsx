import { FolderOpen } from 'lucide-react'
import { useFiles } from '../context/FileContext'
import { useFileSystem } from '../hooks/useFileSystem'
import SearchBar from './SearchBar'
import FileList from './FileList'

export default function Sidebar() {
  const { sidebarOpen } = useFiles()
  const { openFolder } = useFileSystem()

  return (
    <div
      className="h-full flex flex-col overflow-hidden shrink-0"
      style={{
        width: sidebarOpen ? 280 : 0,
        minWidth: sidebarOpen ? 280 : 0,
        transition: 'width 200ms ease, min-width 200ms ease',
        borderRight: sidebarOpen ? '1px solid var(--border-color)' : 'none',
        background: 'var(--bg-sidebar)',
      }}
    >
      {sidebarOpen && (
        <>
          <div style={{ padding: '24px 24px 16px 24px' }}>
            <h2
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}
            >
              Arquivos
            </h2>
          </div>

          <SearchBar />
          <FileList />

          <div style={{ padding: '16px 24px 24px 24px', borderTop: '1px solid var(--border-color)' }}>
            <button
              onClick={openFolder}
              className="w-full flex items-center justify-center gap-2.5 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              style={{
                color: 'var(--text-secondary)',
                background: 'transparent',
                padding: '10px 16px',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-bg)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <FolderOpen size={14} />
              Abrir Pasta
            </button>
          </div>
        </>
      )}
    </div>
  )
}
