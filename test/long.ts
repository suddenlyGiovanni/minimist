import parse from '../index.js'
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

describe('long', () => {
  test('long opts', () => {
    assert.deepEqual(parse(['--bool']), { bool: true, _: [] }, 'long boolean')
    assert.deepEqual(
      parse(['--pow', 'xixxle']),
      { pow: 'xixxle', _: [] },
      'long capture sp'
    )
    assert.deepEqual(
      parse(['--pow=xixxle']),
      { pow: 'xixxle', _: [] },
      'long capture eq'
    )
    assert.deepEqual(
      parse(['--host', 'localhost', '--port', '555']),
      { host: 'localhost', port: 555, _: [] },
      'long captures sp'
    )
    assert.deepEqual(
      parse(['--host=localhost', '--port=555']),
      { host: 'localhost', port: 555, _: [] },
      'long captures eq'
    )
  })
})
