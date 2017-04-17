module.exports = {
  create ({ multilineQuote } = {}) {
    return Object.create(this).init(multilineQuote)
  },
  init (multilineQuote) {
    this.multilineQuote = multilineQuote
    return this
  },
  test (text, index) {
    const c = text[index]
    const mlq = this.multilineQuote
    return c === '"' || c === "'" ||
      (mlq && text.substr(index, mlq.length) === mlq)
  },
  read (text, ctx) {
    let buffer = ''
    let c = ctx.c
    let quote = c
    let isTerminated = false
    const mlq = this.multilineQuote

    if (mlq && text.substr(ctx.index, mlq.length) === mlq) {
      quote = mlq
      c = ctx.advance(mlq.length)
    }

    const multiline = quote === mlq

    c = ctx.advance()

    while (c) {
      if (!multiline &&
          (c === '\n' || text.substr(ctx.index, 2) === '\r\n' || c === '\r')) {
        break
      } else if (c === '\\') {
        c = ctx.advance()
        if (!c) {
          isTerminated = false
          break
        }
        switch (c) {
          case 'b':
            c = '\b'
            break
          case 'f':
            c = '\f'
            break
          case 'n':
            c = '\n'
            break
          case 'r':
            c = '\r'
            break
          case 't':
            c = '\t'
            break
          case 'u':
            if (ctx.index >= text.len) {
              isTerminated = false
            }
            c = parseInt(text.substr(ctx.index + 1, 4), 16)
            if (!isFinite(c) || c < 0) {
              isTerminated = false
            }
            c = String.fromCharCode(c)
            ctx.advance(4)
            break
        }
        buffer += c
        c = ctx.advance()
      } else if (c === quote) {
        isTerminated = true
        c = ctx.advance()
        break
      } else {
        buffer += c
        c = ctx.advance()
      }
    }

    return { type: 'string', value: buffer, valid: isTerminated }
  }
}
