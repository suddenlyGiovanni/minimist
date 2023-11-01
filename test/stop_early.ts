import parse from '../index.js'
import { test } from 'node:test'
import assert from 'node:assert/strict'

test('stops parsing on the first non-option when stopEarly is set', () => {
  const argv = parse(['--aaa', 'bbb', 'ccc', '--ddd'], {
    stopEarly: true,
  })

  assert.deepEqual(argv, {
    aaa: 'bbb',
    _: ['ccc', '--ddd'],
  })
})
