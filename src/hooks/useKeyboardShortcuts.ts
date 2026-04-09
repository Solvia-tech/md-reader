import { useEffect } from 'react'
import { useFiles } from '../context/FileContext'

export function useKeyboardShortcuts(openFolder: () => void) {
  const { mode, setMode, activeFileId, saveFile, toggleSidebar, sidebarOpen, setSidebarOpen, setSearchQuery } = useFiles()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey

      if (mod && e.key === 'o') {
        e.preventDefault()
        openFolder()
      }

      if (mod && e.key === 'e') {
        e.preventDefault()
        if (activeFileId) {
          setMode(mode === 'view' ? 'edit' : 'view')
        }
      }

      if (mod && e.key === 's') {
        e.preventDefault()
        if (activeFileId) {
          saveFile(activeFileId)
        }
      }

      if (mod && e.key === 'p') {
        e.preventDefault()
        if (activeFileId && mode === 'view') {
          window.dispatchEvent(new CustomEvent('md-reader:export-pdf'))
        }
      }

      if (mod && e.key === 'k') {
        e.preventDefault()
        if (!sidebarOpen) setSidebarOpen(true)
        window.dispatchEvent(new CustomEvent('md-reader:focus-search'))
      }

      if (mod && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }

      if (e.key === 'Escape') {
        setSearchQuery('')
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [mode, activeFileId, sidebarOpen, setMode, saveFile, toggleSidebar, setSidebarOpen, setSearchQuery, openFolder])
}
