/* eslint-disable id-match, no-use-before-define */

const Enum = ([name]) => (variants) => {
  const $$type = Symbol(name)
  const $$variant = Symbol(`${name}::variant`)
  const $$values = Symbol(`${name}::values`)

  const variantKeys = Object.keys(variants)

  const Class = {}
  const classes = {}

  Class.is = function is(target) {
    return target[$$type] === name || variantKeys.includes(target[$$type])
  }
  Class.prototype = Object.create({
    [$$type]: name,
    match: function match(targetVars) {
      const targetKeys = Object.keys(targetVars)
      const notCoveredKeys = variantKeys.filter((key) => !targetKeys.includes(key))

      if (notCoveredKeys.length > 0 && !targetVars._) {
        throw new TypeError(`non-exhausive patterns: ${notCoveredKeys.join(', ')} not covered `)
      }

      const variant = this[$$variant]
      const values = this[$$values]
      const handler = targetVars[variant]

      return handler ? handler(...values) : targetVars._()
    },
  })

  classes[name] = Class

  Object.keys(variants).forEach((vari) => {
    // eslint-disable-next-line func-names, consistent-return
    classes[vari] = function (...args) {
      if (!Class.is(this)) {
        return new classes[vari](...args)
      }

      this[$$variant] = vari
      this[$$values] = variants[vari](...args) || []
    }

    classes[vari].prototype = Object.create(classes[name].prototype)
  })

  return classes
}

const { Option, Some, None } = Enum`Option`({
  Some: (x) => [x],
  None: () => { },
})

Option.prototype.isSome = function Option$isSome() {
  return this.match({
    Some: () => true,
    None: () => false,
  })
}

Option.prototype.isNone = function Option$isNone() {
  return this.match({
    Some: () => false,
    None: () => true,
  })
}

Option.prototype.expect = function Option$expect(msg) {
  return this.match({
    Some: (val) => val,
    None: () => {
      throw new Error(msg)
    },
  })
}

Option.prototype.unwrap = function Option$unwrap() {
  return this.match({
    Some: (val) => val,
    None: () => {
      throw new Error('called `Option::unwrap()` on a `None` value')
    },
  })
}

Option.prototype.unwrapOr = function Option$unwrapOr(def) {
  return this.match({
    Some: (val) => val,
    None: () => def,
  })
}

Option.prototype.unwrapOrElse = function Option$unwrapOrElse(fn) {
  return this.match({
    Some: (val) => val,
    None: () => fn(),
  })
}

Option.prototype.map = function Option$map(mapFn) {
  return this.match({
    Some: (val) => Some(mapFn(val)),
    None,
  })
}

Option.prototype.mapOr = function Option$mapOr(def, mapFn) {
  return this.match({
    Some: (val) => mapFn(val),
    None: () => def,
  })
}

Option.prototype.mapOrElse = function Option$mapOr(defFn, mapFn) {
  return this.match({
    Some: (val) => mapFn(val),
    None: () => defFn(),
  })
}

Option.prototype.and = function Option$and(optb) {
  return this.match({
    Some: () => optb,
    None,
  })
}

Option.prototype.andThen = function Option$andThen(chainFn) {
  return this.match({
    Some: (val) => chainFn(val),
    None,
  })
}

Option.prototype.filter = function Option$filter(predicateFn) {
  return this.andThen((val) => predicateFn(val) ? Some(val) : None())
}


Option.prototype.or = function Option$or(optb) {
  return this.match({
    Some: () => this,
    None: () => optb,
  })
}


Option.prototype.orElse = function Option$orElse(fn) {
  return this.match({
    Some: () => this,
    None: () => fn(),
  })
}

Option.prototype.okOr = function Option$okOr(err) {
  return this.match({
    Some: (val) => Ok(val),
    None: () => Err(err),
  })
}

Option.prototype.okOrElse = function Option$okOrElse(errFn) {
  return this.match({
    Some: (val) => Ok(val),
    None: () => Err(errFn()),
  })
}


const { Result, Ok, Err } = Enum`Result`({
  Ok: (val) => [val],
  Err: (err) => [err],
})

Result.prototype.isOk = function Result$isOk() {
  return this.match({
    Ok: () => true,
    Err: () => false,
  })
}

Result.prototype.isErr = function Result$isErr() {
  return this.match({
    Ok: () => false,
    Err: () => true,
  })
}

Result.prototype.ok = function Result$ok() {
  return this.match({
    Ok: (val) => Some(val),
    Err: () => None(),
  })
}

Result.prototype.err = function Result$err() {
  return this.match({
    Ok: () => None(),
    Err: (err) => Some(err),
  })
}

Result.prototype.map = function Result$map(mapFn) {
  return this.match({
    Ok: (val) => Ok(mapFn(val)),
    Err,
  })
}

Result.prototype.mapErr = function Result$mapErr(mapErrFn) {
  return this.match({
    Ok,
    Err: (val) => Err(mapErrFn(val)),
  })
}

Result.prototype.and = function Result$and(resb) {
  return this.match({
    Ok: () => resb,
    Err,
  })
}

Result.prototype.andThen = function Result$andThen(chainFn) {
  return this.match({
    Ok: (val) => chainFn(val),
    Err,
  })
}

Result.prototype.or = function Result$or(resb) {
  return this.match({
    Ok,
    Err: () => resb,
  })
}

Result.prototype.orElse = function Result$orElse(chainErrFn) {
  return this.match({
    Ok,
    Err: (err) => chainErrFn(err),
  })
}

Result.prototype.unwrapOr = function Result$unwrapOr(optb) {
  return this.match({
    Ok: (val) => val,
    Err: () => optb,
  })
}

Result.prototype.unwrapOrElse = function Result$unwrapOrElse(opFn) {
  return this.match({
    Ok: (val) => val,
    Err: (err) => opFn(err),
  })
}

module.exports = {
  Enum,

  Option,
  Some,
  None,

  Result,
  Ok,
  Err,
}
