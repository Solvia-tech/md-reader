import { useState, useRef, cloneElement, isValidElement } from 'react'
import type { ReactElement } from 'react'

interface Props {
  label: string
  shortcut?: string
  children: ReactElement
  placement?: 'top' | 'bottom'
  delay?: number
}

export default function Tooltip({ label, shortcut, children, placement = 'bottom', delay = 350 }: Props) {
  const [visible, setVisible] = useState(false)
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null)
  const timer = useRef<number | null>(null)
  const wrapRef = useRef<HTMLSpanElement>(null)

  const show = () => {
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      const el = wrapRef.current?.firstElementChild as HTMLElement | null
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = placement === 'bottom' ? rect.bottom + 8 : rect.top - 8
      setCoords({ x, y })
      setVisible(true)
    }, delay)
  }

  const hide = () => {
    if (timer.current) window.clearTimeout(timer.current)
    setVisible(false)
    setCoords(null)
  }

  if (!isValidElement(children)) return children

  const childProps = (children.props ?? {}) as {
    onMouseEnter?: (e: React.MouseEvent) => void
    onMouseLeave?: (e: React.MouseEvent) => void
    onFocus?: (e: React.FocusEvent) => void
    onBlur?: (e: React.FocusEvent) => void
    title?: string
  }

  const enhanced = cloneElement(children, {
    onMouseEnter: (e: React.MouseEvent) => {
      show()
      childProps.onMouseEnter?.(e)
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide()
      childProps.onMouseLeave?.(e)
    },
    onFocus: (e: React.FocusEvent) => {
      show()
      childProps.onFocus?.(e)
    },
    onBlur: (e: React.FocusEvent) => {
      hide()
      childProps.onBlur?.(e)
    },
    title: undefined,
  } as Record<string, unknown>)

  return (
    <>
      <span ref={wrapRef} style={{ display: 'inline-flex' }}>
        {enhanced}
      </span>
      {visible && coords && (
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            left: coords.x,
            top: coords.y,
            transform: placement === 'bottom'
              ? 'translate(-50%, 0)'
              : 'translate(-50%, -100%)',
            background: 'var(--text-primary)',
            color: 'var(--bg-primary)',
            fontSize: '11.5px',
            fontWeight: 500,
            padding: '6px 10px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{label}</span>
          {shortcut && (
            <span
              style={{
                fontSize: '10.5px',
                opacity: 0.7,
                fontFamily: 'var(--font-mono)',
                padding: '1px 5px',
                borderRadius: '3px',
                background: 'color-mix(in srgb, var(--bg-primary) 18%, transparent)',
              }}
            >
              {shortcut}
            </span>
          )}
        </div>
      )}
    </>
  )
}
