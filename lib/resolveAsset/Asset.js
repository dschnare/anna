exports.Asset = {
  create (url, fileName = null) {
    return Object.create(this).init(url, fileName)
  },
  init (url, fileName = null) {
    this.assetUrl = url
    this.assetFile = fileName || null
    return this
  },
  get fileName () {
    return this.assetFile
  },
  toString () {
    // Must not look like an absolute path so we prefix it with '#'.
    return '#' + [ this.fileName, this.assetUrl ].join('@')
  }
}
