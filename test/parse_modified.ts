import parse from '../index.js'
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('parse with modifier functions', () => {
  const argv = parse(['-b', '123'], { boolean: 'b' })
  assert.deepEqual(argv, { b: true, _: [123] })
})
