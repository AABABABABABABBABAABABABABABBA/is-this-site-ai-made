const AI_DEPS = [
  'lovable-tagger',
  '@builder.io/ai',
  'v0-sdk',
  '@v0/sdk',
  'bolt-diy',
]

export function checkLocalPackageDeps({ local }) {
  if (!local || !local.packageJson) return null

  const deps = {
    ...(local.packageJson.dependencies || {}),
    ...(local.packageJson.devDependencies || {}),
  }
  const found = AI_DEPS.filter(dep => dep in deps)

  return {
    id: 'local-package-deps',
    label: 'AI-builder package left in package.json',
    weight: found.length > 0 ? 25 : 0,
    hit: found.length > 0,
    evidence: found,
  }
}
