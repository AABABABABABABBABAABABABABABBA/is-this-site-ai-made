const DEFAULT_TITLES = [
  'vite + react',
  'vite app',
  'create next app',
  'document',
  'react app',
  'my app',
  'app',
  'untitled',
  'new project',
]

const DEFAULT_FAVICONS = ['/vite.svg', 'favicon.ico/favicon-32x32.png', 'react.svg']

export function checkFaviconAndTitle({ $, local }) {
  if (local && !local.builtHtml) return null

  const title = ($('title').first().text() || '').trim().toLowerCase()
  const faviconHref = $('link[rel="icon"], link[rel="shortcut icon"]').attr('href') || ''
  const hasFavicon = Boolean(faviconHref)

  const defaultTitle = DEFAULT_TITLES.includes(title)
  const defaultFavicon = DEFAULT_FAVICONS.some(f => faviconHref.includes(f))

  const evidence = []
  if (defaultTitle) evidence.push(`page title left as scaffold default: "${title}"`)
  if (!hasFavicon) evidence.push('no favicon link tag at all')
  if (defaultFavicon) evidence.push(`favicon still the framework default: ${faviconHref}`)

  return {
    id: 'favicon-title',
    label: 'unfinished scaffold (default title or favicon)',
    weight: 10,
    hit: defaultTitle || !hasFavicon || defaultFavicon,
    evidence,
  }
}
