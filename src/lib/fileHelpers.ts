import type { FileEntry } from '../types'

export function generateId(name: string): string {
  return `${name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function isMarkdownFile(name: string): boolean {
  return name.toLowerCase().endsWith('.md') || name.toLowerCase().endsWith('.markdown')
}

export async function readDirectoryHandle(
  dirHandle: FileSystemDirectoryHandle
): Promise<FileEntry[]> {
  const entries: FileEntry[] = []

  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file' && isMarkdownFile(entry.name)) {
      const fileHandle = entry as FileSystemFileHandle
      const file = await fileHandle.getFile()
      const content = await file.text()
      entries.push({
        id: generateId(entry.name),
        name: entry.name,
        content,
        lastModified: file.lastModified,
        handle: fileHandle,
        dirty: false,
      })
    } else if (entry.kind === 'directory') {
      const subEntries = await readDirectoryHandle(entry as FileSystemDirectoryHandle)
      entries.push(...subEntries.map(e => ({
        ...e,
        name: `${entry.name}/${e.name}`,
      })))
    }
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

export async function readFileList(fileList: FileList): Promise<FileEntry[]> {
  const entries: FileEntry[] = []

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i]
    if (isMarkdownFile(file.name)) {
      const content = await file.text()
      entries.push({
        id: generateId(file.name),
        name: file.webkitRelativePath || file.name,
        content,
        lastModified: file.lastModified,
        dirty: false,
      })
    }
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name))
}

export async function readDroppedItems(
  dataTransfer: DataTransfer
): Promise<FileEntry[]> {
  const entries: FileEntry[] = []

  if (dataTransfer.items) {
    for (let i = 0; i < dataTransfer.items.length; i++) {
      const item = dataTransfer.items[i]
      const handle = 'getAsFileSystemHandle' in item
        ? await (item as any).getAsFileSystemHandle()
        : null

      if (handle) {
        if (handle.kind === 'directory') {
          const subEntries = await readDirectoryHandle(handle as FileSystemDirectoryHandle)
          entries.push(...subEntries)
        } else if (handle.kind === 'file' && isMarkdownFile(handle.name)) {
          const fileHandle = handle as FileSystemFileHandle
          const file = await fileHandle.getFile()
          const content = await file.text()
          entries.push({
            id: generateId(handle.name),
            name: handle.name,
            content,
            lastModified: file.lastModified,
            handle: fileHandle,
            dirty: false,
          })
        }
      } else {
        const file = item.getAsFile()
        if (file && isMarkdownFile(file.name)) {
          const content = await file.text()
          entries.push({
            id: generateId(file.name),
            name: file.name,
            content,
            lastModified: file.lastModified,
            dirty: false,
          })
        }
      }
    }
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name))
}
