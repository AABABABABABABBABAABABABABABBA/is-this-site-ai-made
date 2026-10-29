const AI_BOTS = ['GPTBot', 'ChatGPT-User', 'CCBot', 'Google-Extended', 'ClaudeBot', 'anthropic-ai', 'Bytespider']

export function checkRobotsAiCrawlers({ robotsTxt }) {
  if (!robotsTxt) return null

  const lines = robotsTxt.split('\n').map(l => l.trim())
  const mentions = []
  let currentAgent = null

  for (const line of lines) {
    const agentMatch = line.match(/^user-agent:\s*(.+)/i)
    if (agentMatch) {
      currentAgent = agentMatch[1].trim()
      continue
    }
    const ruleMatch = line.match(/^(disallow|allow):\s*(.*)/i)
    if (ruleMatch && currentAgent && AI_BOTS.some(bot => bot.toLowerCase() === currentAgent.toLowerCase())) {
      mentions.push(`${currentAgent}: ${ruleMatch[1]} ${ruleMatch[2]}`.trim())
    }
  }

  return {
    id: 'robots-ai-crawlers',
    label: 'robots.txt rules for AI crawlers (informational, not scored)',
    weight: 0,
    hit: mentions.length > 0,
    informational: true,
    evidence: mentions,
  }
}
