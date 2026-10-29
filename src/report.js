import { c } from './colors.js'
import { printSectionRule, width } from './banner.js'

const BAR_WIDTH = 40

function colorFn(color) {
  return c[color] || c.white
}

function scoreBar(score, color) {
  const filled = Math.round((score / 100) * BAR_WIDTH)
  const bar = '█'.repeat(filled) + '░'.repeat(BAR_WIDTH - filled)
  return colorFn(color)(bar)
}

function printHit(result) {
  const paint = result.weight >= 25 ? c.red : c.yellow
  console.log(`  ${paint('●')} ${result.label} ${c.gray(`(+${result.weight})`)}`)
  for (const line of result.evidence.slice(0, 4)) {
    console.log(c.gray(`      ↳ ${line}`))
  }
}

function printMiss(result) {
  console.log(c.gray(`  ○ ${result.label}`))
}

export function printReport({ target, results, scored }) {
  const { score, verdict, color, hits, misses, informational } = scored

  console.log()
  printSectionRule('target')
  console.log(`  ${target}`)
  console.log()

  printSectionRule('verdict')
  console.log(`  ${scoreBar(score, color)}  ${colorFn(color)(c.bold(`${score}/100`))}`)
  console.log(`  ${colorFn(color)(verdict)}`)
  console.log()

  if (hits.length > 0) {
    printSectionRule(`signals found (${hits.length})`)
    for (const hit of hits) printHit(hit)
    console.log()
  }

  if (misses.length > 0) {
    printSectionRule(`checked clean (${misses.length})`)
    for (const miss of misses) printMiss(miss)
    console.log()
  }

  if (informational.length > 0) {
    printSectionRule('informational')
    for (const info of informational) {
      const mark = info.hit ? c.cyan('i') : c.gray('i')
      console.log(`  ${mark} ${info.label}`)
      for (const line of info.evidence.slice(0, 5)) {
        console.log(c.gray(`      ↳ ${line}`))
      }
    }
    console.log()
  }

  printSectionRule('reality check')
  const note = [
    'this only finds signals someone left behind: badges, default scaffolding,',
    'generator tags, boilerplate copy. a motivated person can strip every one',
    'of these before shipping, so a clean scan means "no traces found," not',
    '"definitely human-made." treat the score as a lead, not a verdict.',
  ]
  for (const line of note) console.log(c.gray('  ' + line))
  console.log()
  console.log(c.gray('─'.repeat(width() + 2)))
  console.log()
}
