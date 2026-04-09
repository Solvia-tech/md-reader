import { useCallback, useRef } from 'react'
import { useFiles } from '../context/FileContext'
import { readDirectoryHandle, readFileList } from '../lib/fileHelpers'

export function useFileSystem() {
  const { addFiles } = useFiles()
  const inputRef = useRef<HTMLInputElement | null>(null)

  const supportsDirectoryPicker = typeof window !== 'undefined' && 'showDirectoryPicker' in window

  const openFolder = useCallback(async () => {
    if (supportsDirectoryPicker) {
      try {
        const dirHandle = await (window as any).showDirectoryPicker()
        const entries = await readDirectoryHandle(dirHandle)
        addFiles(entries)
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to open folder:', err)
        }
      }
    } else {
      if (!inputRef.current) {
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = true
        input.setAttribute('webkitdirectory', '')
        input.accept = '.md,.markdown'
        input.style.display = 'none'
        input.addEventListener('change', async () => {
          if (input.files) {
            const entries = await readFileList(input.files)
            addFiles(entries)
          }
        })
        document.body.appendChild(input)
        inputRef.current = input
      }
      inputRef.current.click()
    }
  }, [supportsDirectoryPicker, addFiles])

  const selectFiles = useCallback(async () => {
    if (typeof window !== 'undefined' && 'showOpenFilePicker' in window) {
      try {
        const handles = await (window as any).showOpenFilePicker({
          multiple: true,
          types: [
            {
              description: 'Markdown files',
              accept: { 'text/markdown': ['.md', '.markdown'] },
            },
          ],
        })
        const entries = await Promise.all(
          handles.map(async (handle: FileSystemFileHandle) => {
            const file = await handle.getFile()
            const content = await file.text()
            return {
              id: `${handle.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              name: handle.name,
              content,
              lastModified: file.lastModified,
              handle,
              dirty: false,
            }
          })
        )
        addFiles(entries)
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Failed to select files:', err)
        }
      }
    } else {
      const input = document.createElement('input')
      input.type = 'file'
      input.multiple = true
      input.accept = '.md,.markdown'
      input.style.display = 'none'
      input.addEventListener('change', async () => {
        if (input.files) {
          const entries = await readFileList(input.files)
          addFiles(entries)
        }
        input.remove()
      })
      document.body.appendChild(input)
      input.click()
    }
  }, [addFiles])

  return { openFolder, selectFiles }
}
