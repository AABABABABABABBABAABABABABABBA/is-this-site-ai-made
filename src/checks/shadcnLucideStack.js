const LUCIDE_CLASS = /class="[^"]*\blucide\b[^"]*lucide-[a-z-]+/i
const SHADCN_TOKENS = /disabled:pointer-events-none[^"]*disabled:opacity-50/i
const SHADCN_RING = /focus-visible:ring-ring|ring-offset-background/i

export function checkShadcnLucideStack({ html }) {
  const hasLucide = LUCIDE_CLASS.test(html)
  const hasShadcnTokens = SHADCN_TOKENS.test(html)
  const hasShadcnRing = SHADCN_RING.test(html)

  const hitCount = [hasLucide, hasShadcnTokens, hasShadcnRing].filter(Boolean).length
  const evidence = []
  if (hasLucide) evidence.push('lucide-react icon class names found')
  if (hasShadcnTokens) evidence.push('shadcn/ui default disabled-state utility classes found verbatim')
  if (hasShadcnRing) evidence.push('shadcn/ui default focus-ring utility classes found verbatim')

  return {
    id: 'shadcn-lucide-stack',
    label: 'default shadcn/ui + lucide-react scaffold (common v0/Lovable/Bolt output)',
    weight: 18,
    hit: hitCount >= 2,
    evidence,
  }
}
