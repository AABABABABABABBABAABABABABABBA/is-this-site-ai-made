import { chromium } from 'playwright'

const NAV_TIMEOUT_MS = 15_000
const IDLE_TIMEOUT_MS = 6_000
const MAX_PAGES_DEFAULT = 4

function sameOriginHref(href, origin) {
  try {
    const url = new URL(href)
    return url.origin === origin && !href.includes('#')
  } catch {
    return false
  }
}

async function collectInternalLinks(page, origin) {
  const hrefs = await page.$$eval('a[href]', anchors => anchors.map(a => a.href)).catch(() => [])
  const unique = [...new Set(hrefs)].filter(href => sameOriginHref(href, origin))
  return unique
}

async function visitPage(page, url, hosts) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT_MS })
  await page.waitForLoadState('networkidle', { timeout: IDLE_TIMEOUT_MS }).catch(() => {})
  const html = await page.content()
  const status = response ? response.status() : null
  const headers = response ? response.headers() : {}
  hosts.add(new URL(page.url()).hostname)
  return { url: page.url(), html, status, headers }
}

export async function renderSite(startUrl, { maxPages = MAX_PAGES_DEFAULT } = {}) {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  const requestHosts = new Set()

  try {
    const context = await browser.newContext({
      userAgent: 'is-this-site-ai-made/1.0 (+https://github.com/is-this-site-ai-made)',
    })
    const page = await context.newPage()
    page.on('request', req => {
      try {
        requestHosts.add(new URL(req.url()).hostname)
      } catch {
        // malformed/data URL request, ignore
      }
    })

    const origin = new URL(startUrl).origin
    const pages = []
    const visited = new Set()

    const first = await visitPage(page, startUrl, requestHosts)
    pages.push(first)
    visited.add(first.url)

    const links = await collectInternalLinks(page, origin)
    for (const link of links) {
      if (pages.length >= maxPages) break
      if (visited.has(link)) continue
      visited.add(link)
      try {
        pages.push(await visitPage(page, link, requestHosts))
      } catch {
        // page unreachable or timed out, skip it and keep going
      }
    }

    return { pages, networkHosts: [...requestHosts], finalUrl: new URL(first.url) }
  } finally {
    await browser.close()
  }
}
