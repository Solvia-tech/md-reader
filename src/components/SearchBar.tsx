import { useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useFiles } from '../context/FileContext'

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useFiles()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handler = () => inputRef.current?.focus()
    window.addEventListener('md-reader:focus-search', handler)
    return () => window.removeEventListener('md-reader:focus-search', handler)
  }, [])

  return (
    <div style={{ padding: '0 20px', marginBottom: '12px' }}>
      <div
        className="flex items-center rounded-lg"
        style={{ background: 'var(--hover-bg)', padding: '8px 12px', gap: '10px' }}
      >
        <Search size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 text-sm bg-transparent outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
