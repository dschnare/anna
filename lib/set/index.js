const merge = require('../merge')

const stratPat = /\[(?:\+\+|\+|=)\]|\{=?\}|=$/

module.exports = function set (obj, path, value, { arrayMergeStrategy = 'concat' } = {}) {
  const [ strategyToken ] = (stratPat.exec(path) || [''])
  const keys = path.replace(stratPat, '').split('[').map(p => {
    if (p.endsWith(']')) {
      return p.replace(']', '').trim().replace(/^['"]|['"]$/g, '')
    } else {
      return p.split('.')
    }
  }).reduce((a, b) => a.concat(b), []).filter(Boolean)

  switch (strategyToken) {
    case '[++]':
      arrayMergeStrategy = 'concat'
      break
    case '[+]':
      arrayMergeStrategy = 'append'
      break
    case '[=]':
      arrayMergeStrategy = 'replace'
      break
  }

  const name = keys.pop()
  let o = obj
  let key = ''

  while (keys.length) {
    key = keys.shift()
    if (!(key in o)) o[key] = {}
    o = o[key]
  }

  if (strategyToken[0] === '[' && !Array.isArray(o[name])) {
    o[name] = []
  } else if (strategyToken === '{=}' || strategyToken === '=') {
    o[name] = value
    return o
  }

  return merge(o, { [name]: value }, { arrayMergeStrategy })
}
