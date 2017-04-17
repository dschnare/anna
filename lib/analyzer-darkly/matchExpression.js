module.exports = function matchExpression (tokens, clause) {
  const tokenCount = tokens.length
  const expressions = []
  const stack = [ { clause, t: 0 } ]

  while (stack.length) {
    let { clause, t } = stack.shift()
    const clauseCount = clause.length
    let expr = []
    let c = 0
    const wildContext = { nextClauseIndex: 0, exprLen: 0, wild: false }

    while (c < clauseCount && t < tokenCount) {
      let ctoken = clause[c]

      if (ctoken === '*') {
        c += 1
        wildContext.nextClauseIndex = c
        wildContext.exprLen = expr.length
        wildContext.wild = true
        continue
      }

      const keys = Object.keys(ctoken).filter(key => key[0] !== '$')
      const tags = Object.keys(ctoken)
        .filter(key => key[0] === '$')
        .reduce((o, key) => Object.assign(o, { [key]: ctoken[key] }), {})

      const token = tokens[t]
      if (token && keys.every(key => token[key] === ctoken[key])) {
        expr.push(Object.assign({}, token, tags))
        c += 1
        t += 1
      } else if (wildContext.wild) {
        // Retroactively remove the tags from the tokens that matched before the
        // wildcard clause token was encountered.
        expr.slice(wildContext.exprLen).forEach(token => {
          Object.keys(token).forEach(key => {
            if (key[0] === '$') delete token[key]
          })
          return token
        })
        expr.push(Object.assign({}, token))
        c = wildContext.nextClauseIndex
        t += 1
      } else {
        c = 0
        t += 1
        expr = []
      }
    }

    if (expr.length) {
      expressions.push(expr)
      stack.push({ clause, t })
    }
  }

  return expressions
}
