const merge = require('../merge')

module.exports = function set (obj, path, value, { arrayMergeStrategy = 'concat' } = {}) {
  const keys = path.split('[').map(p => {
    if (p.endsWith(']')) {
      return p.replace(']', '').trim().replace(/^['"]|['"]$/g, '')
    } else {
      return p.split('.')
    }
  }).reduce((a, b) => a.concat(b), [])

  const name = keys.pop()
  let o = obj
  let key = ''

  while (keys.length) {
    key = keys.shift()
    if (!(key in o)) o[key] = {}
    o = o[key]
  }

  return merge(o, { [name]: value }, { arrayMergeStrategy })
}
