import parse from '../index.js'
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

describe('num', () => {
  test('nums', () => {
    const argv = parse([
      '-x',
      '1234',
      '-y',
      '5.67',
      '-z',
      '1e7',
      '-w',
      '10f',
      '--hex',
      '0xdeadbeef',
      '789',
    ])
    assert.deepEqual(argv, {
      x: 1234,
      y: 5.67,
      z: 1e7,
      w: '10f',
      hex: 0xdeadbeef,
      _: [789],
    })
    assert.equal(typeof argv.x, 'number')
    assert.equal(typeof argv.y, 'number')
    assert.equal(typeof argv.z, 'number')
    assert.equal(typeof argv.w, 'string')
    assert.equal(typeof argv.hex, 'number')
    assert.equal(typeof argv._[0], 'number')
  })

  test('already a number', () => {
    // @ts-expect-error - wrong argument types
    const argv = parse(['-x', 1234, 789])
    assert.deepEqual(argv, { x: 1234, _: [789] })
    assert.equal(typeof argv.x, 'number')
    assert.equal(typeof argv._[0], 'number')
  })
})
