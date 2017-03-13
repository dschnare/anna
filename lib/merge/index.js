module.exports = function merge (dest, src, { arrayMergeStrategy = 'concat' } = {}) {
  const stack = [ dest, src ]

  while (stack.length) {
    const src = stack.pop()
    const dest = stack.pop()

    for (let key in src) {
      const srcValue = src[key]
      const destValue = dest[key]

      if (Array.isArray(destValue)) {
        switch (arrayMergeStrategy) {
          case 'concat':
            dest[key] = destValue.concat(srcValue)
            break
          case 'replace':
          default:
            dest[key] = srcValue
            break
        }
      } else if (destValue &&
          Object(destValue) === destValue &&
          Object(srcValue) === srcValue) {
        stack.push(destValue, srcValue)
      } else {
        dest[key] = srcValue
      }
    }
  }

  return dest
}
