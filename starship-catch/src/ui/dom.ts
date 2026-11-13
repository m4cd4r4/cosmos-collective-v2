type Child = Node | string | null | false | undefined

/** Create an element. `class`, `text` and `on*` are handled; everything else is an attribute. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string | number | boolean | EventListener> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (typeof value === 'function') node.addEventListener(key.slice(2), value)
    else if (key === 'class') node.className = String(value)
    else if (value === true) node.setAttribute(key, '')
    else if (value !== false) node.setAttribute(key, String(value))
  }
  for (const child of children) if (child) node.append(child)
  return node
}

/** A link to a source document. Opens in a new tab, because the game lives in an iframe. */
export function sourceLink(label: string, url: string): HTMLAnchorElement {
  return el('a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, label)
}

const whole = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })
const oneDecimal = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const twoDecimals = new Intl.NumberFormat('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const fmt = {
  whole: (v: number) => whole.format(v),
  one: (v: number) => oneDecimal.format(v),
  two: (v: number) => twoDecimals.format(v),
}
