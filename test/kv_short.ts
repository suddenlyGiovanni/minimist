import parse from '../index.js'
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

describe('key value short', () => {
  test('short -k=v', () => {
    const argv = parse(['-b=123'])
    assert.deepEqual(argv, { b: 123, _: [] })
  })

  test('multi short -k=v', () => {
    const argv = parse(['-a=whatever', '-b=robots'])
    assert.deepEqual(argv, { a: 'whatever', b: 'robots', _: [] })
  })

  test('short with embedded equals -k=a=b', () => {
    const argv = parse(['-k=a=b'])
    assert.deepEqual(argv, { k: 'a=b', _: [] })
  })

  test('short with later equals like -ab=c', () => {
    const argv = parse(['-ab=c'])
    assert.deepEqual(argv, { a: true, b: 'c', _: [] })
  })
})
