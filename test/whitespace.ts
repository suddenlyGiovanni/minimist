import parse from '../index.js'
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('whitespace should be whitespace', () => {
  const x = parse(['-x', '\t'])['x']
  assert.equal(x, '\t')
})
