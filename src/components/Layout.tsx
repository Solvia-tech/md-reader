import { useState, useEffect } from 'react'
import { useFiles } from '../context/FileContext'
import { useFileSystem } from '../hooks/useFileSystem'
import Sidebar from './Sidebar'
import Toolbar from './Toolbar'
import Viewer from './Viewer'
import Editor from './Editor'
import EmptyState from './EmptyState'
import FindReplace from './FindReplace'

export default function Layout() {
  const { files, activeFileId, mode } = useFiles()
  const { openFolder, selectFiles } = useFileSystem()
  const [findReplaceOpen, setFindReplaceOpen] = useState(false)

  const hasFiles = files.size > 0
  const activeFile = activeFileId ? files.get(activeFileId) : null

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key === 'h') {
        e.preventDefault()
        setFindReplaceOpen(prev => !prev)
      }
      if (mod && e.key === 'f') {
        e.preventDefault()
        setFindReplaceOpen(true)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!activeFileId) setFindReplaceOpen(false)
  }, [activeFileId])

  if (!hasFiles) {
    return <EmptyState onOpenFolder={openFolder} onSelectFiles={selectFiles} />
  }

  return (
    <div className="h-full flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Toolbar />
        <div className="flex-1 min-h-0 relative">
          {findReplaceOpen && activeFile && (
            <FindReplace onClose={() => setFindReplaceOpen(false)} />
          )}
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
