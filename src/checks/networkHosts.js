const AI_HOSTS = [
  { match: /(^|\.)cdn\.gpteng\.co$/i, name: 'Lovable (gptengineer.js loader)' },
  { match: /(^|\.)lovable\.(app|dev)$/i, name: 'Lovable' },
  { match: /(^|\.)v0\.(app|dev)$/i, name: 'v0 by Vercel' },
  { match: /(^|\.)bolt\.new$/i, name: 'Bolt.new' },
  { match: /(^|\.)framerusercontent\.com$/i, name: 'Framer' },
  { match: /(^|\.)framer\.(app|website)$/i, name: 'Framer' },
  { match: /(^|\.)dora\.run$/i, name: 'Dora AI' },
  { match: /(^|\.)durable\.co$/i, name: 'Durable' },
  { match: /(^|\.)base44\.(app|com)$/i, name: 'Base44' },
  { match: /(^|\.)10web\.(io|site)$/i, name: '10Web AI Builder' },
  { match: /(^|\.)softr\.(app|io)$/i, name: 'Softr' },
  { match: /(^|\.)replit\.(app|dev)$/i, name: 'Replit' },
]

// network requests fire from runtime JS too, so this catches builder CDNs
// that never show up in a plain fetch of the page's static HTML
export function checkNetworkHosts({ networkHosts }) {
  if (!networkHosts) return null

  const found = []
  for (const host of networkHosts) {
    const hit = AI_HOSTS.find(h => h.match.test(host))
    if (hit) found.push(`${host} -> ${hit.name}`)
  }

  return {
    id: 'network-hosts',
    label: 'AI builder CDN/host contacted at runtime',
    weight: 30,
    hit: found.length > 0,
    evidence: [...new Set(found)],
  }
}
