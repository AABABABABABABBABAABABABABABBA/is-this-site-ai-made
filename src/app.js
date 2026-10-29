import fs from 'node:fs'
import { normalizeUrl, fetchPage, fetchRobots, fetchAssets } from './fetchSite.js'
import { loadLocalProject } from './localProject.js'
import { buildWebContext, buildLocalContext, runChecks, runChecksAcrossPages } from './checks/index.js'
import { renderSite } from './backend/browser.js'
import { scoreResults } from './score.js'
import { runStep } from './spinner.js'

export function looksLikeLocalPath(input) {
  if (/^https?:\/\//i.test(input)) return false
  try {
    return fs.existsSync(input) && fs.statSync(input).isDirectory()
  } catch {
    return false
  }
}

// quick path: one plain HTTP fetch, no JS execution. fast, but blind to
// anything a client-rendered app (most AI site builders) injects at runtime
export async function scanUrlQuick(rawTarget) {
  const targetUrl = normalizeUrl(rawTarget)

  const { html, finalUrl } = await runStep(`fetching ${targetUrl.hostname}`, () => fetchPage(targetUrl))
  const robotsTxt = await runStep('reading robots.txt', () => fetchRobots(finalUrl.origin))
  const assets = await runStep('pulling linked scripts and stylesheets', () => fetchAssets(html, finalUrl))

  const context = buildWebContext({ html, finalUrl, robotsTxt, assets })
  const results = runChecks(context)
  const scored = scoreResults(results)

  return { target: finalUrl.toString(), results, scored }
}

// deep path: drives real headless Chromium so client-rendered AI builders
// (Lovable, v0, Bolt, ...) actually get a chance to inject their markup,
// then crawls a few internal pages and watches real network traffic for
// builder CDNs that never show up in a plain fetch
export async function scanUrlDeep(rawTarget) {
  const targetUrl = normalizeUrl(rawTarget)

  const { pages, networkHosts, finalUrl } = await runStep(
    `rendering ${targetUrl.hostname} in headless chromium`,
    () => renderSite(targetUrl.toString()),
  )
  const robotsTxt = await runStep('reading robots.txt', () => fetchRobots(finalUrl.origin))

  const results = await runStep(`running AI-factor checks across ${pages.length} page(s)`, async () =>
    runChecksAcrossPages(pages, { robotsTxt, networkHosts, finalUrl }),
  )
  const scored = scoreResults(results)

  return { target: finalUrl.toString(), results, scored }
}

export async function scanLocalPath(rootDir) {
  const project = await runStep(`reading project at ${rootDir}`, () => loadLocalProject(rootDir))
  const context = await runStep('running AI-factor checks', async () => buildLocalContext(project))
  const results = runChecks(context)
  const scored = scoreResults(results)

  return { target: project.root, results, scored }
}
