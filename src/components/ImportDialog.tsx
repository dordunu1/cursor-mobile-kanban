import { useEffect, useRef } from 'react'
import { useFocusTrap } from '../hooks/useFocusTrap'
import { IconClose } from './Icons'

export function ImportDialog({
  filename,
  onReplace,
  onMerge,
  onClose,
}: {
  filename: string
  onReplace: () => void
  onMerge: () => void
  onClose: () => void
}) {
  const sheetRef = useRef<HTMLDivElement>(null)
  useFocusTrap(sheetRef, true)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div
        ref={sheetRef}
        className="sheet sheet-compact"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sheet-header">
          <div>
            <h2 id="import-title" className="sheet-title">
              Import board
            </h2>
            <p className="sheet-sub">
              {filename} — replace this board, or merge its tasks and goals into what you already have.
            </p>
          </div>
          <button className="icon-btn neu-btn" onClick={onClose} aria-label="Close">
            <IconClose size={18} />
          </button>
        </header>
        <div className="sheet-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn neu-btn" onClick={onMerge}>
            Merge
          </button>
          <button className="btn btn-primary" onClick={onReplace}>
            Replace
          </button>
        </div>
      </div>
    </div>
  )
}
