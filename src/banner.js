import { c, geminiGradient } from './colors.js'

const WIDTH = 64

function hr(char = '─') {
  return char.repeat(WIDTH)
}

export function printBanner() {
  const title = 'IS THIS SITE AI MADE?'
  const pad = Math.max(0, Math.floor((WIDTH - title.length) / 2))
  console.log()
  console.log(c.gray('╭' + hr() + '╮'))
  console.log(c.gray('│') + ' '.repeat(WIDTH) + c.gray('│'))
  console.log(
    c.gray('│') +
      ' '.repeat(pad) +
      geminiGradient(title) +
      ' '.repeat(WIDTH - pad - title.length) +
      c.gray('│'),
  )
  console.log(c.gray('│') + ' '.repeat(WIDTH) + c.gray('│'))
  console.log(c.gray('╰' + hr() + '╯'))
  console.log(c.gray('  scans a live site or local project for AI-builder fingerprints'))
  console.log()
}

export function printSectionRule(label) {
  const text = ` ${label} `
  const left = 3
  const right = Math.max(0, WIDTH + 2 - left - text.length)
  console.log(c.gray(hr().slice(0, left) + text) + c.gray(hr().slice(0, right)))
}

export function width() {
  return WIDTH
}
