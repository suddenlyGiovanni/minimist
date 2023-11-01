import parse from '../index.js'
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

describe('unknown', () => {
  test('boolean and alias is not unknown', () => {
    const unknown: unknown[] = []

    function unknownFn<T>(arg: T): boolean {
      unknown.push(arg)
      return false
    }

    const aliased = ['-h', 'true', '--derp', 'true']
    const regular = ['--herp', 'true', '-d', 'true']
    const opts = {
      alias: { h: 'herp' },
      boolean: 'h',
      unknown: unknownFn,
    }
    parse(aliased, opts)
    parse(regular, opts)

    assert.deepEqual(unknown, ['--derp', '-d'])
  })

  test('flag boolean true any double hyphen argument is not unknown', () => {
    const unknown: unknown[] = []

    function unknownFn<T>(arg: T): boolean {
      unknown.push(arg)
      return false
    }

    const argv = parse(['--honk', '--tacos=good', 'cow', '-p', '55'], {
      boolean: true,
      unknown: unknownFn,
    })
    assert.deepEqual(unknown, ['--tacos=good', 'cow', '-p'])
    assert.deepEqual(argv, {
      honk: true,
      _: [],
    })
  })

  test('string and alias is not unknown', () => {
    const unknown: unknown[] = []

    function unknownFn<T>(arg: T): boolean {
      unknown.push(arg)
      return false
    }

    const aliased = ['-h', 'hello', '--derp', 'goodbye']
    const regular = ['--herp', 'hello', '-d', 'moon']
    const opts = {
      alias: { h: 'herp' },
      string: 'h',
      unknown: unknownFn,
    }
    parse(aliased, opts)
    parse(regular, opts)

    assert.deepEqual(unknown, ['--derp', '-d'])
  })

  test('default and alias is not unknown', () => {
    const unknown: unknown[] = []

    function unknownFn<T>(arg?: T): boolean {
      unknown.push(arg)
      return false
    }

    const aliased = ['-h', 'hello']
    const regular = ['--herp', 'hello']
    const opts = {
      default: { h: 'bar' },
      alias: { h: 'herp' },
      unknown: unknownFn,
    }
    parse(aliased, opts)
    parse(regular, opts)

    assert.deepEqual(unknown, [])

    unknownFn() // exercise fn for 100% coverage
  })

  test('value following -- is not unknown', () => {
    const unknown: unknown[] = []

    function unknownFn<T>(arg: T): boolean {
      unknown.push(arg)
      return false
    }

    const aliased = ['--bad', '--', 'good', 'arg']
    const opts = {
      '--': true,
      unknown: unknownFn,
    }
    const argv = parse(aliased, opts)

    assert.deepEqual(unknown, ['--bad'])
    assert.deepEqual(argv, {
      '--': ['good', 'arg'],
      _: [],
    })
  })
})
