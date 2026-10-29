import fs from 'node:fs'
import { normalizeUrl, fetchPage, fetchRobots, fetchAssets } from './fetchSite.js'
import { loadLocalProject } from './localProject.js'
import { buildWebContext, buildLocalContext, runChecks } from './checks/index.js'
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

export async function scanUrl(rawTarget, { deep } = { deep: true }) {
  const targetUrl = normalizeUrl(rawTarget)

  const { html, finalUrl } = await runStep(`fetching ${targetUrl.hostname}`, () => fetchPage(targetUrl))
  const robotsTxt = await runStep('reading robots.txt', () => fetchRobots(finalUrl.origin))
  const assets = deep
    ? await runStep('pulling linked scripts and stylesheets', () => fetchAssets(html, finalUrl))
    : []

  const context = await runStep('running AI-factor checks', async () =>
    buildWebContext({ html, finalUrl, robotsTxt, assets }),
  )
  const results = runChecks(context)
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
