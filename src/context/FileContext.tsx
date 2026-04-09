import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { FileEntry, ViewMode } from '../types'

interface FileContextType {
  files: Map<string, FileEntry>
  activeFileId: string | null
  mode: ViewMode
  sidebarOpen: boolean
  searchQuery: string
  setActiveFile: (id: string) => void
  setMode: (mode: ViewMode) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  updateFileContent: (id: string, content: string) => void
  addFiles: (entries: FileEntry[]) => void
  saveFile: (id: string) => Promise<void>
}

const FileContext = createContext<FileContextType | null>(null)

export function FileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<Map<string, FileEntry>>(new Map())
  const [activeFileId, setActiveFileId] = useState<string | null>(null)
  const [mode, setMode] = useState<ViewMode>('view')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const setActiveFile = useCallback((id: string) => {
    setActiveFileId(id)
    setMode('view')
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const updateFileContent = useCallback((id: string, content: string) => {
    setFiles(prev => {
      const next = new Map(prev)
      const file = next.get(id)
      if (file) {
        next.set(id, { ...file, content, dirty: true })
      }
      return next
    })
  }, [])

  const addFiles = useCallback((entries: FileEntry[]) => {
    setFiles(prev => {
      const next = new Map(prev)
      for (const entry of entries) {
        next.set(entry.id, entry)
      }
      return next
    })
    if (entries.length > 0) {
      setActiveFileId(prev => prev ?? entries[0].id)
    }
  }, [])

  const saveFile = useCallback(async (id: string) => {
    const file = files.get(id)
    if (!file) return

    if (file.handle) {
      try {
        const writable = await file.handle.createWritable()
        await writable.write(file.content)
        await writable.close()
        setFiles(prev => {
          const next = new Map(prev)
          next.set(id, { ...file, dirty: false })
          return next
        })
      } catch (err) {
        console.error('Failed to save file:', err)
      }
    } else {
      const blob = new Blob([file.content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      URL.revokeObjectURL(url)
      setFiles(prev => {
        const next = new Map(prev)
        next.set(id, { ...file, dirty: false })
        return next
      })
    }
  }, [files])

  return (
    <FileContext.Provider
      value={{
        files,
        activeFileId,
        mode,
        sidebarOpen,
        searchQuery,
        setActiveFile,
        setMode,
        toggleSidebar,
        setSidebarOpen,
        setSearchQuery,
        updateFileContent,
        addFiles,
        saveFile,
      }}
    >
      {children}
    </FileContext.Provider>
  )
}

export function useFiles() {
  const ctx = useContext(FileContext)
  if (!ctx) throw new Error('useFiles must be used within FileProvider')
  return ctx
}
