"use client"

import { useEffect, useRef, useState } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  minHeight?: number
}

const allowedTags = new Set(['b', 'strong', 'i', 'em', 'u', 'p', 'br', 'ul', 'ol', 'li', 'a', 'blockquote', 'div', 'span'])
const allowedAttrs: Record<string, string[]> = {
  a: ['href', 'target', 'rel'],
  div: [],
  span: [],
  p: [],
  ul: [],
  ol: [],
  li: [],
  blockquote: [],
  strong: [],
  b: [],
  i: [],
  em: [],
  u: [],
}

function getDocumentFragment(input: string): Document | null {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return null
  }
  const parser = new DOMParser()
  return parser.parseFromString(input || '', 'text/html')
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\r?\n/g, '<br>')
}

export function sanitizeBasicHtml(input: string): string {
  try {
    const doc = getDocumentFragment(input)
    const body = doc?.body
    if (!doc || !body) {
      return input || ''
    }

    body.querySelectorAll('script,style,iframe,object,embed').forEach((node: { remove: () => any }) => node.remove())

    const walker = doc.createTreeWalker(body, (typeof NodeFilter !== 'undefined' ? NodeFilter.SHOW_ELEMENT : 1) as number)
    let current = walker.currentNode as HTMLElement | null

  while (current) {
    const tag = current.tagName.toLowerCase()

    if (!allowedTags.has(tag)) {
      const parent = current.parentElement
      if (parent) {
        while (current.firstChild) parent.insertBefore(current.firstChild, current)
        parent.removeChild(current)
        current = parent as HTMLElement
        continue
      } else {
        current.remove()
      }
    } else if (current) {
      Array.from(current.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase()
        if (name.startsWith('on')) {
          current?.removeAttribute(attr.name)
          return
        }

        if (tag === 'a' && name === 'href') {
          const href = attr.value.trim()
          if (/^javascript:/i.test(href) || href === '') {
            current?.removeAttribute(attr.name)
          } else {
            current?.setAttribute('target', '_blank')
            current?.setAttribute('rel', 'noopener noreferrer')
          }
          return
        }

        const allowedForTag = allowedAttrs[tag] || []
        if (!allowedForTag.includes(name)) {
          current?.removeAttribute(attr.name)
        }
      })
    }

    current = walker.nextNode() as HTMLElement | null
  }

    return (body.innerHTML || '').trim()
  } catch (err) {
    // If sanitization fails for any reason, fall back to raw input to keep typing working
    return input || ''
  }
}

export function normalizeToHtml(value: string): string {
  if (!value) return ''
  const looksLikeHtml = /<\w+[^>]*>[\s\S]*?<\/\w+>|<br\s*\/?\s*>/i.test(value)
  if (looksLikeHtml) return sanitizeBasicHtml(value)
  return sanitizeBasicHtml(escapeHtml(value))
}

export function htmlToPlainText(html: string): string {
  if (!html) return ''
  const doc = getDocumentFragment(html)
  const body = doc?.body
  if (!doc || !body) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  return (body.textContent || '').trim()
}

export function RichTextEditor({ value, onChange, placeholder, className = '', minHeight = 160 }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [hasContent, setHasContent] = useState(() => htmlToPlainText(value).length > 0)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (el.innerHTML !== (value || '')) {
      el.innerHTML = value || ''
    }
    setHasContent(htmlToPlainText(value).length > 0)
  }, [value])

  const emitChange = () => {
    const el = editorRef.current
    if (!el) return
    const raw = el.innerHTML
    
    // Don't sanitize during typing - just pass raw value
    // Sanitization happens on save
    const plain = (el.textContent || '').trim()
    const fallbackPlain = raw.replace(/<[^>]*>/g, '').trim()
    setHasContent((plain || fallbackPlain).length > 0)
    onChange(raw)
  }

  const exec = (command: string, arg?: string) => {
    if (typeof document === 'undefined') return
    document.execCommand(command, false, arg)
    emitChange()
  }

  const handleLink = () => {
    const url = prompt('Enter a URL')
    if (!url) return
    exec('createLink', url)
  }

  const clearFormatting = () => {
    exec('removeFormat')
    exec('unlink')
  }

  return (
    <div className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ${className}`}>
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 p-2 text-sm">
        <ToolbarButton label="B" title="Bold" onClick={() => exec('bold')} />
        <ToolbarButton label="I" title="Italic" onClick={() => exec('italic')} />
        <ToolbarButton label="U" title="Underline" onClick={() => exec('underline')} />
        <ToolbarButton label="•" title="Bulleted list" onClick={() => exec('insertUnorderedList')} />
        <ToolbarButton label="1." title="Numbered list" onClick={() => exec('insertOrderedList')} />
        <ToolbarButton label="❝" title="Quote" onClick={() => exec('formatBlock', 'blockquote')} />
        <ToolbarButton label="🔗" title="Add link" onClick={handleLink} />
        <ToolbarButton label="⟲" title="Clear formatting" onClick={clearFormatting} />
      </div>

      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emitChange}
          onBlur={emitChange}
          className="w-full px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none min-h-40"
          style={{ minHeight }}
        />
        {!hasContent && placeholder && (
          <span className="pointer-events-none absolute left-4 top-3 text-sm text-gray-400">
            {placeholder}
          </span>
        )}
      </div>
    </div>
  )
}

interface ToolbarButtonProps {
  label: string
  title: string
  onClick: () => void
}

function ToolbarButton({ label, title, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold"
    >
      {label}
    </button>
  )
}
