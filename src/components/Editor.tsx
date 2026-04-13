import { useEffect, useMemo, useRef } from 'react'
import { useFiles } from '../context/FileContext'

interface Props {
  findText?: string
  currentMatchIndex?: number
  caseSensitive?: boolean
}

export default function Editor({ findText = '', currentMatchIndex = 0, caseSensitive = false }: Props) {
  const { files, activeFileId, updateFileContent } = useFiles()
  const activeFile = activeFileId ? files.get(activeFileId) : null
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const content = activeFile?.content ?? ''

  const matches = useMemo(() => {
    if (!findText) return []
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

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta || matches.length === 0) return
    const safe = ((currentMatchIndex % matches.length) + matches.length) % matches.length
    const match = matches[safe]
    if (!match) return
    ta.focus({ preventScroll: true })
    ta.setSelectionRange(match.start, match.end)
    // Scroll selection into view by approximating line position
    const before = content.slice(0, match.start)
    const linesBefore = before.split('\n').length - 1
    const lineHeight = parseFloat(window.getComputedStyle(ta).lineHeight) || 24
    const target = linesBefore * lineHeight - ta.clientHeight / 2
    ta.scrollTop = Math.max(0, target)
  }, [matches, currentMatchIndex, content])

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
          ref={textareaRef}
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
