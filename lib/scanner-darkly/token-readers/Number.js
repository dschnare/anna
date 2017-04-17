const consumeDigits = ctx => {
  let buffer = ''
  let c = ctx.c
  while (c >= '0' && c <= '9') {
    buffer += c
    c = ctx.advance()
  }
  return buffer
}

module.exports = {
  create ({ exponent = true } = {}) {
    return Object.create(this).init(exponent)
  },
  init (exponent) {
    this.exponent = exponent
    return this
  },
  test (text, index) {
    const c = text[index]
    return c === '-' || (c >= '0' && c <= '9')
  },
  read (text, ctx) {
    let buffer = ''
    let valid = true
    let c = ctx.c

    if (c === '-') {
      buffer += c
      c = ctx.advance()
    }

    if (c === '0') {
      buffer += c
      c = ctx.advance()
    } else {
      buffer += consumeDigits(ctx)
    }

    if (c === '.') {
      buffer += c
      c = ctx.advance()

      if (c < '0' || c > '9') {
        valid = false
      } else {
        buffer += consumeDigits(ctx)
      }
    }

    if (valid && this.exponent && (c === 'e' || c === 'E')) {
      buffer += c
      c = ctx.advance()

      if (c === '+' || c === '-') {
        buffer += c
        c = ctx.advance()
      }

      if (c < '0' || c > '9') {
        valid = false
      } else {
        buffer += consumeDigits(ctx)
      }
    }

    return { type: 'number', valid, value: parseFloat(buffer) }
  }
}
