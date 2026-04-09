import { FileText } from 'lucide-react'
import type { FileEntry } from '../types'

interface Props {
  file: FileEntry
  isActive: boolean
  onClick: () => void
}

export default function FileListItem({ file, isActive, onClick }: Props) {
  const displayName = file.name.includes('/')
    ? file.name.split('/').pop()!
    : file.name

  const folder = file.name.includes('/')
    ? file.name.split('/').slice(0, -1).join('/')
    : null

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center text-left rounded-lg transition-colors cursor-pointer"
      style={{
        padding: '10px 14px',
        gap: '12px',
        background: isActive ? 'var(--active-bg)' : 'transparent',
        marginBottom: '2px',
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.background = 'var(--hover-light)'
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.background = 'transparent'
      }}
    >
      <FileText
        size={15}
        style={{ color: 'var(--text-secondary)', flexShrink: 0 }}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className="text-sm truncate"
            style={{
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: isActive ? 500 : 400,
            }}
          >
            {displayName}
          </span>
          {file.dirty && (
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: 'var(--accent)' }}
            />
          )}
        </div>
        {folder && (
          <span
            className="text-xs truncate block"
            style={{ color: 'var(--text-secondary)', opacity: 0.7, marginTop: '2px' }}
          >
            {folder}
          </span>
        )}
      </div>
    </button>
  )
}
