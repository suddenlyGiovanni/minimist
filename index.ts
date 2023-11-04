import assert from 'node:assert/strict'
import '@total-typescript/ts-reset/filter-boolean'

function hasKey<T extends {}>(obj: T, keys: (keyof T)[]): boolean {
  let o = obj
  keys.slice(0, -1).forEach((key) => {
    o = o[key] || {}
  })

  const key = keys[keys.length - 1]
  return key in o
}

function isNumber<T extends string | number>(x: T): boolean {
  if (typeof x === 'number') {
    return true
  }
  if (/^0x[0-9a-f]+$/i.test(x)) {
    return true
  }
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x)
}

function isConstructorOrProto<Obj extends {}>(
  obj: Obj,
  key: keyof Obj
): boolean {
  return (
    (key === 'constructor' && typeof obj[key] === 'function') ||
    key === '__proto__'
  )
}

interface Opts {
  /**
   * A string or array of strings argument names to always treat as strings
   */
  string?: string | string[]

  /**
   * A boolean, string or array of strings to always treat as booleans. If true will treat
   * all double hyphenated arguments without equals signs as boolean (e.g. affects `--foo`, not `-f` or `--foo=bar`)
   */
  boolean?: boolean | string | string[]

  /**
   * An object mapping string names to strings or arrays of string argument names to use as aliases
   */
  alias?: Record<string, string | string[]>

  /**
   * An object mapping string argument names to default values
   */
  default?: Record<string, any>

  /**
   * When true, populate argv._ with everything after the first non-option
   */
  stopEarly?: boolean

  /**
   * A function which is invoked with a command line parameter not defined in the opts
   * configuration object. If the function returns false, the unknown option is not added to argv
   */
  unknown?: (arg: string) => boolean

  /**
   * When true, populate argv._ with everything before the -- and argv['--'] with everything after the --.
   * Note that with -- set, parsing for arguments still stops after the `--`.
   */
  '--'?: boolean
}

interface ParsedArgs {
  [arg: string]: any

  /**
   * If opts['--'] is true, populated with everything after the --
   */
  '--'?: string[]

  /**
   * Contains all the arguments that didn't have an option associated with them
   */
  _: string[]
}

/**
 * Return an argument object populated with the array arguments from args
 *
 * @param [args] An optional argument array (typically `process.argv.slice(2)`)
 * @param [opts] An optional options object to customize the parsing
 */
export default function minimist(args?: string[], opts?: Opts): ParsedArgs

/**
 * Return an argument object populated with the array arguments from args. Strongly-typed
 * to be the intersect of type T with minimist.ParsedArgs.
 *
 * `T` The type that will be intersected with minimist.ParsedArgs to represent the argument object
 *
 * @param [args] An optional argument array (typically `process.argv.slice(2)`)
 * @param [opts] An optional options object to customize the parsing
 */
export default function minimist<T>(
  args?: string[],
  opts?: Opts
): T & ParsedArgs

/**
 * Return an argument object populated with the array arguments from args. Strongly-typed
 * to be the the type T which should extend minimist.ParsedArgs
 *
 * `T` The type that extends minimist.ParsedArgs and represents the argument object
 *
 * @param [args] An optional argument array (typically `process.argv.slice(2)`)
 * @param [opts] An optional options object to customize the parsing
 */
export default function minimist<T extends ParsedArgs>(
  args: string[],
  opts: Opts = {}
): T {
  type Flags = {
    bools: Record<string, true>
    strings: Record<string, string>
    unknownFn: null | ((arg: string) => boolean)
    allBools?: boolean
  }

  const flags: Flags = {
    bools: {},
    strings: {},
    unknownFn: null,
  }

  if (typeof opts.unknown === 'function') {
    flags.unknownFn = opts.unknown
  }

  if ('boolean' in opts) {
    if (typeof opts.boolean === 'boolean') {
      switch (opts.boolean) {
        case true:
          flags.allBools = true
          break
        case false:
          flags.allBools = false
          break
      }
    } else {
      const booleansArgs: string[] =
        typeof opts.boolean === 'string' ? [opts.boolean] : opts.boolean
      ;[...booleansArgs].filter(Boolean).forEach((key) => {
        flags.bools[key] = true
      })
    }
  }

  const aliases: Record<keyof Exclude<Opts['alias'], undefined>, string[]> = {}

  function isBooleanKey<Key extends string>(key: Key): boolean {
    if (flags.bools[key]) {
      return true
    }
    if (!aliases[key]) {
      return false
    }
    return aliases[key].some((x) => flags.bools[x])
  }

  // Build the aliases map based on the passed in alias options
  Object.keys(opts.alias || {}).forEach((key) => {
    assert(typeof opts.alias !== 'undefined', 'alias is not "undefined"')
    aliases[key] = ([] as string | string[]).concat(opts.alias[key]!) //
    aliases[key].forEach((x) => {
      aliases[x] = [key].concat(aliases[key].filter((y) => x !== y))
    })
  })
  ;[]
    .concat(opts.string)
    .filter(Boolean)
    .forEach((key) => {
      flags.strings[key] = true
      if (aliases[key]) {
        ;[].concat(aliases[key]).forEach((k) => {
          flags.strings[k] = true
        })
      }
    })

  let defaults = opts.default || {}

  let argv = { _: [] }

  function argDefined(key: string, arg: string) {
    return (
      (flags.allBools && /^--[^=]+$/.test(arg)) ||
      flags.strings[key] ||
      flags.bools[key] ||
      aliases[key]
    )
  }

  function setKey<Obj extends {}>(
    obj: Obj,
    keys: (keyof Obj)[],
    value: unknown
  ): void {
    let o = obj
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]! // TODO: Remove !
      if (isConstructorOrProto(o, key)) {
        return
      }
      if (o[key] === undefined) {
        o[key] = {}
      }
      if (
        o[key] === Object.prototype ||
        o[key] === Number.prototype ||
        o[key] === String.prototype
      ) {
        o[key] = {}
      }
      if (o[key] === Array.prototype) {
        o[key] = []
      }
      o = o[key]
    }

    const lastKey = keys[keys.length - 1]! // TODO: Remove !
    if (isConstructorOrProto(o, lastKey)) {
      return
    }
    if (
      o === Object.prototype ||
      o === Number.prototype ||
      o === String.prototype
    ) {
      o = {}
    }
    if (o === Array.prototype) {
      o = []
    }
    if (
      o[lastKey] === undefined ||
      isBooleanKey(lastKey) ||
      typeof o[lastKey] === 'boolean'
    ) {
      o[lastKey] = value
    } else if (Array.isArray(o[lastKey])) {
      o[lastKey].push(value)
    } else {
      o[lastKey] = [o[lastKey], value]
    }
  }

  function setArg<Key extends string, Arg extends string, T>(
    key: Key,
    val: T,
    arg?: Arg
  ): void {
    if (arg && flags.unknownFn && !argDefined(key, arg)) {
      if (flags.unknownFn(arg) === false) {
        return
      }
    }

    let value =
      !flags.strings[key] && isNumber(val)
        ? Number(val) //
        : val

    setKey(argv, key.split('.'), value)
    ;(aliases[key] || []).forEach((x) => {
      setKey(argv, x.split('.'), value)
    })
  }

  // Set booleans to false by default.
  Object.keys(flags.bools).forEach((key) => {
    setArg(key, false)
  })
  // Set booleans to user defined default if supplied.
  Object.keys(defaults)
    .filter(isBooleanKey)
    .forEach((key) => {
      setArg(key, defaults[key])
    })
  var notFlags = []

  if (args.indexOf('--') !== -1) {
    notFlags = args.slice(args.indexOf('--') + 1)
    args = args.slice(0, args.indexOf('--'))
  }

  for (var i = 0; i < args.length; i++) {
    var arg = args[i]
    var key
    var next

    if (/^--.+=/.test(arg)) {
      // Using [\s\S] instead of . because js doesn't support the
      // 'dotall' regex modifier. See:
      // http://stackoverflow.com/a/1068308/13216
      var m = arg.match(/^--([^=]+)=([\s\S]*)$/)
      key = m[1]
      var value = m[2]
      if (isBooleanKey(key)) {
        value = value !== 'false'
      }
      setArg(key, value, arg)
    } else if (/^--no-.+/.test(arg)) {
      key = arg.match(/^--no-(.+)/)[1]
      setArg(key, false, arg)
    } else if (/^--.+/.test(arg)) {
      key = arg.match(/^--(.+)/)[1]
      next = args[i + 1]
      if (
        next !== undefined &&
        !/^(-|--)[^-]/.test(next) &&
        !isBooleanKey(key) &&
        !flags.allBools
      ) {
        setArg(key, next, arg)
        i += 1
      } else if (/^(true|false)$/.test(next)) {
        setArg(key, next === 'true', arg)
        i += 1
      } else {
        setArg(key, flags.strings[key] ? '' : true, arg)
      }
    } else if (/^-[^-]+/.test(arg)) {
      var letters = arg.slice(1, -1).split('')

      var broken = false
      for (var j = 0; j < letters.length; j++) {
        next = arg.slice(j + 2)

        if (next === '-') {
          setArg(letters[j], next, arg)
          continue
        }

        if (/[A-Za-z]/.test(letters[j]) && next[0] === '=') {
          setArg(letters[j], next.slice(1), arg)
          broken = true
          break
        }

        if (
          /[A-Za-z]/.test(letters[j]) &&
          /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)
        ) {
          setArg(letters[j], next, arg)
          broken = true
          break
        }

        if (letters[j + 1] && letters[j + 1].match(/\W/)) {
          setArg(letters[j], arg.slice(j + 2), arg)
          broken = true
          break
        } else {
          setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg)
        }
      }

      key = arg.slice(-1)[0]
      if (!broken && key !== '-') {
        if (
          args[i + 1] &&
          !/^(-|--)[^-]/.test(args[i + 1]) &&
          !isBooleanKey(key)
        ) {
          setArg(key, args[i + 1], arg)
          i += 1
        } else if (args[i + 1] && /^(true|false)$/.test(args[i + 1])) {
          setArg(key, args[i + 1] === 'true', arg)
          i += 1
        } else {
          setArg(key, flags.strings[key] ? '' : true, arg)
        }
      }
    } else {
      if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
        argv._.push(flags.strings._ || !isNumber(arg) ? arg : Number(arg))
      }
      if (opts.stopEarly) {
        argv._.push.apply(argv._, args.slice(i + 1))
        break
      }
    }
  }

  Object.keys(defaults).forEach((k) => {
    if (!hasKey(argv, k.split('.'))) {
      setKey(argv, k.split('.'), defaults[k])
      ;(aliases[k] || []).forEach(function (x) {
        setKey(argv, x.split('.'), defaults[k])
      })
    }
  })

  if (opts['--']) {
    argv['--'] = notFlags.slice()
  } else {
    notFlags.forEach(function (k) {
      argv._.push(k)
    })
  }

  return argv
}
