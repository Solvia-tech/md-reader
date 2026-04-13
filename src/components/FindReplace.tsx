import { useEffect, useRef, useCallback } from 'react'
import { X, ChevronUp, ChevronDown, Replace, ReplaceAll } from 'lucide-react'
import { useFiles } from '../context/FileContext'
import Tooltip from './Tooltip'

interface Props {
  onClose: () => void
  findText: string
  setFindText: (v: string) => void
  replaceText: string
  setReplaceText: (v: string) => void
  caseSensitive: boolean
  setCaseSensitive: (v: boolean) => void
  currentIndex: number
  setCurrentIndex: (v: number | ((prev: number) => number)) => void
  matchCount: number
}

export default function FindReplace({
  onClose,
  findText,
  setFindText,
  replaceText,
  setReplaceText,
  caseSensitive,
  setCaseSensitive,
  currentIndex,
  setCurrentIndex,
  matchCount,
}: Props) {
  const { files, activeFileId, updateFileContent } = useFiles()
  const findRef = useRef<HTMLInputElement>(null)

  const activeFile = activeFileId ? files.get(activeFileId) : null
  const content = activeFile?.content ?? ''

  useEffect(() => {
    findRef.current?.focus()
    findRef.current?.select()
  }, [])

  const goNext = useCallback(() => {
    if (matchCount === 0) return
    setCurrentIndex(prev => (prev + 1) % matchCount)
  }, [matchCount, setCurrentIndex])

  const goPrev = useCallback(() => {
    if (matchCount === 0) return
    setCurrentIndex(prev => (prev - 1 + matchCount) % matchCount)
  }, [matchCount, setCurrentIndex])

  const computeRawMatches = useCallback(() => {
    if (!findText) return [] as { start: number; end: number }[]
    const results: { start: number; end: number }[] = []
    const haystack = caseSensitive ? content : content.toLowerCase()
    const needle = caseSensitive ? findText : findText.toLowerCase()
    let idx = 0
    while ((idx = haystack.indexOf(needle, idx)) !== -1) {
      results.push({ start: idx, end: idx + needle.length })
      idx += needle.length
    }
    return results
  }, [content, findText, caseSensitive])

  const replaceCurrent = useCallback(() => {
    if (!activeFileId) return
    const rawMatches = computeRawMatches()
    if (rawMatches.length === 0) return
    const safeIndex = ((currentIndex % rawMatches.length) + rawMatches.length) % rawMatches.length
    const match = rawMatches[safeIndex]
    if (!match) return
    const newContent = content.slice(0, match.start) + replaceText + content.slice(match.end)
    updateFileContent(activeFileId, newContent)
  }, [activeFileId, content, currentIndex, replaceText, computeRawMatches, updateFileContent])

  const replaceAll = useCallback(() => {
    if (!activeFileId || !findText) return
    let newContent: string
    if (caseSensitive) {
      newContent = content.split(findText).join(replaceText)
    } else {
      newContent = content.replace(new RegExp(escapeRegex(findText), 'gi'), replaceText)
    }
    updateFileContent(activeFileId, newContent)
  }, [activeFileId, content, findText, replaceText, caseSensitive, updateFileContent])

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
          <Tooltip label="Diferenciar maiúsculas/minúsculas">
            <button
              onClick={() => setCaseSensitive(!caseSensitive)}
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
          </Tooltip>
        </div>

        <span
          className="text-xs shrink-0"
          style={{ color: 'var(--text-secondary)', minWidth: '48px', textAlign: 'center' }}
        >
          {findText ? `${matchCount > 0 ? currentIndex + 1 : 0}/${matchCount}` : ''}
        </span>

        <Tooltip label="Resultado anterior" shortcut="⇧↵">
          <button
            onClick={goPrev}
            className="cursor-pointer shrink-0 rounded transition-colors"
            style={{ color: 'var(--text-secondary)', padding: '4px' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronUp size={16} />
          </button>
        </Tooltip>
        <Tooltip label="Próximo resultado" shortcut="↵">
          <button
            onClick={goNext}
            className="cursor-pointer shrink-0 rounded transition-colors"
            style={{ color: 'var(--text-secondary)', padding: '4px' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronDown size={16} />
          </button>
        </Tooltip>
        <Tooltip label="Fechar busca" shortcut="Esc">
          <button
            onClick={onClose}
            className="cursor-pointer shrink-0 rounded transition-colors"
            style={{ color: 'var(--text-secondary)', padding: '4px' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover-bg)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <X size={16} />
          </button>
        </Tooltip>
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

        <Tooltip label="Substituir ocorrência atual">
          <button
            onClick={replaceCurrent}
            disabled={matchCount === 0}
            className="cursor-pointer shrink-0 rounded transition-colors"
            style={{
              color: matchCount > 0 ? 'var(--accent)' : 'var(--text-secondary)',
              padding: '4px 8px',
              opacity: matchCount === 0 ? 0.4 : 1,
              fontSize: '12px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={e => { if (matchCount > 0) e.currentTarget.style.background = 'var(--hover-bg)' }}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Replace size={14} />
            1
          </button>
        </Tooltip>
        <Tooltip label="Substituir todas as ocorrências">
          <button
            onClick={replaceAll}
            disabled={matchCount === 0}
            className="cursor-pointer shrink-0 rounded transition-colors"
            style={{
              color: matchCount > 0 ? 'var(--accent)' : 'var(--text-secondary)',
              padding: '4px 8px',
              opacity: matchCount === 0 ? 0.4 : 1,
              fontSize: '12px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onMouseEnter={e => { if (matchCount > 0) e.currentTarget.style.background = 'var(--hover-bg)' }}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <ReplaceAll size={14} />
            {matchCount}
          </button>
        </Tooltip>
      </div>

      {/* Status */}
      {findText && matchCount === 0 && (
        <p className="text-xs" style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
          Nenhum resultado encontrado.
        </p>
      )}
      {findText && matchCount > 0 && (
        <p className="text-xs" style={{ color: 'var(--text-secondary)', marginTop: '10px' }}>
          {matchCount} {matchCount === 1 ? 'ocorrência encontrada' : 'ocorrências encontradas'}
        </p>
      )}
    </div>
  )
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
