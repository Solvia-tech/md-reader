export interface FileEntry {
  id: string
  name: string
  content: string
  lastModified: number
  handle?: FileSystemFileHandle
  dirty: boolean
}

export type ViewMode = 'view' | 'edit'

export interface SearchResult {
  fileId: string
  fileName: string
  matchCount: number
}
