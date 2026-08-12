const ALLOWED_HREF = /^(https?:\/\/|mailto:)/i

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function safeHref(raw: string): string | null {
  const href = raw.trim()
  if (!ALLOWED_HREF.test(href)) return null
  return href.replace(/"/g, '%22')
}

/** Lightweight markdown: bold, italic, code, links, lists, line breaks. */
export function renderMarkdown(source: string): string {
  const escaped = escapeHtml(source)

  const withCode = escaped.replace(/`([^`]+)`/g, '<code>$1</code>')
  const withLinks = withCode.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_match, label: string, href: string) => {
      const safe = safeHref(href.replace(/&amp;/g, '&'))
      if (!safe) return label
      return `<a href="${safe}" target="_blank" rel="noreferrer noopener">${label}</a>`
    },
  )
  const withBold = withLinks.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  const withItalic = withBold.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')

  const lines = withItalic.split('\n')
  const html: string[] = []
  let inList = false

  const closeList = () => {
    if (inList) {
      html.push('</ul>')
      inList = false
    }
  }

  for (const line of lines) {
    const item = line.match(/^\s*[-*]\s+(.+)$/)
    if (item) {
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${item[1]}</li>`)
      continue
    }
    closeList()
    if (line.trim() === '') {
      html.push('<br />')
    } else {
      html.push(`<p>${line}</p>`)
    }
  }
  closeList()
  return html.join('')
}

export function stripMarkdown(source: string): string {
  return source
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .trim()
}
