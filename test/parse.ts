import parse from '../index.js'
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

describe('parse', () => {
  test('parse args', () => {
    assert.deepEqual(parse(['--no-moo']), { moo: false, _: [] }, 'no')
    assert.deepEqual(
      parse(['-v', 'a', '-v', 'b', '-v', 'c']),
      { v: ['a', 'b', 'c'], _: [] },
      'multi'
    )
  })

  test('comprehensive', function (t) {
    assert.deepEqual(
      parse([
        '--name=meowmers',
        'bare',
        '-cats',
        'woo',
        '-h',
        'awesome',
        '--multi=quux',
        '--key',
        'value',
        '-b',
        '--bool',
        '--no-meep',
        '--multi=baz',
        '--',
        '--not-a-flag',
        'eek',
      ]),
      {
        c: true,
        a: true,
        t: true,
        s: 'woo',
        h: 'awesome',
        b: true,
        bool: true,
        key: 'value',
        multi: ['quux', 'baz'],
        meep: false,
        name: 'meowmers',
        _: ['bare', '--not-a-flag', 'eek'],
      }
    )
  })

  test('flag boolean', () => {
    const argv = parse(['-t', 'moo'], { boolean: 't' })
    assert.deepEqual(argv, { t: true, _: ['moo'] })
    assert.deepEqual(typeof argv.t, 'boolean')
  })

  test('flag boolean value', () => {
    const argv = parse(['--verbose', 'false', 'moo', '-t', 'true'], {
      boolean: ['t', 'verbose'],
      default: { verbose: true },
    })

    assert.deepEqual(argv, {
      verbose: false,
      t: true,
      _: ['moo'],
    })

    assert.deepEqual(typeof argv.verbose, 'boolean')
    assert.deepEqual(typeof argv.t, 'boolean')
  })

  test('newlines in params', () => {
    let args = parse(['-s', 'X\nX'])
    assert.deepEqual(args, { _: [], s: 'X\nX' })

    // reproduce in bash:
    // VALUE="new
    // line"
    // node program.js --s="$VALUE"
    args = parse(['--s=X\nX'])
    assert.deepEqual(args, { _: [], s: 'X\nX' })
  })

  test('strings', () => {
    const s = parse(['-s', '0001234'], { string: 's' }).s
    assert.equal(s, '0001234')
    assert.equal(typeof s, 'string')

    const x = parse(['-x', '56'], { string: 'x' })['x']
    assert.equal(x, '56')
    assert.equal(typeof x, 'string')
  })

  test('stringArgs', () => {
    const s = parse(['  ', '  '], { string: '_' })._
    assert.equal(s.length, 2)
    assert.equal(typeof s[0], 'string')
    assert.equal(s[0], '  ')
    assert.equal(typeof s[1], 'string')
    assert.equal(s[1], '  ')
  })

  test('empty strings', () => {
    const s = parse(['-s'], { string: 's' })['s']
    assert.equal(s, '')
    assert.equal(typeof s, 'string')

    const str = parse(['--str'], { string: 'str' })['str']
    assert.equal(str, '')
    assert.equal(typeof str, 'string')

    const letters = parse(['-art'], {
      string: ['a', 't'],
    })

    assert.equal(letters['a'], '')
    assert.equal(letters['r'], true)
    assert.equal(letters['t'], '')
  })

  test('string and alias', (t) => {
    const x = parse(['--str', '000123'], {
      string: 's',
      alias: { s: 'str' },
    })

    assert.equal(x['str'], '000123')
    assert.equal(typeof x['str'], 'string')
    assert.equal(x['s'], '000123')
    assert.equal(typeof x['s'], 'string')

    const y = parse(['-s', '000123'], {
      string: 'str',
      alias: { str: 's' },
    })

    assert.equal(y['str'], '000123')
    assert.equal(typeof y['str'], 'string')
    assert.equal(y['s'], '000123')
    assert.equal(typeof y['s'], 'string')

    const z = parse(['-s123'], {
      alias: { str: ['s', 'S'] },
      string: ['str'],
    })

    assert.deepEqual(
      z,
      { _: [], s: '123', S: '123', str: '123' },
      'opt.string works with multiple aliases'
    )
  })

  test('slashBreak', () => {
    assert.deepEqual(parse(['-I/foo/bar/baz']), { I: '/foo/bar/baz', _: [] })
    assert.deepEqual(parse(['-xyz/foo/bar/baz']), {
      x: true,
      y: true,
      z: '/foo/bar/baz',
      _: [],
    })
  })

  test('alias', () => {
    const argv = parse(['-f', '11', '--zoom', '55'], {
      alias: { z: 'zoom' },
    })
    assert.equal(argv['zoom'], 55)
    assert.equal(argv['z'], argv['zoom'])
    assert.equal(argv['f'], 11)
  })

  test('multiAlias', () => {
    const argv = parse(['-f', '11', '--zoom', '55'], {
      alias: { z: ['zm', 'zoom'] },
    })
    assert.equal(argv['zoom'], 55)
    assert.equal(argv['z'], argv['zoom'])
    assert.equal(argv['z'], argv['zm'])
    assert.equal(argv['f'], 11)
  })

  test('nested dotted objects', () => {
    const argv = parse([
      '--foo.bar',
      '3',
      '--foo.baz',
      '4',
      '--foo.quux.quibble',
      '5',
      '--foo.quux.o_O',
      '--beep.boop',
    ])

    assert.deepEqual(argv['foo'], {
      bar: 3,
      baz: 4,
      quux: {
        quibble: 5,
        o_O: true,
      },
    })
    assert.deepEqual(argv['beep'], { boop: true })
  })
})
