import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type AriaRole, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { IconCheck, IconChevron } from './Icons'

export type GlassOption = {
  value: string
  label: string
}

type MenuCoords = {
  top: number
  left: number
  width: number
  maxHeight: number
}

function placeMenu(
  node: HTMLElement,
  align: 'left' | 'right',
  minWidth: number,
): MenuCoords {
  const rect = node.getBoundingClientRect()
  const gap = 8
  const gutter = 10
  const width = Math.min(
    window.innerWidth - gutter * 2,
    Math.max(rect.width, minWidth),
  )
  const spaceBelow = window.innerHeight - rect.bottom - 16
  const spaceAbove = rect.top - 16
  const openUp = spaceBelow < 160 && spaceAbove > spaceBelow
  const maxHeight = Math.max(140, Math.min(280, (openUp ? spaceAbove : spaceBelow) - gap))
  const unclampedLeft = align === 'right' ? rect.right - width : rect.left
  const left = Math.min(
    Math.max(gutter, unclampedLeft),
    window.innerWidth - width - gutter,
  )

  return {
    top: openUp ? rect.top - gap - maxHeight : rect.bottom + gap,
    left,
    width,
    maxHeight,
  }
}

export function GlassFloatMenu({
  open,
  anchorRef,
  onClose,
  children,
  align = 'left',
  minWidth = 168,
  id,
  role = 'listbox',
  labelledBy,
  ariaLabel,
}: {
  open: boolean
  anchorRef: RefObject<HTMLElement | null>
  onClose: () => void
  children: ReactNode
  align?: 'left' | 'right'
  minWidth?: number
  id?: string
  role?: AriaRole
  labelledBy?: string
  ariaLabel?: string
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<MenuCoords>({
    top: 0,
    left: 0,
    width: minWidth,
    maxHeight: 240,
  })

  const update = useCallback(() => {
    const node = anchorRef.current
    if (!node) return
    setCoords(placeMenu(node, align, minWidth))
  }, [align, anchorRef, minWidth])

  useLayoutEffect(() => {
    if (!open) return
    update()
  }, [open, update])

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node
      if (anchorRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return
      }
      onClose()
    }

    function onKey(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopPropagation()
      onClose()
      anchorRef.current?.focus()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey, true)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey, true)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [anchorRef, onClose, open, update])

  if (!open) return null

  return createPortal(
    <div
      ref={menuRef}
      id={id}
      className="glass-float-menu"
      role={role}
      aria-labelledby={labelledBy}
      aria-label={ariaLabel}
      style={{
        top: coords.top,
        left: coords.left,
        width: coords.width,
        maxHeight: coords.maxHeight,
      }}
    >
      <div className="glass-float-menu-shine" aria-hidden="true" />
      <div className="glass-float-menu-list">{children}</div>
    </div>,
    document.body,
  )
}

export function GlassSelect({
  id,
  value,
  options,
  onChange,
  ariaLabel,
}: {
  id?: string
  value: string
  options: GlassOption[]
  onChange: (value: string) => void
  ariaLabel?: string
}) {
  const generatedId = useId()
  const triggerId = id || generatedId
  const listId = `${triggerId}-list`
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  )

  const close = useCallback(() => {
    setOpen(false)
  }, [])

  const choose = (next: string) => {
    onChange(next)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const move = (delta: number) => {
    const index = Math.max(0, options.findIndex((option) => option.value === value))
    const next = options[(index + delta + options.length) % options.length]
    if (next) onChange(next.value)
  }

  return (
    <div className="glass-select">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        className={`glass-select-trigger${open ? ' is-open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            if (!open) setOpen(true)
            else move(1)
          }
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            if (!open) setOpen(true)
            else move(-1)
          }
        }}
      >
        <span>{selected?.label}</span>
        <IconChevron size={16} />
      </button>
      <GlassFloatMenu
        open={open}
        anchorRef={triggerRef}
        onClose={close}
        id={listId}
        labelledBy={triggerId}
        ariaLabel={ariaLabel}
      >
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value || 'empty'}
              type="button"
              role="option"
              aria-selected={active}
              className={`glass-select-option${active ? ' is-active' : ''}`}
              onClick={() => choose(option.value)}
            >
              <span>{option.label}</span>
              {active ? <IconCheck size={14} /> : null}
            </button>
          )
        })}
      </GlassFloatMenu>
    </div>
  )
}
