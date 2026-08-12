import { renderMarkdown } from '../markdown'

export function MarkdownBody({
  text,
  className,
}: {
  text: string
  className?: string
}) {
  if (!text.trim()) return null
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
    />
  )
}
