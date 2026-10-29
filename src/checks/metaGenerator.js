const AI_GENERATORS = [
  { match: /lovable/i, name: 'Lovable' },
  { match: /v0\.(dev|app)/i, name: 'v0 by Vercel' },
  { match: /bolt\.new/i, name: 'Bolt.new' },
  { match: /framer/i, name: 'Framer' },
  { match: /wix\.com.*adi|wix ai/i, name: 'Wix ADI' },
  { match: /durable/i, name: 'Durable' },
  { match: /dora\s?ai/i, name: 'Dora AI' },
  { match: /10web/i, name: '10Web AI Builder' },
  { match: /softr/i, name: 'Softr' },
  { match: /base44/i, name: 'Base44' },
  { match: /same\.new|same\.dev/i, name: 'Same.new' },
  { match: /replit/i, name: 'Replit' },
]

export function checkMetaGenerator({ $ }) {
  const content = $('meta[name="generator"]').attr('content') || ''
  if (!content) return null

  const hit = AI_GENERATORS.find(g => g.match.test(content))
  return {
    id: 'meta-generator',
    label: 'meta generator tag',
    weight: 30,
    hit: Boolean(hit),
    evidence: hit ? [`<meta name="generator" content="${content}"> -> ${hit.name}`] : [`generator: ${content}`],
  }
}
