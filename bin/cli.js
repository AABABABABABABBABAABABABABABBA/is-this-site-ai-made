#!/usr/bin/env node
import { printBanner } from '../src/banner.js'
import { printReport } from '../src/report.js'
import { askText, askYesNo, closePrompt } from '../src/prompt.js'
import { scanUrlQuick, scanUrlDeep, scanLocalPath, looksLikeLocalPath } from '../src/app.js'
import { c } from '../src/colors.js'

async function runInteractive() {
  printBanner()
  const input = await askText('enter a URL or a local project folder to scan')
  if (!input) {
    console.log(c.red('nothing entered, stopping.'))
    process.exit(1)
  }

  console.log()

  if (looksLikeLocalPath(input)) {
    closePrompt()
    const result = await scanLocalPath(input)
    printReport(result)
    return
  }

  const deep = await askYesNo(
    'render it in a real headless browser and crawl a few pages? (slower, catches JS-only AI builders)',
    true,
  )
  closePrompt()
  console.log()
  const result = deep ? await scanUrlDeep(input) : await scanUrlQuick(input)
  printReport(result)
}

async function runDirect(args) {
  const quick = args.includes('--quick')
  const target = args.find(a => !a.startsWith('--'))

  printBanner()
  console.log()

  if (looksLikeLocalPath(target)) {
    const result = await scanLocalPath(target)
    printReport(result)
    return
  }

  const result = quick ? await scanUrlQuick(target) : await scanUrlDeep(target)
  printReport(result)
}

async function main() {
  const args = process.argv.slice(2)
  try {
    if (args.length === 0) {
      await runInteractive()
    } else {
      await runDirect(args)
    }
  } catch (err) {
    console.log()
    console.log(c.red(`✗ ${err.message}`))
    process.exit(1)
  }
}

main()
