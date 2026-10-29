import { c } from './colors.js'

const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export async function runStep(label, fn) {
  const isTTY = process.stdout.isTTY
  const start = Date.now()
  let frame = 0
  let timer = null

  if (isTTY) {
    process.stdout.write(`${c.cyan(frames[0])} ${label}`)
    timer = setInterval(() => {
      frame = (frame + 1) % frames.length
      process.stdout.write(`\r${c.cyan(frames[frame])} ${label}`)
    }, 80)
  } else {
    process.stdout.write(`… ${label}\n`)
  }

  let result
  let failed = false
  try {
    result = await fn()
  } catch (err) {
    failed = true
    result = err
  }

  const ms = Date.now() - start
  if (timer) clearInterval(timer)

  if (isTTY) {
    const mark = failed ? c.red('✗') : c.green('✓')
    process.stdout.write(`\r${mark} ${label} ${c.gray(`(${ms}ms)`)}\n`)
  } else {
    const mark = failed ? 'x' : 'ok'
    process.stdout.write(`${mark} ${label} (${ms}ms)\n`)
  }

  if (failed) throw result
  return result
}
