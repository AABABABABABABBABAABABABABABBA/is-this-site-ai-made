import * as cheerio from 'cheerio'
import { checkMetaGenerator } from './metaGenerator.js'
import { checkBuilderFingerprint } from './builderFingerprint.js'
import { checkPoweredByBadge } from './poweredByBadge.js'
import { checkShadcnLucideStack } from './shadcnLucideStack.js'
import { checkPlaceholderImages } from './placeholderImages.js'
import { checkFaviconAndTitle } from './faviconAndTitle.js'
import { checkCopyTropes } from './copyTropes.js'
import { checkEmDashDensity } from './emDashDensity.js'
import { checkEmojiHeadings } from './emojiHeadings.js'
import { checkPlaceholderText } from './placeholderText.js'
import { checkLocalPackageDeps } from './localPackageDeps.js'
import { checkLocalCommentStyle } from './localCommentStyle.js'
import { checkRobotsAiCrawlers } from './robotsAiCrawlers.js'
import { checkNetworkHosts } from './networkHosts.js'
import { checkHostingDomain } from './hostingDomain.js'

// checks that read a single page's markup/text
const PAGE_CHECKS = [
  checkMetaGenerator,
  checkBuilderFingerprint,
  checkPoweredByBadge,
  checkShadcnLucideStack,
  checkPlaceholderImages,
  checkFaviconAndTitle,
  checkCopyTropes,
  checkEmDashDensity,
  checkEmojiHeadings,
  checkPlaceholderText,
]

// checks that look at the scan as a whole, not one page's markup
const SITE_CHECKS = [checkRobotsAiCrawlers, checkNetworkHosts, checkHostingDomain]

const LOCAL_ONLY_CHECKS = [checkLocalPackageDeps, checkLocalCommentStyle]

function pageContext({ html, finalUrl }) {
  const $ = cheerio.load(html)
  const text = $('body').text().replace(/\s+/g, ' ').trim()
  return { html, $, text, finalUrl, local: null }
}

export function buildWebContext({ html, finalUrl, robotsTxt, assets, networkHosts }) {
  const assetText = (assets || []).map(a => a.text).join('\n')
  const ctx = pageContext({ html: html + '\n' + assetText, finalUrl })
  return { ...ctx, robotsTxt, networkHosts }
}

export function buildLocalContext(localProject) {
  const builtHtml = localProject.builtHtml || ''
  const sourceText = localProject.sourceFiles.map(f => f.text).join('\n')
  const ctx = pageContext({ html: builtHtml + '\n' + sourceText, finalUrl: null })
  const builtText = builtHtml ? cheerio.load(builtHtml)('body').text().replace(/\s+/g, ' ').trim() : ''

  return {
    ...ctx,
    text: `${builtText} ${sourceText}`.trim(),
    robotsTxt: localProject.robotsTxt,
    networkHosts: null,
    local: localProject,
  }
}

export function runChecks(context) {
  const pageResults = PAGE_CHECKS.map(check => check(context))
  const siteResults = SITE_CHECKS.map(check => check(context))
  const localResults = context.local ? LOCAL_ONLY_CHECKS.map(check => check(context)) : []
  return [...pageResults, ...siteResults, ...localResults].filter(Boolean)
}

function mergeById(allResults) {
  const byId = new Map()
  for (const result of allResults) {
    const existing = byId.get(result.id)
    if (!existing) {
      byId.set(result.id, { ...result, evidence: [...result.evidence] })
      continue
    }
    existing.hit = existing.hit || result.hit
    existing.weight = Math.max(existing.weight, result.weight)
    if (result.hit) existing.evidence.push(...result.evidence)
  }
  return [...byId.values()]
}

// runs the page checks on every rendered page from a browser crawl and
// merges them: a signal counts if it showed up on any page the crawl visited
export function runChecksAcrossPages(pages, { robotsTxt, networkHosts, finalUrl }) {
  const perPage = pages.map(page => {
    const ctx = pageContext({ html: page.html, finalUrl: new URL(page.url) })
    return PAGE_CHECKS.map(check => check(ctx)).filter(Boolean).map(r => ({
      ...r,
      evidence: r.evidence.map(line => (pages.length > 1 ? `[${page.url}] ${line}` : line)),
    }))
  })

  const mergedPageResults = mergeById(perPage.flat())
  const siteContext = { robotsTxt, networkHosts, finalUrl, local: null }
  const siteResults = SITE_CHECKS.map(check => check(siteContext)).filter(Boolean)

  return [...mergedPageResults, ...siteResults]
}
