#!/usr/bin/env node
import { printBanner } from '../src/banner.js'
import { printReport } from '../src/report.js'
import { askText, askYesNo, closePrompt } from '../src/prompt.js'
import { scanUrl, scanLocalPath, looksLikeLocalPath } from '../src/app.js'
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

  const deep = await askYesNo('run a deep scan? (also pulls linked JS/CSS)', true)
  closePrompt()
  console.log()
  const result = await scanUrl(input, { deep })
  printReport(result)
}

async function runDirect(args) {
  const deep = !args.includes('--no-deep')
  const target = args.find(a => !a.startsWith('--'))

  printBanner()
  console.log()

  if (looksLikeLocalPath(target)) {
    const result = await scanLocalPath(target)
    printReport(result)
    return
  }

  const result = await scanUrl(target, { deep })
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
