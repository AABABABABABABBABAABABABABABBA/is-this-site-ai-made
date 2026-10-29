import readline from 'node:readline'
import { c, geminiGradient } from './colors.js'

let rl = null
const pendingLines = []
const waiters = []

function session() {
  if (rl) return rl
  rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  rl.on('line', line => {
    const waiter = waiters.shift()
    if (waiter) waiter(line)
    else pendingLines.push(line)
  })
  return rl
}

function nextLine() {
  if (pendingLines.length > 0) return Promise.resolve(pendingLines.shift())
  return new Promise(resolve => waiters.push(resolve))
}

async function ask(prompt) {
  process.stdout.write(prompt)
  const line = await nextLine()
  return line.trim()
}

export async function askText(label) {
  session()
  return ask(`${c.gray('╭─')} ${label}\n${c.gray('╰─')} ${geminiGradient('> ')}`)
}

export async function askYesNo(label, defaultYes = true) {
  session()
  const hint = defaultYes ? 'Y/n' : 'y/N'
  const answer = await ask(`${c.gray('?')} ${label} ${c.gray(`(${hint})`)} `)
  if (answer === '') return defaultYes
  return answer.toLowerCase().startsWith('y')
}

export function closePrompt() {
  if (rl) rl.close()
}
