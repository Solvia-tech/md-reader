import { useState, useEffect, useCallback } from 'react'
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

  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [viewerMatchCount, setViewerMatchCount] = useState(0)

  const hasFiles = files.size > 0
  const activeFile = activeFileId ? files.get(activeFileId) : null
  const content = activeFile?.content ?? ''

  // In edit mode, count matches from raw content. In view mode, rely on Viewer's reported count.
  const editorMatchCount = (() => {
    if (!findText) return 0
    const haystack = caseSensitive ? content : content.toLowerCase()
    const needle = caseSensitive ? findText : findText.toLowerCase()
    if (!needle) return 0
    let count = 0
    let idx = 0
    while ((idx = haystack.indexOf(needle, idx)) !== -1) {
      count++
      idx += needle.length
    }
    return count
  })()

  const matchCount = mode === 'edit' ? editorMatchCount : viewerMatchCount

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

  useEffect(() => {
    if (matchCount > 0 && currentIndex >= matchCount) {
      setCurrentIndex(0)
    }
  }, [matchCount, currentIndex])

  const handleMatchCount = useCallback((n: number) => setViewerMatchCount(n), [])

  // Clear highlight state when search box closes
  const handleClose = useCallback(() => {
    setFindReplaceOpen(false)
    setFindText('')
    setReplaceText('')
    setCurrentIndex(0)
  }, [])

  if (!hasFiles) {
    return <EmptyState onOpenFolder={openFolder} onSelectFiles={selectFiles} />
  }

  const effectiveFindText = findReplaceOpen ? findText : ''

  return (
    <div className="h-full flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <Toolbar />
        <div className="flex-1 min-h-0 relative">
          {findReplaceOpen && activeFile && (
            <FindReplace
              onClose={handleClose}
              findText={findText}
              setFindText={setFindText}
              replaceText={replaceText}
              setReplaceText={setReplaceText}
              caseSensitive={caseSensitive}
              setCaseSensitive={setCaseSensitive}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              matchCount={matchCount}
            />
          )}
          {activeFile && mode === 'view' && (
            <Viewer
              findText={effectiveFindText}
              currentMatchIndex={currentIndex}
              caseSensitive={caseSensitive}
              onMatchCountChange={handleMatchCount}
            />
          )}
          {activeFile && mode === 'edit' && (
            <Editor
              findText={effectiveFindText}
              currentMatchIndex={currentIndex}
              caseSensitive={caseSensitive}
            />
          )}
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
