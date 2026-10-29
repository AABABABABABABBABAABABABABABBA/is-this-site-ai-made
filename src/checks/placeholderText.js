const PATTERNS = [
  /your company( name)?/i,
  /\[company name\]/i,
  /lorem ipsum/i,
  /\byour (business|brand) name\b/i,
  /123 main st(reet)?/i,
  /\(123\) 456-7890/,
  /example@example\.com/i,
]

export function checkPlaceholderText({ text }) {
  const hits = []
  for (const pattern of PATTERNS) {
    const match = text.match(pattern)
    if (match) hits.push(match[0])
  }

  return {
    id: 'placeholder-text',
    label: 'uncustomized placeholder text left in copy',
    weight: hits.length > 0 ? 10 : 0,
    hit: hits.length > 0,
    evidence: [...new Set(hits)],
  }
}
