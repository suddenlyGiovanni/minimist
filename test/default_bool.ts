import parse from '../index.js'
import { test, describe } from 'node:test'
import assert from 'node:assert/strict'

describe('default bool', () => {
  test('boolean default true', () => {
    const argv = parse([], {
      boolean: 'sometrue',
      default: { sometrue: true },
    })
    assert.equal(argv['sometrue'], true)
  })

  test('boolean default false', () => {
    const argv = parse([], {
      boolean: 'somefalse',
      default: { somefalse: false },
    })
    assert.equal(argv['somefalse'], false)
  })

  test('boolean default to null', () => {
    const argv = parse([], {
      boolean: 'maybe',
      default: { maybe: null },
    })
    assert.equal(argv['maybe'], null)

    const argvLong = parse(['--maybe'], {
      boolean: 'maybe',
      default: { maybe: null },
    })
    assert.equal(argvLong['maybe'], true)
  })
})
