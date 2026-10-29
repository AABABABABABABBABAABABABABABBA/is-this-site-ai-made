const BANDS = [
  { max: 14, verdict: 'no strong signals', color: 'green' },
  { max: 34, verdict: 'a few AI-builder traces', color: 'yellow' },
  { max: 59, verdict: 'likely AI-assisted or AI-built', color: 'yellow' },
  { max: 100, verdict: 'strong signals of an AI-generated site', color: 'red' },
]

export function scoreResults(results) {
  const scored = results.filter(r => !r.informational)
  const hits = scored.filter(r => r.hit)
  const rawScore = hits.reduce((sum, r) => sum + r.weight, 0)
  const score = Math.min(100, rawScore)
  const band = BANDS.find(b => score <= b.max)

  return {
    score,
    verdict: band.verdict,
    color: band.color,
    hits,
    misses: scored.filter(r => !r.hit),
    informational: results.filter(r => r.informational),
  }
}
