module.exports = {
  TokenReaders: require('./token-readers'),
  create (tokenReaders = [], { discardInvalid = true } = {}) {
    return Object.create(this).init(tokenReaders, { discardInvalid })
  },
  init (tokenReaders, { discardInvalid } = {}) {
    this.tokenReaders = tokenReaders
    this.discardInvalid = discardInvalid
    return this
  },
  tokenize (text) {
    let index = 0
    let c = text[index]
    const tokens = []
    const tokenReaders = this.tokenReaders
    const discardInvalid = this.discardInvalid

    const getLine = () => {
      return (text.substr(0, index).match(/\r\n|\n|\r/g) || [])
        .filter(Boolean).length + 1
    }

    const getColumn = () => {
      const m = /\r\n|\n|\r/.exec(
        text.substr(0, index).split('').reverse().join('')
      )
      if (m) {
        return m.index + 1
      } else {
        return index + 1
      }
    }

    const advance = (count = 1) => {
      index += count
      return (c = text[index])
    }

    const ctx = Object.freeze({
      advance,
      get c () { return c },
      get index () { return index }
    })

    const assign = Object.assign

    while (c) {
      let reader = tokenReaders.find(t => t.test(text, index))

      if (reader) {
        const range = { start: index, end: 0 }
        const line = getLine()
        const column = getColumn()
        const token = reader.read(text, ctx)

        if (token && (!discardInvalid || (discardInvalid && token.valid))) {
          range.end = index
          const raw = text.substring(range.start, range.end)
          tokens.push(assign({}, token, { range, raw, line, column }))
        } else {
          c = advance()
        }
      } else {
        c = advance()
      }
    }

    return tokens
  }
}
