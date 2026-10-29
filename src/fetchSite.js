import * as cheerio from 'cheerio'

const USER_AGENT = 'is-this-site-ai-made/1.0 (+https://github.com/is-this-site-ai-made)'
const TIMEOUT_MS = 10_000
const MAX_ASSETS = 6
const MAX_ASSET_BYTES = 400_000

export function normalizeUrl(input) {
  let url = input.trim()
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  return new URL(url)
}

async function get(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'user-agent': USER_AGENT, accept: '*/*' },
    })
    return res
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchPage(targetUrl) {
  const res = await get(targetUrl.toString())
  if (!res.ok) {
    throw new Error(`site responded with ${res.status} ${res.statusText}`)
  }
  const html = await res.text()
  const finalUrl = new URL(res.url || targetUrl.toString())
  return { html, finalUrl, headers: res.headers }
}

export async function fetchRobots(origin) {
  try {
    const res = await get(new URL('/robots.txt', origin).toString())
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

function sameOrigin(assetUrl, origin) {
  try {
    return new URL(assetUrl, origin).origin === new URL(origin).origin
  } catch {
    return false
  }
}

export async function fetchAssets(html, pageUrl) {
  const $ = cheerio.load(html)
  const candidates = []

  $('script[src]').each((_, el) => candidates.push($(el).attr('src')))
  $('link[rel="stylesheet"][href]').each((_, el) => candidates.push($(el).attr('href')))

  const picked = candidates
    .filter(Boolean)
    .filter(src => sameOrigin(src, pageUrl.toString()))
    .map(src => new URL(src, pageUrl).toString())
    .slice(0, MAX_ASSETS)

  const assets = []
  for (const assetUrl of picked) {
    try {
      const res = await get(assetUrl)
      if (!res.ok) continue
      const buf = await res.arrayBuffer()
      if (buf.byteLength > MAX_ASSET_BYTES) continue
      assets.push({ url: assetUrl, text: Buffer.from(buf).toString('utf8') })
    } catch {
      // asset unreachable, skip it
    }
  }
  return assets
}
