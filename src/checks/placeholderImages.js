const PLACEHOLDER_HOSTS = [
  'images.unsplash.com',
  'source.unsplash.com',
  'picsum.photos',
  'placehold.co',
  'via.placeholder.com',
  'loremflickr.com',
  'placeholder.com',
  'dummyimage.com',
]

export function checkPlaceholderImages({ $, local }) {
  if (local && !local.builtHtml) return null

  const found = new Set()
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src') || ''
    const host = PLACEHOLDER_HOSTS.find(h => src.includes(h))
    if (host) found.add(host)
  })

  return {
    id: 'placeholder-images',
    label: 'stock placeholder image hosts (unfinished scaffold)',
    weight: 8,
    hit: found.size > 0,
    evidence: [...found],
  }
}
