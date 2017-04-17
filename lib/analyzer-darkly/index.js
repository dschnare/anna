const matchExpression = require('./matchExpression')
const getUncommentedTokens = require('./getUncommentedTokens')

module.exports = {
  create () {
    return Object.create(this).init()
  },
  init () {
    return this
  },
  matchExpression,
  getUncommentedTokens
}
