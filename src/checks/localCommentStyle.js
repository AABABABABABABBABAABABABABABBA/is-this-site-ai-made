const FILLER_COMMENT = /\/\/\s*(this (ensures|function|makes sure)|note:|make sure to|in order to|here we|now we|first,? we|let'?s)/i

export function checkLocalCommentStyle({ local }) {
  if (!local || local.sourceFiles.length === 0) return null

  let fillerCount = 0
  let totalComments = 0
  const sampleFiles = new Set()

  for (const file of local.sourceFiles) {
    const comments = file.text.match(/\/\/[^\n]*/g) || []
    totalComments += comments.length
    for (const comment of comments) {
      if (FILLER_COMMENT.test(comment)) {
        fillerCount++
        sampleFiles.add(file.filePath)
      }
    }
  }

  if (totalComments < 10) {
    return { id: 'local-comment-style', label: 'AI-style filler comments', weight: 0, hit: false, evidence: [] }
  }

  const ratio = fillerCount / totalComments
  const hit = ratio >= 0.15 && fillerCount >= 5

  return {
    id: 'local-comment-style',
    label: 'AI-style filler comments ("this ensures...", "make sure to...")',
    weight: hit ? 12 : 0,
    hit,
    evidence: hit ? [`${fillerCount}/${totalComments} comments match filler phrasing across ${sampleFiles.size} files`] : [],
  }
}
