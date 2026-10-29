const codes = {
  reset: 0,
  bold: 1,
  dim: 2,
  italic: 3,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  gray: 90,
}

const wrap = code => text => `\x1b[${code}m${text}\x1b[0m`

export const c = {}
for (const [name, code] of Object.entries(codes)) {
  c[name] = wrap(code)
}

export function rgb(r, g, b, text) {
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`
}

// gemini-brand-ish blue -> purple sweep, one color per character
export function geminiGradient(text) {
  const stops = [
    [66, 133, 244],
    [138, 125, 245],
    [196, 108, 234],
    [242, 94, 158],
  ]
  const chars = [...text]
  let out = ''
  for (let i = 0; i < chars.length; i++) {
    const t = chars.length <= 1 ? 0 : i / (chars.length - 1)
    const segment = t * (stops.length - 1)
    const idx = Math.min(stops.length - 2, Math.floor(segment))
    const localT = segment - idx
    const [r1, g1, b1] = stops[idx]
    const [r2, g2, b2] = stops[idx + 1]
    const r = Math.round(r1 + (r2 - r1) * localT)
    const g = Math.round(g1 + (g2 - g1) * localT)
    const b = Math.round(b1 + (b2 - b1) * localT)
    out += rgb(r, g, b, chars[i])
  }
  return out
}
