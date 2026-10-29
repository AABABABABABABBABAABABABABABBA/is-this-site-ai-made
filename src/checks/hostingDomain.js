const BUILDER_SUBDOMAINS = [
  { match: /\.lovable\.app$/i, name: 'Lovable' },
  { match: /\.vercel\.app$/i, name: 'v0/Vercel preview', weight: 15 },
  { match: /\.framer\.(app|website)$/i, name: 'Framer' },
  { match: /\.replit\.(app|dev)$/i, name: 'Replit' },
  { match: /\.durable\.co$/i, name: 'Durable' },
  { match: /\.dora\.run$/i, name: 'Dora AI' },
  { match: /\.base44\.app$/i, name: 'Base44' },
  { match: /\.10web\.site$/i, name: '10Web AI Builder' },
  { match: /\.softr\.app$/i, name: 'Softr' },
  { match: /\.bolt\.host$/i, name: 'Bolt.new' },
]

// still ships on the builder's free subdomain, never pointed a custom domain at it
export function checkHostingDomain({ finalUrl }) {
  if (!finalUrl) return null

  const hostname = finalUrl.hostname
  const hit = BUILDER_SUBDOMAINS.find(b => b.match.test(hostname))

  return {
    id: 'hosting-domain',
    label: 'still hosted on the AI builder\'s own subdomain',
    weight: hit ? hit.weight || 25 : 0,
    hit: Boolean(hit),
    evidence: hit ? [`${hostname} -> ${hit.name}`] : [],
  }
}
