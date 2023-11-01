import parse from '../index.js'
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

/* eslint no-proto: 0 */

describe('proto pollution', () => {
  // Not pollution as such, but verify protections working as intended.
  test('trailing __proto__ key in dotted option ignored', (t) => {
    const argv = parse(['--a.__proto__', 'IGNORED'])
    assert.deepEqual(argv.a, {})
  })

  // Not pollution as such, but verify protections working as intended.
  test('trailing constructor key in dotted option ignored', (t) => {
    const argv = parse(['--a.constructor', 'IGNORED'])
    assert.deepEqual(argv.a, {})
  })

  test('proto pollution', () => {
    const argv = parse(['--__proto__.x', '123'])
    assert.equal({}?.x, undefined)
    assert.equal(argv['__proto__'].x, undefined)
    assert.equal(argv['x'], undefined)
  })

  test('proto pollution (array)', (t) => {
    const argv = parse(['--x', '4', '--x', '5', '--x.__proto__.z', '789'])
    assert.equal({}?.z, undefined)
    assert.deepEqual(argv['x'], [4, 5])
    assert.equal(argv['x'].z, undefined)
    assert.equal(argv['x'].__proto__.z, undefined)
  })

  test('proto pollution (number)', () => {
    const argv = parse(['--x', '5', '--x.__proto__.z', '100'])
    assert.equal({}.z, undefined)
    assert.equal((4).z, undefined)
    assert.equal(argv['x'], 5)
    assert.equal(argv['x'].z, undefined)
  })

  test('proto pollution (string)', () => {
    const argv = parse(['--x', 'abc', '--x.__proto__.z', 'def'])
    assert.equal({}.z, undefined)
    assert.equal('...'.z, undefined)
    assert.equal(argv['x'], 'abc')
    assert.equal(argv['x'].z, undefined)
  })

  test('proto pollution (constructor)', (t) => {
    const argv = parse(['--constructor.prototype.y', '123'])
    assert.equal({}.y, undefined)
    assert.equal(argv['y'], undefined)
  })

  test('proto pollution (constructor function)', () => {
    const argv = parse(['--_.concat.constructor.prototype.y', '123'])

    function fnToBeTested() {}

    assert.equal(fnToBeTested.y, undefined)
    assert.equal(argv['y'], undefined)
  })

  // powered by snyk - https://github.com/backstage/backstage/issues/10343
  test('proto pollution (constructor function) snyk', () => {
    const argv = parse(
      '--_.constructor.constructor.prototype.foo bar'.split(' ')
    )
    assert.equal(function () {}.foo, undefined)
    assert.equal(argv.y, undefined)
  })
})
