import parse from '../index.js'
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

describe('short', function () {
  test('numeric short args', () => {
    assert.deepEqual(parse(['-n123']), { n: 123, _: [] })
    assert.deepEqual(parse(['-123', '456']), {
      1: true,
      2: true,
      3: 456,
      _: [],
    })
  })

  test('short', () => {
    assert.deepEqual(parse(['-b']), { b: true, _: [] }, 'short boolean')
    assert.deepEqual(
      parse(['foo', 'bar', 'baz']),
      { _: ['foo', 'bar', 'baz'] },
      'bare'
    )
    assert.deepEqual(
      parse(['-cats']),
      { c: true, a: true, t: true, s: true, _: [] },
      'group'
    )
    assert.deepEqual(
      parse(['-cats', 'meow']),
      { c: true, a: true, t: true, s: 'meow', _: [] },
      'short group next'
    )
    assert.deepEqual(
      parse(['-h', 'localhost']),
      { h: 'localhost', _: [] },
      'short capture'
    )
    assert.deepEqual(
      parse(['-h', 'localhost', '-p', '555']),
      { h: 'localhost', p: 555, _: [] },
      'short captures'
    )
  })

  test('mixed short bool and capture', () => {
    assert.deepEqual(parse(['-h', 'localhost', '-fp', '555', 'script.js']), {
      f: true,
      p: 555,
      h: 'localhost',
      _: ['script.js'],
    })
  })

  test('short and long', () => {
    assert.deepEqual(parse(['-h', 'localhost', '-fp', '555', 'script.js']), {
      f: true,
      p: 555,
      h: 'localhost',
      _: ['script.js'],
    })
  })
})
