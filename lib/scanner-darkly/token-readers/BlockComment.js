module.exports = {
  create ({ delimiters = [ '/*', '*/' ] } = {}) {
    return Object.create(this).init(delimiters)
  },
  init (delimiters) {
    this.delimiters = delimiters.slice()
    return this
  },
  test (text, index) {
    const [ ldelim ] = this.delimiters
    return text.substr(index, ldelim.length) === ldelim
  },
  read (text, ctx) {
    let buffer = ''
    let valid = false
    const [ ldelim, rdelim ] = this.delimiters

    // advance past left delimiter
    let c = ctx.advance(ldelim.length)

    while (c) {
      if (text.substr(ctx.index, rdelim.length) === rdelim) {
        ctx.advance(2)
        valid = true
        break
      } else {
        buffer += c
        c = ctx.advance()
      }
    }

    return { type: 'comment', block: true, value: buffer, valid }
  }
}
