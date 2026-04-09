import { useMemo } from 'react'
import { useFiles } from '../context/FileContext'
import FileListItem from './FileListItem'

export default function FileList() {
  const { files, activeFileId, setActiveFile, searchQuery } = useFiles()

  const filteredFiles = useMemo(() => {
    const all = Array.from(files.values())
    if (!searchQuery.trim()) return all

    const query = searchQuery.toLowerCase()
    return all.filter(
      f =>
        f.name.toLowerCase().includes(query) ||
        f.content.toLowerCase().includes(query)
    )
  }, [files, searchQuery])

  if (filteredFiles.length === 0) {
    return (
      <div style={{ padding: '24px 20px' }}>
        <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
          {searchQuery ? 'Nenhum arquivo encontrado.' : 'Nenhum arquivo carregado.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '0 12px' }}>
      {filteredFiles.map(file => (
        <FileListItem
          key={file.id}
          file={file}
          isActive={file.id === activeFileId}
          onClick={() => setActiveFile(file.id)}
        />
      ))}
    </div>
  )
}
