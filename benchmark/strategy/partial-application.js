// This strategy is an improvement over `infer-arity`

function isPrimitive (value) {
  return value == null || (typeof value !== 'function' && typeof value !== 'object')
}

function strategy (fn, options) {
  function monadic (fn, cache, serializer, arg) {
    var cacheKey
    if (isPrimitive(arg)) {
      cacheKey = arg
    } else {
      cacheKey = serializer(arg)
    }

    if (!cache.has(cacheKey)) {
      var computedValue = fn.call(this, arg)
      cache.set(cacheKey, computedValue)
      return computedValue
    }

    return cache.get(cacheKey)
  }

  function variadic (fn, cache, serializer) {
    for (var _len = arguments.length, args = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      args[_key - 3] = arguments[_key];
    }
    var cacheKey = serializer(args)

    if (!cache.has(cacheKey)) {
      var computedValue = fn.apply(this, args)
      cache.set(cacheKey, computedValue)
      return computedValue
    }

    return cache.get(cacheKey)
  }

  var memoized = fn.length === 1 ?
    monadic :
    variadic

  memoized = memoized.bind(this, fn, options.cache.create(), options.serializer)
  memoized.label = 'strategy: Partial application, cache: ' + options.cache.label + ', serializer: ' + options.serializer.label

  return memoized
}

strategy.label = 'Partial application'

module.exports = strategy
