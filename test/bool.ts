import parse from '../index.js'
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

describe('boolean', () => {
  test('flag boolean default false', () => {
    const argv = parse(['moo'], {
      boolean: ['t', 'verbose'],
      default: { verbose: false, t: false },
    })

    assert.deepEqual(argv, {
      verbose: false,
      t: false,
      _: ['moo'],
    })

    assert.deepEqual(typeof argv.verbose, 'boolean')
    assert.deepEqual(typeof argv.t, 'boolean')
  })

  test('boolean groups', function () {
    const argv = parse(['-x', '-z', 'one', 'two', 'three'], {
      boolean: ['x', 'y', 'z'],
    })

    assert.deepEqual(argv, {
      x: true,
      y: false,
      z: true,
      _: ['one', 'two', 'three'],
    })

    assert.equal(typeof argv.x, 'boolean')
    assert.equal(typeof argv.y, 'boolean')
    assert.equal(typeof argv.z, 'boolean')
  })

  test('boolean and alias with options hash', () => {
    const aliased = ['-h', 'derp']
    const regular = ['--herp', 'derp']
    const opts = {
      alias: { h: 'herp' },
      boolean: 'herp',
    }
    const aliasedArgv = parse(aliased, opts)
    const propertyArgv = parse(regular, opts)
    const expected = {
      herp: true,
      h: true,
      _: ['derp'],
    }
    assert.deepEqual(aliasedArgv, expected)
    assert.deepEqual(propertyArgv, expected)
  })

  test('boolean and alias array with options hash', () => {
    const aliased = ['-h', 'derp']
    const regular = ['--herp', 'derp']
    const alt = ['--harp', 'derp']
    const opts = {
      alias: { h: ['herp', 'harp'] },
      boolean: 'h',
    }
    const aliasedArgv = parse(aliased, opts)
    const propertyArgv = parse(regular, opts)
    const altPropertyArgv = parse(alt, opts)
    const expected = {
      harp: true,
      herp: true,
      h: true,
      _: ['derp'],
    }
    assert.deepEqual(aliasedArgv, expected)
    assert.deepEqual(propertyArgv, expected)
    assert.deepEqual(altPropertyArgv, expected)
  })

  test('boolean and alias using explicit true', () => {
    const aliased = ['-h', 'true']
    const regular = ['--herp', 'true']
    const opts = {
      alias: { h: 'herp' },
      boolean: 'h',
    }
    const aliasedArgv = parse(aliased, opts)
    const propertyArgv = parse(regular, opts)
    const expected = {
      herp: true,
      h: true,
      _: [],
    }

    assert.deepEqual(aliasedArgv, expected)
    assert.deepEqual(propertyArgv, expected)
  })

  // regression, see https://github.com/substack/node-optimist/issues/71
  test('boolean and --x=true', () => {
    let parsed = parse(['--boool', '--other=true'], {
      boolean: 'boool',
    })

    assert.equal(parsed['boool'], true)
    assert.equal(parsed['other'], 'true')

    parsed = parse(['--boool', '--other=false'], {
      boolean: 'boool',
    })

    assert.equal(parsed['boool'], true)
    assert.equal(parsed['other'], 'false')
  })

  test('boolean --boool=true', () => {
    const parsed = parse(['--boool=true'], {
      default: {
        boool: false,
      },
      boolean: ['boool'],
    })

    assert.equal(parsed['boool'], true)
  })

  test('boolean --boool=false', () => {
    const parsed = parse(['--boool=false'], {
      default: {
        boool: true,
      },
      boolean: ['boool'],
    })

    assert.equal(parsed['boool'], false)
  })

  test('boolean using something similar to true', () => {
    const opts = { boolean: 'h' }
    const result = parse(['-h', 'true.txt'], opts)
    const expected = {
      h: true,
      _: ['true.txt'],
    }

    assert.deepEqual(result, expected)
  })

  test('supplied default for boolean using alias', () => {
    const argv = parse(['moo'], {
      boolean: ['bool'],
      alias: { bool: 'b' },
      default: { b: true },
    })

    assert.deepEqual(argv, {
      bool: true,
      b: true,
      _: ['moo'],
    })
  })

  test('boolean and alias --boool=false', () => {
    const parsed = parse(['--boool=false'], {
      default: {
        b: true,
      },
      alias: { b: 'boool' },
      boolean: ['b'],
    })

    assert.equal(parsed['boool'], false)
  })
})
