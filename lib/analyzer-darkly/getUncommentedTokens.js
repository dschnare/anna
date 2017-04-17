module.exports = function getUncommentedTokens (tokens) {
  const comments = tokens.filter(t => t.type === 'comment')
  return tokens.filter(t => {
    return !comments.some(c => {
      return t.range.start >= c.range.start &&
        t.range.start <= c.range.end
    })
  })
}
