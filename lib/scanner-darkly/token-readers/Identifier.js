module.exports = {
  create () {
    return Object.create(this).init()
  },
  init (delimiters) {
    return this
  },
  test (text, index) {
    const c = text[index]
    return c === '$' || c === '_' || c === '@' ||
      (c >= 'a' && c <= 'z') ||
      (c >= 'A' && c <= 'Z')
  },
  read (text, ctx) {
    let id = ''
    let valid = true
    let c = ctx.c

    if (c === '$' || c === '_' || c === '@' ||
        (c >= 'a' && c <= 'z') ||
        (c >= 'A' && c <= 'Z')) {
      id += c
      c = ctx.advance()

      while (true) {
        if (c === '$' || c === '_' || c === '@' ||
            (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c >= '0' && c <= '9')) {
          id += c
          c = ctx.advance()
        } else {
          break
        }
      }

      return { type: 'identifier', value: id, valid }
    }
  }
}
