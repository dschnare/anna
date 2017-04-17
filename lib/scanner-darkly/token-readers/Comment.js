module.exports = {
  create ({ delimiter = '//' } = {}) {
    return Object.create(this).init(delimiter)
  },
  init (delimiter) {
    this.delimiter = delimiter
    return this
  },
  test (text, index) {
    return text.substr(index, this.delimiter.length) === this.delimiter
  },
  read (text, ctx) {
    let buffer = ''

    // advance past the delimiter
    let c = ctx.advance(this.delimiter.length)

    while (c) {
      if (c === '\n' || text.substr(ctx.index, 2) === '\r\n' || c === '\r') {
        ctx.advance(text.substr(ctx.index, 2) === '\r\n' ? 2 : 1)
        break
      } else {
        buffer += c
        c = ctx.advance()
      }
    }

    return { type: 'comment', value: buffer, valid: true }
  }
}
