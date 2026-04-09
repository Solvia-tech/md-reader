import { useFiles } from '../context/FileContext'

export default function Editor() {
  const { files, activeFileId, updateFileContent } = useFiles()
  const activeFile = activeFileId ? files.get(activeFileId) : null

  if (!activeFile) return null

  return (
    <div className="h-full overflow-hidden">
      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        height: '100%',
        padding: '80px 48px 40px 48px',
      }}>
        <textarea
          value={activeFile.content}
          onChange={e => updateFileContent(activeFile.id, e.target.value)}
          className="w-full h-full resize-none outline-none"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            lineHeight: '1.7',
            color: 'var(--text-primary)',
            background: 'transparent',
            tabSize: 2,
          }}
          spellCheck={false}
        />
      </div>
    </div>
  )
}
