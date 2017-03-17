module.exports = function (wallaby) {
  return {
    env: {
      type: 'node'
    },
    testFramework: 'mocha',
    files: [
      'lib/**/*.js',
      {
        instrument: false,
        pattern: 'fixtures/**/*.*'
      },
      {
        ignore: true,
        pattern: 'lib/**/*.test.js'
      }
    ],
    tests: [
      'lib/**/*.test.js'
    ]
  }
}
