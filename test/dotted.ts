import parse from '../index.js'
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

describe('dotted', () => {
  test('dotted alias', () => {
    const argv = parse(['--a.b', '22'], {
      default: { 'a.b': 11 },
      alias: { 'a.b': 'aa.bb' },
    })
    assert.equal(argv['a'].b, 22)
    assert.equal(argv['aa'].bb, 22)
  })

  test('dotted default', () => {
    // @ts-expect-error -- args should be string[]
    const argv = parse('', {
      default: { 'a.b': 11 },
      alias: { 'a.b': 'aa.bb' },
    })
    assert.equal(argv['a'].b, 11)
    assert.equal(argv['aa'].bb, 11)
  })

  test('dotted default with no alias', () => {
    // @ts-expect-error -- args should be string[]
    const argv = parse('', { default: { 'a.b': 11 } })
    assert.equal(argv.a.b, 11)
  })
})
