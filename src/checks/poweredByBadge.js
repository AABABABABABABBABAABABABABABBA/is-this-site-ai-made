const BADGE_PATTERN =
  /(built|made|created|powered|designed)\s+(with|by|on|in)\s+(lovable|bolt(\.new)?|v0|framer|durable|dora(\s?ai)?|base44|replit|10web|softr|wix(\s?adi)?)/gi

export function checkPoweredByBadge({ text }) {
  const matches = [...text.matchAll(BADGE_PATTERN)].map(m => m[0].trim())
  const unique = [...new Set(matches.map(m => m.toLowerCase()))]
  return {
    id: 'powered-by-badge',
    label: 'visible "built with <AI tool>" badge',
    weight: 30,
    hit: unique.length > 0,
    evidence: unique,
  }
}
