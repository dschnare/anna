module.exports = {
  create (words, tokenType) {
    return Object.create(this).init(words, tokenType)
  },
  init (words, tokenType) {
    this.words = words
    this.tokenType = tokenType
    return this
  },
  test (text, index) {
    return !!this.words
      .filter(w => text.substr(index, w.length) === w)
      .sort((a, b) => b.length - a.length)
      .shift()
  },
  read (text, ctx) {
    const word = this.words
      .filter(w => text.substr(ctx.index, w.length) === w)
      .sort((a, b) => b.length - a.length)
      .shift()

    ctx.advance(word.length)

    return { type: this.tokenType, value: word, valid: true }
  }
}
