import '@total-typescript/ts-reset/filter-boolean'

/**
 * Retrieves the value associated with the specified key in the given object.
 *
 * @template TValue - The type of values stored in the object.
 * @param obj - The object from which to retrieve the value.
 * @param key - The key of the value to retrieve.
 * @returns - The value associated with the specified key, or undefined if the key does not exist.
 * @example
 * ```ts
 * const obj = {a: 1, b: 2, c: 3};
 * get(obj, 'b'); // 2
 * get(obj, 'd'); // undefined
 * ```
 */
function get<TValue>(
  obj: Record<string, TValue>,
  key: keyof typeof obj | (string & {})
): TValue | undefined {
  return Object.hasOwn(obj, key)
    ? obj[key] //
    : undefined
}

interface NestedMapping {
  [key: string]: NestedMapping | unknown
}

/**
 * Checks if the given object has a specified key.
 *
 * @param obj - The object to search for the key.
 * @param keys - An array of keys representing the nested structure of the object.
 * @returns - Returns true if the key exists, otherwise returns false.
 */
function hasKey(obj: NestedMapping, keys: string[]): boolean {
  let o = obj
  keys.slice(0, -1).forEach((key) => {
    o = (get(o, key) ?? {}) as NestedMapping
  })

  const key = keys[keys.length - 1]!
  return Object.hasOwn(o, key)
}

/**
 * Checks if the given value is a number.
 *
 * @param x - The value to be checked.
 * @return - Returns true if the value is a number or can be coerced to one from a string, otherwise returns false.
 */
function isNumber(x: unknown): boolean {
  if (typeof x === 'number') return true
  if (/^0x[0-9a-f]+$/i.test(String(x))) return true
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(String(x))
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

/**
 * Represents aliases for argument names.
 * @template TArgNames - The type of the argument names.
 * @template TAliasNames - The type of the alias names.
 * @example
 * ```ts
 * {
 *    a: "b",
 *    x: ["y", "z"]
 *  }
 *  ```
 *  the following aliases map will be created:
 *  ```ts
 *  {
 *    a: ["b"],
 *    b: ["a"],
 *    x: ["y", "z"],
 *    y: ["x", "z"],
 *    z: ["x", "y"]
 *    }
 * ```
 */
type Aliases<TArgNames = string, TAliasNames extends string = string> = Partial<
  Record<Extract<TArgNames, string>, TAliasNames | ReadonlyArray<TAliasNames>>
>

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

interface Flags {
  /**
   * Stores parsed arguments that are recognized as boolean flags.
   * @example
   * minimist(['--port', '8080', '--retry-count', '3'], {boolean: ['port']});
   * bools === {port: true}
   */
  bools: Record<string, boolean>

  /**
   * Stores arguments expected to be treated as strings.
   * @example
   * If `opts` is { string: ['port'] } and `args` is ['--port', '8080'], then `flags.strings` will be {port: true}
   */
  strings: Record<string, boolean>

  /**
   * A function that handles unrecognized or not defined arguments.
   */
  unknownFn: null | ((arg: string) => boolean)

  /**
   * Indicates if all double hyphenated arguments without equal signs will be treated as booleans.
   */
  allBools?: boolean
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
  { string, boolean, alias, unknown, ...opts }: Opts = {}
): T {
  /**
   * An alias dictionary that maps each key to all the possible aliases for that key.
   * @example
   * GIVEN an initial alias record
   * const alias = {
   *    a: "b",
   *    x: ["y", "z"]
   *  };
   *
   * THEN the aliases map will match the following structure:
   *
   * const aliases = {
   *    a: ["b"],
   *    b: ["a"],
   *    x: ["y", "z"],
   *    y: ["x", "z"],
   *    z: ["x", "y"]
   * };
   */
  const aliases: Record<string, string[]> = {}
  const defaults = opts.default || {}
  const flags: Flags = {
    bools: {},
    strings: {},
    unknownFn: null,
  }
  const argv: ParsedArgs = { _: [] }

  // Check if alias exists in options
  if (alias !== undefined) {
    // Build the aliases map based on the passed in alias options
    for (const [key, value] of Object.entries(alias)) {
      // Skip alias if the value is an empty string or an array with empty strings.
      if (
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) &&
          value.some((v) => typeof v === 'string' && v.trim() === ''))
      ) {
        continue
      }

      // Make sure value is always an array
      let aliasValues = Array.isArray(value) ? value : [value]

      // Assign this array to the key in aliases
      aliases[key] = aliasValues

      // map aliases
      for (const aliasKey of aliasValues) {
        aliases[aliasKey] = [key, ...aliasValues].filter(
          (val) => val !== aliasKey
        )
      }
    }
  }

  if (boolean !== undefined) {
    if (typeof boolean === 'boolean') {
      flags.allBools = !!boolean
    } else {
      const booleanArgs: ReadonlyArray<string> =
        typeof boolean === 'string' ? [boolean] : boolean

      for (const key of booleanArgs.filter(Boolean)) {
        flags.bools[key] = true
        const alias = get(aliases, key)
        if (alias) {
          for (const al of alias) {
            flags.bools[al] = true
          }
        }
      }
    }
  }

  if (string !== undefined) {
    const stringArgs: ReadonlyArray<string> =
      typeof string === 'string' ? [string] : string

    for (const key of stringArgs.filter(Boolean)) {
      flags.strings[key] = true
      const alias = get(aliases, key)
      if (alias) {
        for (const al of alias) {
          flags.strings[al] = true
        }
      }
    }
  }

  if (typeof unknown === 'function') {
    flags.unknownFn = unknown
  }

  function isBooleanKey<Key extends string>(key: Key): boolean {
    if (flags.bools[key]) return true
    if (!aliases[key]) return false
    return aliases[key].some((alias) => flags.bools[alias])
  }

  function argDefined(key: string, arg: string): boolean {
    return (
      (flags.allBools && /^--[^=]+$/.test(arg)) ||
      get(flags.strings, key) ||
      !!get(flags.bools, key) ||
      !!get(aliases, key)
    )
  }

  /**
   *  Sets a property of an object, or a nested property of an object, to the given value.
   *  Will create any intermediate properties if they don't already exist.
   *
   *  @template Obj - A generic type parameter that extends object.
   *  @param {Obj} obj - An object wherein the value will be set.
   *  @param {(keyof Obj)[]} keys - An array that represents the keys or nested keys where the value will be set.
   *  @param {unknown} value - The value that will be assigned to the key or nested keys of obj.
   *
   *  @remarks
   *  The keys array dictates how the value is set.
   *  If keys is ['a', 'b'], then the function attempts to set obj.a.b
   *  to the given value. If obj.a does not exist, it will be created as an empty object.
   *
   *  If the value at keys location or at an intermediate location is
   *  Object.prototype, Number.prototype, String.prototype, or Array.prototype,
   *  it is replaced with a new object or array before proceeding.
   *
   *  If the value at the last key is either a boolean or undefined,
   *  it is set to the incoming value directly.
   *  If it's an array, the value is pushed into the array.
   *  If it's an existing other value, it is transformed into an array
   *  with existing value and new value.
   *
   *  If 'keys' array is empty, no operation is performed.
   *
   *  @throws Throws an error if a constructor or prototype is found in the path.
   *  @returns {void}
   */
  function setKey(obj: NestedMapping, name: string, value: unknown): void {
    let o = obj
    const keys = name.split('.')
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
      get(o, lastKey) === undefined ||
      isBooleanKey(lastKey) ||
      typeof get(o, lastKey) === 'boolean'
    ) {
      o[lastKey] = value
    } else if (Array.isArray(get(o, lastKey))) {
      ;(o[lastKey] as unknown[]).push(value)
    } else {
      o[lastKey] = [get(o, lastKey), value]
    }
  }

  /**
   *  Sets a value for a given key in the argv object, considering any supplied arguments and flags.
   *  If aliases for the key exist, the value is also set for them in the argv object.
   *
   *  @template Key - The key to add or modify in the argv object.
   *  @template Arg - An optional argument associated with the key.
   *  @template T - The type of the value to be set.
   *  @param {Key} key - Key to add or modify in the argv object.
   *                     Can include dots to access nested properties.
   *  @param {T} val - The value to set for the provided key in the argv object.
   *  @param {Arg} arg - Optional. An argument associated with the key.
   *
   *  @remarks
   *  If an arg is provided and an unknownFn is specified in the flags object, the
   *  unknownFn function will be executed with arg as a parameter. If unknownFn returns false,
   *  the function exits early.
   *
   *  The value assigned to the key can have its type preserved if it's a number and the equivalent
   *  key in flags.strings is not present.
   *
   *  In addition to setting the value of the key, the function also sets the value of
   *  any aliases of the key found in the aliases object.
   *
   *  @returns {void}
   */
  function setArg(
    key: string,
    val: unknown,
    arg: string | undefined = undefined
  ): void {
    if (arg && flags.unknownFn && !argDefined(key, arg)) {
      if (flags.unknownFn(arg) === false) return
    }

    const value = !get(flags.strings, key) && isNumber(val) ? Number(val) : val

    setKey(argv, key, value)

    const alias = get(aliases, key)

    if (alias) {
      for (const x of alias) {
        setKey(argv, x, value)
      }
    }
  }

  // Set booleans to false by default.
  Object.keys(flags.bools).forEach((key: keyof typeof flags.bools) => {
    setArg(key, false)
  })
  // Set booleans to user defined default if supplied.
  Object.keys(defaults)
    .filter(isBooleanKey)
    .forEach((key) => {
      setArg(key, defaults[key])
    })
  let notFlags: string[] = []

  if (args.indexOf('--') !== -1) {
    notFlags = args.slice(args.indexOf('--') + 1)
    args = args.slice(0, args.indexOf('--'))
  }

  for (let i = 0; i < args.length; i++) {
    let arg = args[i]
    let key
    let next

    if (/^--.+=/.test(arg)) {
      // Using [\s\S] instead of . because js doesn't support the
      // 'dotall' regex modifier. See:
      // http://stackoverflow.com/a/1068308/13216
      let m = arg.match(/^--([^=]+)=([\s\S]*)$/)
      key = m[1]
      let value = m[2]
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
      let letters = arg.slice(1, -1).split('')

      let broken = false
      for (let j = 0; j < letters.length; j++) {
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

  for (const [key, value] of Object.entries(defaults)) {
    if (!hasKey(argv, key.split('.'))) {
      setKey(argv, key, value)

      if (aliases[key]) {
        for (const x of aliases[key]!) {
          setKey(argv, x, value)
        }
      }
    }
  }

  if (opts['--']) {
    argv['--'] = notFlags.slice()
  } else {
    notFlags.forEach((k) => {
      argv._.push(k)
    })
  }

  return argv
}
