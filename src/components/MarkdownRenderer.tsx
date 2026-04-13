import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

interface Props {
  content: string
  highlightTerm?: string
  currentMatchIndex?: number
  caseSensitive?: boolean
  onMatchCountChange?: (count: number) => void
}

const MarkdownRenderer = forwardRef<HTMLDivElement, Props>(
  ({ content, highlightTerm = '', currentMatchIndex = 0, caseSensitive = false, onMatchCountChange }, ref) => {
    const innerRef = useRef<HTMLDivElement>(null)
    useImperativeHandle(ref, () => innerRef.current as HTMLDivElement, [])

    useEffect(() => {
      const root = innerRef.current
      if (!root) return

      // Clear previous highlights
      root.querySelectorAll('mark.md-search-hit').forEach(mark => {
        const parent = mark.parentNode
        if (!parent) return
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
        parent.removeChild(mark)
        parent.normalize()
      })

      if (!highlightTerm) {
        onMatchCountChange?.(0)
        return
      }

      const term = highlightTerm
      const termLower = term.toLowerCase()
      const termLen = term.length

      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT
          let p = node.parentElement
          while (p && p !== root) {
            if (p.tagName === 'SCRIPT' || p.tagName === 'STYLE') return NodeFilter.FILTER_REJECT
            p = p.parentElement
          }
          return NodeFilter.FILTER_ACCEPT
        },
      })

      const textNodes: Text[] = []
      let n: Node | null
      while ((n = walker.nextNode())) textNodes.push(n as Text)

      const marks: HTMLElement[] = []
      for (const textNode of textNodes) {
        const text = textNode.nodeValue ?? ''
        const haystack = caseSensitive ? text : text.toLowerCase()
        const needle = caseSensitive ? term : termLower
        const positions: number[] = []
        let idx = 0
        while ((idx = haystack.indexOf(needle, idx)) !== -1) {
          positions.push(idx)
          idx += termLen
        }
        if (positions.length === 0) continue

        const frag = document.createDocumentFragment()
        let cursor = 0
        for (const pos of positions) {
          if (pos > cursor) frag.appendChild(document.createTextNode(text.slice(cursor, pos)))
          const mark = document.createElement('mark')
          mark.className = 'md-search-hit'
          mark.textContent = text.slice(pos, pos + termLen)
          frag.appendChild(mark)
          marks.push(mark)
          cursor = pos + termLen
        }
        if (cursor < text.length) frag.appendChild(document.createTextNode(text.slice(cursor)))
        textNode.parentNode?.replaceChild(frag, textNode)
      }

      onMatchCountChange?.(marks.length)

      if (marks.length > 0) {
        const safeIndex = ((currentMatchIndex % marks.length) + marks.length) % marks.length
        const current = marks[safeIndex]
        if (current) {
          current.classList.add('md-search-hit-current')
          current.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }
      }
    }, [content, highlightTerm, currentMatchIndex, caseSensitive, onMatchCountChange])

    return (
      <div ref={innerRef} className="prose prose-lg max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {content}
        </ReactMarkdown>
      </div>
    )
  }
)

MarkdownRenderer.displayName = 'MarkdownRenderer'

export default MarkdownRenderer
