module.exports = function matchExpression (tokens, clause) {
  const tokenCount = tokens.length
  const expressions = []
  const stack = [ { clause, t: 0 } ]
  const objAssign = Object.assign
  const objKeys = Object.keys

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

      const keys = objKeys(ctoken).filter(key => key[0] !== '$')
      const tags = objKeys(ctoken)
        .filter(key => key[0] === '$')
        .reduce((o, key) => objAssign(o, { [key]: ctoken[key] }), {})

      const token = tokens[t]
      if (token && keys.every(key => token[key] === ctoken[key])) {
        expr.push(objAssign({}, token, tags))
        c += 1
        t += 1
      } else if (wildContext.wild) {
        // Retroactively remove the tags from the tokens that matched before the
        // wildcard clause token was encountered.
        expr.slice(wildContext.exprLen).forEach(token => {
          objKeys(token).forEach(key => {
            if (key[0] === '$') delete token[key]
          })
          return token
        })
        expr.push(objAssign({}, token))
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
