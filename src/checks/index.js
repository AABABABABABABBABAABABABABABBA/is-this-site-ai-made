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

const WEB_CHECKS = [
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
  checkRobotsAiCrawlers,
]

const LOCAL_CHECKS = [...WEB_CHECKS, checkLocalPackageDeps, checkLocalCommentStyle]

export function buildWebContext({ html, finalUrl, robotsTxt, assets }) {
  const $ = cheerio.load(html)
  const text = $('body').text().replace(/\s+/g, ' ').trim()
  const assetText = (assets || []).map(a => a.text).join('\n')

  return {
    html: html + '\n' + assetText,
    $,
    text,
    finalUrl,
    robotsTxt,
    local: null,
  }
}

export function buildLocalContext(localProject) {
  const builtHtml = localProject.builtHtml || ''
  const $ = cheerio.load(builtHtml || '<html></html>')
  const builtText = builtHtml ? $('body').text().replace(/\s+/g, ' ').trim() : ''
  const sourceText = localProject.sourceFiles.map(f => f.text).join('\n')

  return {
    html: builtHtml + '\n' + sourceText,
    $,
    text: `${builtText} ${sourceText}`.trim(),
    finalUrl: null,
    robotsTxt: localProject.robotsTxt,
    local: localProject,
  }
}

export function runChecks(context) {
  const checks = context.local ? LOCAL_CHECKS : WEB_CHECKS
  return checks.map(check => check(context)).filter(Boolean)
}
