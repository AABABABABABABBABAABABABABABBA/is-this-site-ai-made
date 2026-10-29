import fs from 'node:fs'
import path from 'node:path'

const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', '.vercel'])
const SOURCE_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte'])
const MAX_FILES = 200
const MAX_FILE_BYTES = 200_000

function walk(dir, files) {
  if (files.length >= MAX_FILES) return
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (files.length >= MAX_FILES) return
    if (entry.name.startsWith('.') && entry.name !== '.env') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue
      walk(full, files)
    } else if (SOURCE_EXT.has(path.extname(entry.name))) {
      files.push(full)
    }
  }
}

const HTML_CANDIDATES = ['dist/index.html', 'build/index.html', 'out/index.html', 'public/index.html', 'index.html']
const ROBOTS_CANDIDATES = ['public/robots.txt', 'static/robots.txt', 'robots.txt']

function readIfExists(root, relPath) {
  const full = path.join(root, relPath)
  if (!fs.existsSync(full) || !fs.statSync(full).isFile()) return null
  return fs.readFileSync(full, 'utf8')
}

export function loadLocalProject(rootDir) {
  const root = path.resolve(rootDir)
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    throw new Error(`not a directory: ${root}`)
  }

  let packageJson = null
  const pkgPath = path.join(root, 'package.json')
  if (fs.existsSync(pkgPath)) {
    try {
      packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    } catch {
      packageJson = null
    }
  }

  const filePaths = []
  walk(root, filePaths)

  const sourceFiles = filePaths.map(filePath => {
    const stat = fs.statSync(filePath)
    if (stat.size > MAX_FILE_BYTES) return { filePath, text: '' }
    return { filePath, text: fs.readFileSync(filePath, 'utf8') }
  })

  let builtHtml = null
  for (const candidate of HTML_CANDIDATES) {
    builtHtml = readIfExists(root, candidate)
    if (builtHtml) break
  }

  let robotsTxt = null
  for (const candidate of ROBOTS_CANDIDATES) {
    robotsTxt = readIfExists(root, candidate)
    if (robotsTxt) break
  }

  return { root, packageJson, sourceFiles, builtHtml, robotsTxt }
}
