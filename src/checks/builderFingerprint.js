const SIGNATURES = [
  { match: /data-lov-id|data-lovable|cdn\.gpteng\.co|lovable-tagger/i, name: 'Lovable' },
  { match: /data-component-path|v0\.app|vercel\/v0/i, name: 'v0 by Vercel' },
  { match: /bolt\.new|stackblitz\.com\/.*bolt/i, name: 'Bolt.new' },
  { match: /data-framer-name|framerusercontent\.com/i, name: 'Framer' },
  { match: /data-dora-|dora\.run/i, name: 'Dora AI' },
  { match: /durable\.co/i, name: 'Durable' },
  { match: /base44\.(com|app)/i, name: 'Base44' },
  { match: /id="replit-badge"|replit\.com\/badge/i, name: 'Replit' },
  { match: /data-wix-adi|wixadi/i, name: 'Wix ADI' },
  { match: /10web\.io/i, name: '10Web AI Builder' },
  { match: /softr\.io/i, name: 'Softr' },
]

export function checkBuilderFingerprint({ html }) {
  const found = []
  for (const sig of SIGNATURES) {
    const match = html.match(sig.match)
    if (match) found.push(`${sig.name} (matched "${match[0]}")`)
  }
  return {
    id: 'builder-fingerprint',
    label: 'AI builder platform fingerprint',
    weight: 35,
    hit: found.length > 0,
    evidence: found,
  }
}
