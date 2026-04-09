import { useState, useCallback, useEffect, useRef } from 'react'
import { FileProvider } from './context/FileContext'
import Layout from './components/Layout'
import DropOverlay from './components/DropOverlay'
import { readDroppedItems } from './lib/fileHelpers'
import { useFiles } from './context/FileContext'
import { useFileSystem } from './hooks/useFileSystem'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'

function AppInner() {
  const { addFiles, files, activeFileId } = useFiles()
  const { openFolder } = useFileSystem()
  const [isDragging, setIsDragging] = useState(false)
  const dragCounter = useRef(0)

  useKeyboardShortcuts(openFolder)

  // Dynamic page title
  useEffect(() => {
    const activeFile = activeFileId ? files.get(activeFileId) : null
    document.title = activeFile ? `${activeFile.name} — md-reader` : 'md-reader'
  }, [files, activeFileId])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = 0
    setIsDragging(false)

    const entries = await readDroppedItems(e.dataTransfer)
    if (entries.length > 0) {
      addFiles(entries)
    }
  }, [addFiles])

  return (
    <div
      className="h-full w-full relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Layout />
      {isDragging && <DropOverlay />}
    </div>
  )
}

export default function App() {
  return (
    <FileProvider>
      <AppInner />
    </FileProvider>
  )
}
