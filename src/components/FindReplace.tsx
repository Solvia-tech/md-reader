import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { X, ChevronUp, ChevronDown, Replace, ReplaceAll } from 'lucide-react'
import { useFiles } from '../context/FileContext'

interface Props {
  onClose: () => void
}

export default function FindReplace({ onClose }: Props) {
  const { files, activeFileId, updateFileContent } = useFiles()
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const findRef = useRef<HTMLInputElement>(null)

  const activeFile = activeFileId ? files.get(activeFileId) : null
  const content = activeFile?.content ?? ''

  useEffect(() => {
    findRef.current?.focus()
    findRef.current?.select()
  }, [])

  const matches = useMemo(() => {
    if (!findText) return []
    const results: { start: number; end: number }[] = []
    const searchContent = caseSensitive ? content : content.toLowerCase()
    const searchTerm = caseSensitive ? findText : findText.toLowerCase()
    let idx = 0
    while ((idx = searchContent.indexOf(searchTerm, idx)) !== -1) {
      results.push({ start: idx, end: idx + searchTerm.length })
      idx += searchTerm.length
    }
    return results
  }, [content, findText, caseSensitive])

  useEffect(() => {
    if (matches.length > 0 && currentIndex >= matches.length) {
      setCurrentIndex(0)
    }
  }, [matches, currentIndex])

  const goNext = useCallback(() => {
    if (matches.length === 0) return
    setCurrentIndex(prev => (prev + 1) % matches.length)
  }, [matches.length])

  const goPrev = useCallback(() => {
    if (matches.length === 0) return
    setCurrentIndex(prev => (prev - 1 + matches.length) % matches.length)
  }, [matches.length])

  const replaceCurrent = useCallback(() => {
    if (!activeFileId || matches.length === 0) return
    const match = matches[currentIndex]
    if (!match) return
    const newContent = content.slice(0, match.start) + replaceText + content.slice(match.end)
    updateFileContent(activeFileId, newContent)
  }, [activeFileId, content, matches, currentIndex, replaceText, updateFileContent])

  const replaceAll = useCallback(() => {
    if (!activeFileId || matches.length === 0) return
    let newContent: string
    if (caseSensitive) {
      newContent = content.split(findText).join(replaceText)
    } else {
      newContent = content.replace(new RegExp(escapeRegex(findText), 'gi'), replaceText)
    }
    updateFileContent(activeFileId, newContent)
  }, [activeFileId, content, findText, replaceText, caseSensitive, matches.length, updateFileContent])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      goNext()
    }
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      goPrev()
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: '12px',
        right: '24px',
        zIndex: 20,
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        width: '380px',
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Find row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: 'var(--hover-bg)',
            borderRadius: '6px',
            padding: '6px 10px',
            gap: '8px',
          }}
        >
          <input
            ref={findRef}
            type="text"
            placeholder="Localizar..."
            value={findText}
            onChange={e => { setFindText(e.target.value); setCurrentIndex(0) }}
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: 'var(--text-primary)', minWidth: 0 }}
          />
          <button
            onClick={() => setCaseSensitive(!caseSensitive)}
            title="Diferenciar maiúsculas/minúsculas"
            className="cursor-pointer shrink-0"
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 5px',
              borderRadius: '3px',
              color: caseSensitive ? 'var(--accent)' : 'var(--text-secondary)',
              background: caseSensitive ? 'var(--hover-bg)' : 'transparent',
              border: caseSensitive ? '1px solid var(--accent)' : '1px solid transparent',
            }}
          >
            Aa
          </button>
        </div>

        <span
          className="text-xs shrink-0"
          style={{ color: 'var(--text-secondary)', minWidth: '48px', textAlign: 'center' }}
        >
          {findText ? `${matches.length > 0 ? currentIndex + 1 : 0}/${matches.length}` : ''}
        </span>

        <button
          onClick={goPrev}
          className="cursor-pointer shrink-0 rounded transition-colors"
          style={{ color: 'var(--text-secondary)', padding: '4px' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-bg)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title="Anterior (Shift+Enter)"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={goNext}
          className="cursor-pointer shrink-0 rounded transition-colors"
          style={{ color: 'var(--text-secondary)', padding: '4px' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-bg)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title="Próximo (Enter)"
        >
          <ChevronDown size={16} />
        </button>
        <button
          onClick={onClose}
          className="cursor-pointer shrink-0 rounded transition-colors"
          style={{ color: 'var(--text-secondary)', padding: '4px' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-bg)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title="Fechar (Esc)"
        >
          <X size={16} />
        </button>
      </div>

      {/* Replace row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: 'var(--hover-bg)',
            borderRadius: '6px',
            padding: '6px 10px',
          }}
        >
          <input
            type="text"
            placeholder="Substituir por..."
            value={replaceText}
            onChange={e => setReplaceText(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none"
            style={{ color: 'var(--text-primary)', minWidth: 0 }}
          />
        </div>

        <button
          onClick={replaceCurrent}
          disabled={matches.length === 0}
          className="cursor-pointer shrink-0 rounded transition-colors"
          style={{
            color: matches.length > 0 ? 'var(--accent)' : 'var(--text-secondary)',
            padding: '4px 8px',
            opacity: matches.length === 0 ? 0.4 : 1,
            fontSize: '12px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onMouseEnter={e => { if (matches.length > 0) e.currentTarget.style.background = 'var(--hover-bg)' }}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title="Substituir"
        >
          <Replace size={14} />
          1
        </button>
        <button
          onClick={replaceAll}
          disabled={matches.length === 0}
          className="cursor-pointer shrink-0 rounded transition-colors"
          style={{
            color: matches.length > 0 ? 'var(--accent)' : 'var(--text-secondary)',
            padding: '4px 8px',
            opacity: matches.length === 0 ? 0.4 : 1,
            fontSize: '12px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          onMouseEnter={e => { if (matches.length > 0) e.currentTarget.style.background = 'var(--hover-bg)' }}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          title="Substituir todos"
        >
          <ReplaceAll size={14} />
          {matches.length}
        </button>
      </div>

      {/* Status */}
      {findText && matches.length === 0 && (
        <p className="text-xs" style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
          Nenhum resultado encontrado.
        </p>
      )}
      {findText && matches.length > 0 && (
        <p className="text-xs" style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
          {matches.length} {matches.length === 1 ? 'ocorrência encontrada' : 'ocorrências encontradas'}
        </p>
      )}
    </div>
  )
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
