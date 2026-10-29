export function checkEmDashDensity({ text }) {
  const words = text.split(/\s+/).filter(Boolean).length
  const emDashes = (text.match(/—/g) || []).length
  if (words < 200) {
    return { id: 'em-dash-density', label: 'em dash overuse', weight: 0, hit: false, evidence: [] }
  }

  const per1000 = (emDashes / words) * 1000
  const hit = per1000 >= 3

  return {
    id: 'em-dash-density',
    label: 'em dash overuse (common LLM writing tic)',
    weight: hit ? Math.min(10, Math.round(per1000)) : 0,
    hit,
    evidence: hit ? [`${emDashes} em dashes across ~${words} words (${per1000.toFixed(1)} per 1000 words)`] : [],
  }
}
