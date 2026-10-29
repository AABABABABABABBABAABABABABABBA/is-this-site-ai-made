const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u

export function checkEmojiHeadings({ $ }) {
  const headings = []
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim()
    if (text && EMOJI.test(text)) headings.push(text)
  })

  return {
    id: 'emoji-headings',
    label: 'emoji-prefixed section headings (common AI markdown-to-web artifact)',
    weight: headings.length >= 2 ? 8 : 0,
    hit: headings.length >= 2,
    evidence: headings.slice(0, 5),
  }
}
