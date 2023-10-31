import parse from '../index.js'
import test from 'node:test'
import assert from 'node:assert/strict'

test('flag boolean true (default all --args to boolean)', () => {
  const argv = parse(['moo', '--honk', 'cow'], {
    boolean: true,
  })

  assert.deepEqual(argv, {
    honk: true,
    _: ['moo', 'cow'],
  })

  assert.deepEqual(typeof argv.honk, 'boolean')

})

test('flag boolean true only affects double hyphen arguments without equals signs', () => {
  const argv = parse(['moo', '--honk', 'cow', '-p', '55', '--tacos=good'], {
    boolean: true,
  })

  assert.deepEqual(argv, {
    honk: true,
    tacos: 'good',
    p: 55,
    _: ['moo', 'cow'],
  })

  assert.deepEqual(typeof argv.honk, 'boolean')

})
