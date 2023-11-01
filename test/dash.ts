import parse from '../index.js'
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

describe('dash', () => {
  test('-', () => {
    assert.deepEqual(parse(['-n', '-']), { n: '-', _: [] })
    assert.deepEqual(parse(['--nnn', '-']), { nnn: '-', _: [] })
    assert.deepEqual(parse(['-']), { _: ['-'] })
    assert.deepEqual(parse(['-f-']), { f: '-', _: [] })
    assert.deepEqual(parse(['-b', '-'], { boolean: 'b' }), {
      b: true,
      _: ['-'],
    })
    assert.deepEqual(parse(['-s', '-'], { string: 's' }), { s: '-', _: [] })
  })

  test('-a -- b', () => {
    assert.deepEqual(parse(['-a', '--', 'b']), { a: true, _: ['b'] })
    assert.deepEqual(parse(['--a', '--', 'b']), { a: true, _: ['b'] })
  })

  test('move arguments after the -- into their own `--` array', () => {
    assert.deepEqual(
      parse(['--name', 'John', 'before', '--', 'after'], { '--': true }),
      { name: 'John', _: ['before'], '--': ['after'] }
    )
  })

  test('--- option value', () => {
    // A multi-dash value is largely an edge case, but check the behaviour is as expected,
    // and in particular the same for short option and long option (as made consistent in Jan 2023).

    assert.deepEqual(parse(['-n', '---']), { n: '---', _: [] })
    assert.deepEqual(parse(['--nnn', '---']), { nnn: '---', _: [] })
  })
})
