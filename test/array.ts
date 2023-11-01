import parse from '../index.js'
import test from 'node:test'
import assert from 'node:assert/strict'

test('repeated auto strings accumulate in array', () => {
  const argv = parse(['-s', 'foo', '-s', 'bar'])

  assert.deepEqual(argv, {
    s: ['foo', 'bar'],
    _: [],
  })
})

test('repeated declared strings accumulate in array', () => {
  const argv = parse(['-s', 'foo', '-s', 'bar', '-s'], { string: ['s'] })

  assert.deepEqual(argv, {
    s: ['foo', 'bar', ''],
    _: [],
  })
})

test('repeated auto booleans overwrite', () => {
  const argv = parse(['--bool', '--bool'])

  assert.deepEqual(argv, {
    bool: true,
    _: [],
  })
})

test('repeated declared booleans overwrite', () => {
  const argv = parse(['--bool', 'moo', '--bool'], { boolean: ['bool'] })

  assert.deepEqual(argv, {
    bool: true,
    _: ['moo'],
  })
})

test('auto string overwrites auto bool', () => {
  // Testing for coverage of existing behaviour rather than because this is by design.
  const argv = parse(['--mixed', '--mixed', 'str'])

  assert.deepEqual(argv, {
    mixed: 'str',
    _: [],
  })
})

test('auto bool accumulates with auto string', () => {
  // Testing for coverage of existing behaviour rather than because this is by design.
  const argv = parse(['--mixed', 'str', '--mixed'])

  assert.deepEqual(argv, {
    mixed: ['str', true],
    _: [],
  })
})

test('declared boolean overwrites string', () => {
  const options = {
    boolean: ['b'],
  }

  // Verify the setup, that can get a string into the option. (Can't do this for long options.)
  const argv1 = parse(['-b=xyz'], options)
  assert.deepEqual(argv1, {
    b: 'xyz',
    _: [],
  })

  // Check that declared boolean overwrites string, and does not accumulate into array.
  const argv2 = parse(['-b=xyz', '-b'], options)

  assert.deepEqual(argv2, {
    b: true,
    _: [],
  })
})

test('declared boolean alias overwrites string', () => {
  // https://github.com/minimistjs/minimist/issues/31
  const options = {
    boolean: ['b'],
    alias: { b: 'B' },
  }

  // Verify the setup, that can get a string into the option. (Can't do this for long options.)
  const argv1 = parse(['-B=xyz'], options)
  assert.deepEqual(argv1, {
    b: 'xyz',
    B: 'xyz',
    _: [],
  })

  // Check that declared boolean overwrites string, and does not accumulate into array.
  const argv2 = parse(['-B=xyz', '-B'], options)

  assert.deepEqual(argv2, {
    b: true,
    B: true,
    _: [],
  })
})
