'use client'

/**
 * Devlog Content Component
 * Renders markdown content with syntax highlighting and custom styling
 */

import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface DevlogContentProps {
  content: string
}

export function DevlogContent({ content }: DevlogContentProps) {
  // Simple markdown parser for basic formatting
  // In production, use remark/rehype or MDX
  const renderedContent = useMemo(() => {
    return parseMarkdown(content)
  }, [content])

  return (
    <div
      className="devlog-content"
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  )
}

// ============================================
// Simple Markdown Parser
// ============================================

function parseMarkdown(markdown: string): string {
  let html = markdown

  // Escape HTML (except for code blocks which we'll handle separately)
  // html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // Code blocks with syntax highlighting
  html = html.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (_, lang, code) => {
      const escapedCode = escapeHtml(code.trim())
      const highlighted = lang ? highlightCode(escapedCode, lang) : escapedCode
      return `<div class="code-block">
        ${lang ? `<div class="code-lang">${lang}</div>` : ''}
        <pre><code class="language-${lang || 'text'}">${highlighted}</code></pre>
      </div>`
    }
  )

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="inline-code">$1</code>'
  )

  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-cosmos-cyan hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
  )

  // Unordered lists
  html = html.replace(/^\- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

  // Tables (basic support)
  html = parseTable(html)

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')

  // Horizontal rules
  html = html.replace(/^---$/gm, '<hr />')

  // Paragraphs (wrap remaining text)
  html = html
    .split('\n\n')
    .map((block) => {
      block = block.trim()
      if (!block) return ''
      // Don't wrap if already has block elements
      if (
        block.startsWith('<h') ||
        block.startsWith('<ul') ||
        block.startsWith('<ol') ||
        block.startsWith('<blockquote') ||
        block.startsWith('<div') ||
        block.startsWith('<pre') ||
        block.startsWith('<table') ||
        block.startsWith('<hr')
      ) {
        return block
      }
      return `<p>${block}</p>`
    })
    .join('\n\n')

  return html
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function highlightCode(code: string, language: string): string {
  // Simple syntax highlighting for common patterns
  // In production, use highlight.js or Prism

  const keywords: Record<string, string[]> = {
    typescript: [
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
      'import', 'export', 'from', 'default', 'async', 'await', 'interface', 'type',
      'extends', 'implements', 'class', 'new', 'this', 'try', 'catch', 'throw',
    ],
    javascript: [
      'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
      'import', 'export', 'from', 'default', 'async', 'await', 'class', 'new', 'this',
    ],
    sql: [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER', 'BY', 'GROUP', 'HAVING',
      'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS', 'TOP', 'DESC', 'ASC',
    ],
    css: [
      'color', 'background', 'border', 'margin', 'padding', 'display', 'flex',
      'grid', 'position', 'width', 'height', 'font', 'text', 'transition',
    ],
  }

  const langKeywords = keywords[language] || keywords.typescript

  // Highlight strings
  let highlighted = code.replace(
    /(["'`])(?:(?=(\\?))\2.)*?\1/g,
    '<span class="code-string">$&</span>'
  )

  // Highlight comments
  highlighted = highlighted.replace(
    /(\/\/.*$|\/\*[\s\S]*?\*\/|--.*$)/gm,
    '<span class="code-comment">$1</span>'
  )

  // Highlight keywords
  langKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
    highlighted = highlighted.replace(regex, '<span class="code-keyword">$1</span>')
  })

  // Highlight numbers
  highlighted = highlighted.replace(
    /\b(\d+\.?\d*)\b/g,
    '<span class="code-number">$1</span>'
  )

  return highlighted
}

function parseTable(html: string): string {
  // Very basic table parsing
  const tableRegex = /^\|(.+)\|$/gm
  const tables: string[][] = []
  let currentTable: string[] = []
  let inTable = false

  html.split('\n').forEach((line) => {
    if (line.match(/^\|/)) {
      if (!inTable) {
        inTable = true
        currentTable = []
      }
      if (!line.match(/^\|[-:\s|]+\|$/)) {
        // Skip separator rows
        currentTable.push(line)
      }
    } else if (inTable) {
      tables.push([...currentTable])
      currentTable = []
      inTable = false
    }
  })

  if (currentTable.length > 0) {
    tables.push(currentTable)
  }

  tables.forEach((tableRows) => {
    if (tableRows.length === 0) return

    let tableHtml = '<table class="devlog-table">'

    tableRows.forEach((row, idx) => {
      const cells = row
        .split('|')
        .filter((c) => c.trim())
        .map((c) => c.trim())

      if (idx === 0) {
        tableHtml += '<thead><tr>'
        cells.forEach((cell) => {
          tableHtml += `<th>${cell}</th>`
        })
        tableHtml += '</tr></thead><tbody>'
      } else {
        tableHtml += '<tr>'
        cells.forEach((cell) => {
          tableHtml += `<td>${cell}</td>`
        })
        tableHtml += '</tr>'
      }
    })

    tableHtml += '</tbody></table>'

    // Replace the original table text with HTML
    const originalText = tableRows.join('\n')
    html = html.replace(originalText, tableHtml)
  })

  return html
}
