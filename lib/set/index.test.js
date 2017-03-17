const assert = require('assert')
const set = require('.')

describe('set', function () {
  it('should set a path', function () {
    const o = set({}, 'a.b.c', 4)
    assert.deepStrictEqual(o, {
      a: {
        b: {
          c: 4
        }
      }
    })
  })

  it('should keep existing objects in the path in-tact and replace the last property name in the path', function () {
    const o = set({ a: { name: 'A', b: { name: 'B', c: 45 } } }, 'a.b.c', 4)
    assert.deepStrictEqual(o, {
      a: {
        name: 'A',
        b: {
          name: 'B',
          c: 4
        }
      }
    })
  })

  it('should merge with the object associated with the last property in the path', function () {
    const o = set({ a: { name: 'A', b: { name: 'B', c: { name: 'C' } } } }, 'a.b.c', { value: 4 })
    assert.deepStrictEqual(o, {
      a: {
        name: 'A',
        b: {
          name: 'B',
          c: {
            name: 'C',
            value: 4
          }
        }
      }
    })
  })

  it('should concat to existing arrays (only for the last property name)', function () {
    const o = set({ a: { b: { c: [ 1, 2, 3 ] } } }, 'a.b.c', [ 4 ])
    assert.deepStrictEqual(o, {
      a: {
        b: {
          c: [ 1, 2, 3, 4 ]
        }
      }
    })
    const oo = set({ a: { b: { c: [ 1, 2, 3 ] } } }, 'a.b.c[++]', [ 4 ])
    assert.deepStrictEqual(oo, {
      a: {
        b: {
          c: [ 1, 2, 3, 4 ]
        }
      }
    })
    const ooo = set({ a: { b: { } } }, 'a.b.c[++]', [ 4, 5 ])
    assert.deepStrictEqual(ooo, {
      a: {
        b: {
          c: [ 4, 5 ]
        }
      }
    })
  })

  it('should set lsat property to array (if does not exist) and concat the value', function () {
    const o = set({ a: { b: {} } }, 'a.b.c[]', [ 4 ])
    assert.deepStrictEqual(o, {
      a: {
        b: {
          c: [ 4 ]
        }
      }
    })
  })

  it('should append to existing arrays (only for the last property name)', function () {
    const o = set({ a: { b: { c: [ 1, 2, 3 ] } } }, 'a.b.c[+]', [ 4 ])
    assert.deepStrictEqual(o, {
      a: {
        b: {
          c: [ 1, 2, 3, [ 4 ] ]
        }
      }
    })
    const oo = set({ a: { b: {} } }, 'a.b.c[+]', [ 4 ])
    assert.deepStrictEqual(oo, {
      a: {
        b: {
          c: [ [ 4 ] ]
        }
      }
    })
  })

  it('should replace existing arrays (only for the last property name)', function () {
    const o = set({ a: { b: { c: [ 1, 2, 3 ] } } }, 'a.b.c[=]', 4)
    assert.deepStrictEqual(o, {
      a: {
        b: {
          c: 4
        }
      }
    })
    const oo = set({ a: { b: { c: [ 1, 2, 3 ] } } }, 'a.b.c=', 4)
    assert.deepStrictEqual(oo, {
      a: {
        b: {
          c: 4
        }
      }
    })
    const ooo = set({ a: { b: { c: [ 1, 2, 3 ] } } }, 'a.b.c{=}', 4)
    assert.deepStrictEqual(ooo, {
      a: {
        b: {
          c: 4
        }
      }
    })
  })
})
