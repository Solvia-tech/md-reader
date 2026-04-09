import { useFiles } from '../context/FileContext'
import { useFileSystem } from '../hooks/useFileSystem'
import Sidebar from './Sidebar'
import Toolbar from './Toolbar'
import Viewer from './Viewer'
import Editor from './Editor'
import EmptyState from './EmptyState'

export default function Layout() {
  const { files, activeFileId, mode } = useFiles()
  const { openFolder, selectFiles } = useFileSystem()

  const hasFiles = files.size > 0
  const activeFile = activeFileId ? files.get(activeFileId) : null

  if (!hasFiles) {
    return <EmptyState onOpenFolder={openFolder} onSelectFiles={selectFiles} />
  }

  return (
    <div className="h-full flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Toolbar />
        <div className="flex-1 min-h-0">
          {activeFile && mode === 'view' && <Viewer />}
          {activeFile && mode === 'edit' && <Editor />}
          {!activeFile && (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Selecione um arquivo na sidebar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
