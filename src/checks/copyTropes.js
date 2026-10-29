const TROPES = [
  /in today'?s (fast-paced|digital) (world|landscape|age)/i,
  /unlock the (power|potential) of/i,
  /whether you'?re a? [\w\s]+ or a? [\w\s]+,/i,
  /elevate your/i,
  /seamless(ly)? (experience|integration)/i,
  /dive into/i,
  /game[\s-]chang(er|ing)/i,
  /look no further/i,
  /at the end of the day/i,
  /it'?s important to note that/i,
  /in conclusion,/i,
  /take your [\w\s]+ to the next level/i,
  /empower(ing)? you to/i,
  /navigate the (complex|ever-changing)/i,
  /in the ever-evolving/i,
]

export function checkCopyTropes({ text }) {
  const hits = []
  for (const pattern of TROPES) {
    const match = text.match(pattern)
    if (match) hits.push(match[0].trim())
  }

  return {
    id: 'copy-tropes',
    label: 'AI-copywriting clichés in page text',
    weight: Math.min(15, hits.length * 5),
    hit: hits.length > 0,
    evidence: hits.slice(0, 6),
  }
}
