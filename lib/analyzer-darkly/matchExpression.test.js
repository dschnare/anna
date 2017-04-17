const assert = require('assert')
const matchExpression = require('./matchExpression')

const val = value => ({ value })
const tok = (type, value) => ({ type, value })

describe('analyzer-darkly#matchExpression', function () {
  it('should not match when given a clause that cannot be matched', function () {
    const tokens = [
      val('a'),
      tok('string', 'c'),
      tok('number', 45),
      val('a'),
      val('b')
    ]
    const expressions = matchExpression(tokens, [
      val('nope')
    ])
    assert.strictEqual(expressions.length, 0, 'Expressions is not empty')
  })

  it('should match clauses and set tags on expression tokens', function () {
    const tokens = [
      val('a'),
      tok('string', 'c'),
      tok('number', 45),
      val('a'),
      val('b'),
      tok('string', 'c'),
      tok('number', 45),
      val('a'),
      val('b')
    ]
    const $key = {}
    const expressions = matchExpression(tokens, [
      { value: 'a', $key, $d: 15 },
      { value: 'b', $key }
    ])
    assert.deepStrictEqual(expressions, [
      [
        { value: 'a', $key, $d: 15 },
        { value: 'b', $key }
      ],
      [
        { value: 'a', $key, $d: 15 },
        { value: 'b', $key }
      ]
    ])
    assert.strictEqual(expressions[0][0].$key, $key)
    assert.strictEqual(expressions[0][1].$key, $key)
    assert.strictEqual(expressions[1][0].$key, $key)
    assert.strictEqual(expressions[1][1].$key, $key)
  })

  it('should match expressions with "*" wildcards', function () {
    const tokens = [
      val('a'),
      tok('string', 'c'),
      tok('number', 45),
      // <button id="cta">Click me</button>
      val('<'),
      val('button'),
      val('id'),
      val('='),
      tok('string', 'cta'),
      val('>'),
      // Click Me
      val('<'),
      val('/'),
      val('button'),
      val('>'),
      // --
      val('biff'),
      tok('number', 45)
    ]
    const expressions = matchExpression(tokens, [
      { value: '<' },
      { value: 'button' },
      '*',
      { value: '>' }
    ])
    assert.deepStrictEqual(expressions, [
      [
        { value: '<' },
        { value: 'button' },
        { value: 'id' },
        { value: '=' },
        { type: 'string', value: 'cta' },
        { value: '>' }
      ]
    ])
  })

  it('should match complex expressions with "*" wildcards', function () {
    const tokens = [
      val('a'),
      tok('string', 'c'),
      tok('number', 45),
      // <script type="text/javascript">window.c = a < b</script>
      val('<'),
      val('script'),
      val('type'),
      val('='),
      tok('string', 'text/javascript'),
      val('>'),
      val('window'),
      val('.'),
      val('c'),
      val('='),
      val('a'),
      val('<'),
      val('b'),
      val('<'),
      val('/'),
      val('script'),
      val('>'),
      // --
      val('biff'),
      tok('number', 45),
      // <script>window.c = a < b</script>
      val('<'),
      val('script'),
      val('>'),
      val('window'),
      val('.'),
      val('c'),
      val('='),
      val('a'),
      val('<'),
      val('b'),
      val('<'),
      val('/'),
      val('script'),
      val('>')
    ]
    const expressions = matchExpression(tokens, [
      { value: '<' },
      { value: 'script' },
      '*',
      { value: '>', $start: 'start' },
      '*',
      { value: '<', $end: 'end' },
      { value: '/' },
      { value: 'script' },
      { value: '>' }
    ])
    assert.deepStrictEqual(expressions, [
      [
        { value: '<' },
        { value: 'script' },
        { value: 'type' },
        { value: '=' },
        { type: 'string', value: 'text/javascript' },
        { value: '>', $start: 'start' },
        // --- window.c = a < b
        { value: 'window' },
        { value: '.' },
        { value: 'c' },
        { value: '=' },
        { value: 'a' },
        { value: '<' },
        { value: 'b' },
        // --- </script>
        { value: '<', $end: 'end' },
        { value: '/' },
        { value: 'script' },
        { value: '>' }
      ],
      [
        { value: '<' },
        { value: 'script' },
        { value: '>', $start: 'start' },
        // --- window.c = a < b
        { value: 'window' },
        { value: '.' },
        { value: 'c' },
        { value: '=' },
        { value: 'a' },
        { value: '<' },
        { value: 'b' },
        // --- </script>
        { value: '<', $end: 'end' },
        { value: '/' },
        { value: 'script' },
        { value: '>' }
      ]
    ])
  })
})
