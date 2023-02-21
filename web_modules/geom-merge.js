import { z as getBuiltIn, _ as _export, g as getIteratorDirect, a as aCallable, m as anObject, n as functionCall, v as isObject, S as asyncIteratorClose, p as functionBindContext, w as wellKnownSymbol, M as objectCreate, u as objectDefineProperty } from './common/classof-f879816f.js';
import { i as iterate } from './common/iterate-9e24f8ec.js';
import typedArrayConcat from './typed-array-concat.js';
import { m as mapHelpers, a as mapIterate, b as arrayIterationFromLast } from './common/es.typed-array.with-e94c18e3.js';
import './common/object-set-prototype-of-4460a095.js';

var Promise = getBuiltIn('Promise');
var $TypeError = TypeError;

// `AsyncIterator.prototype.reduce` method
// https://github.com/tc39/proposal-async-iterator-helpers
_export({ target: 'AsyncIterator', proto: true, real: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    var record = getIteratorDirect(this);
    var iterator = record.iterator;
    var next = record.next;
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    var counter = 0;
    aCallable(reducer);

    return new Promise(function (resolve, reject) {
      var ifAbruptCloseAsyncIterator = function (error) {
        asyncIteratorClose(iterator, reject, error, reject);
      };

      var loop = function () {
        try {
          Promise.resolve(anObject(functionCall(next, iterator))).then(function (step) {
            try {
              if (anObject(step).done) {
                noInitial ? reject($TypeError('Reduce of empty iterator with no initial value')) : resolve(accumulator);
              } else {
                var value = step.value;
                if (noInitial) {
                  noInitial = false;
                  accumulator = value;
                  loop();
                } else try {
                  var result = reducer(accumulator, value, counter);

                  var handler = function ($result) {
                    accumulator = $result;
                    loop();
                  };

                  if (isObject(result)) Promise.resolve(result).then(handler, ifAbruptCloseAsyncIterator);
                  else handler(result);
                } catch (error3) { ifAbruptCloseAsyncIterator(error3); }
              }
              counter++;
            } catch (error2) { reject(error2); }
          }, reject);
        } catch (error) { reject(error); }
      };

      loop();
    });
  }
});

var $TypeError$1 = TypeError;

// `Iterator.prototype.reduce` method
// https://github.com/tc39/proposal-iterator-helpers
_export({ target: 'Iterator', proto: true, real: true }, {
  reduce: function reduce(reducer /* , initialValue */) {
    var record = getIteratorDirect(this);
    aCallable(reducer);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    var counter = 0;
    iterate(record, function (value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = reducer(accumulator, value, counter);
      }
      counter++;
    }, { IS_RECORD: true });
    if (noInitial) throw $TypeError$1('Reduce of empty iterator with no initial value');
    return accumulator;
  }
});

var has = mapHelpers.has;

// Perform ? RequireInternalSlot(M, [[MapData]])
var aMap = function (it) {
  has(it);
  return it;
};

var remove = mapHelpers.remove;

// `Map.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  deleteAll: function deleteAll(/* ...elements */) {
    var collection = aMap(this);
    var allDeleted = true;
    var wasDeleted;
    for (var k = 0, len = arguments.length; k < len; k++) {
      wasDeleted = remove(collection, arguments[k]);
      allDeleted = allDeleted && wasDeleted;
    } return !!allDeleted;
  }
});

var get = mapHelpers.get;
var has$1 = mapHelpers.has;
var set = mapHelpers.set;

// `Map.prototype.emplace` method
// https://github.com/tc39/proposal-upsert
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  emplace: function emplace(key, handler) {
    var map = aMap(this);
    var value, inserted;
    if (has$1(map, key)) {
      value = get(map, key);
      if ('update' in handler) {
        value = handler.update(value, key, map);
        set(map, key, value);
      } return value;
    }
    inserted = handler.insert(key, map);
    set(map, key, inserted);
    return inserted;
  }
});

// `Map.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  every: function every(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return mapIterate(map, function (value, key) {
      if (!boundFunction(value, key, map)) return false;
    }, true) !== false;
  }
});

var Map$1 = mapHelpers.Map;
var set$1 = mapHelpers.set;

// `Map.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newMap = new Map$1();
    mapIterate(map, function (value, key) {
      if (boundFunction(value, key, map)) set$1(newMap, key, value);
    });
    return newMap;
  }
});

// `Map.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  find: function find(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var result = mapIterate(map, function (value, key) {
      if (boundFunction(value, key, map)) return { value: value };
    }, true);
    return result && result.value;
  }
});

// `Map.prototype.findKey` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  findKey: function findKey(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var result = mapIterate(map, function (value, key) {
      if (boundFunction(value, key, map)) return { key: key };
    }, true);
    return result && result.key;
  }
});

// `SameValueZero` abstract operation
// https://tc39.es/ecma262/#sec-samevaluezero
var sameValueZero = function (x, y) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return x === y || x != x && y != y;
};

// `Map.prototype.includes` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  includes: function includes(searchElement) {
    return mapIterate(aMap(this), function (value) {
      if (sameValueZero(value, searchElement)) return true;
    }, true) === true;
  }
});

// `Map.prototype.keyOf` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  keyOf: function keyOf(searchElement) {
    var result = mapIterate(aMap(this), function (value, key) {
      if (value === searchElement) return { key: key };
    }, true);
    return result && result.key;
  }
});

var Map$2 = mapHelpers.Map;
var set$2 = mapHelpers.set;

// `Map.prototype.mapKeys` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  mapKeys: function mapKeys(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newMap = new Map$2();
    mapIterate(map, function (value, key) {
      set$2(newMap, boundFunction(value, key, map), value);
    });
    return newMap;
  }
});

var Map$3 = mapHelpers.Map;
var set$3 = mapHelpers.set;

// `Map.prototype.mapValues` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  mapValues: function mapValues(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    var newMap = new Map$3();
    mapIterate(map, function (value, key) {
      set$3(newMap, key, boundFunction(value, key, map));
    });
    return newMap;
  }
});

var set$4 = mapHelpers.set;

// `Map.prototype.merge` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, arity: 1, forced: true }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  merge: function merge(iterable /* ...iterables */) {
    var map = aMap(this);
    var argumentsLength = arguments.length;
    var i = 0;
    while (i < argumentsLength) {
      iterate(arguments[i++], function (key, value) {
        set$4(map, key, value);
      }, { AS_ENTRIES: true });
    }
    return map;
  }
});

var $TypeError$2 = TypeError;

// `Map.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var map = aMap(this);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aCallable(callbackfn);
    mapIterate(map, function (value, key) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = callbackfn(accumulator, value, key, map);
      }
    });
    if (noInitial) throw $TypeError$2('Reduce of empty map with no initial value');
    return accumulator;
  }
});

// `Map.prototype.some` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  some: function some(callbackfn /* , thisArg */) {
    var map = aMap(this);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    return mapIterate(map, function (value, key) {
      if (boundFunction(value, key, map)) return true;
    }, true) === true;
  }
});

var $TypeError$3 = TypeError;
var get$1 = mapHelpers.get;
var has$2 = mapHelpers.has;
var set$5 = mapHelpers.set;

// `Map.prototype.update` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: true }, {
  update: function update(key, callback /* , thunk */) {
    var map = aMap(this);
    var length = arguments.length;
    aCallable(callback);
    var isPresentInMap = has$2(map, key);
    if (!isPresentInMap && length < 3) {
      throw $TypeError$3('Updating absent value');
    }
    var value = isPresentInMap ? get$1(map, key) : aCallable(length > 2 ? arguments[2] : undefined)(key, map);
    set$5(map, key, callback(value, key, map));
    return map;
  }
});

var defineProperty = objectDefineProperty.f;

var UNSCOPABLES = wellKnownSymbol('unscopables');
var ArrayPrototype = Array.prototype;

// Array.prototype[@@unscopables]
// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
if (ArrayPrototype[UNSCOPABLES] == undefined) {
  defineProperty(ArrayPrototype, UNSCOPABLES, {
    configurable: true,
    value: objectCreate(null)
  });
}

// add a key to Array.prototype[@@unscopables]
var addToUnscopables = function (key) {
  ArrayPrototype[UNSCOPABLES][key] = true;
};

var $findLastIndex = arrayIterationFromLast.findLastIndex;


// `Array.prototype.findLastIndex` method
// https://github.com/tc39/proposal-array-find-from-last
_export({ target: 'Array', proto: true }, {
  findLastIndex: function findLastIndex(callbackfn /* , that = undefined */) {
    return $findLastIndex(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
  }
});

addToUnscopables('findLastIndex');

/**
 * @module typedArrayConstructor
 */

const upperBounds = new Map();
upperBounds.set([Int8Array, Uint8Array], 255);
upperBounds.set([Int16Array, Uint16Array], 65535);
upperBounds.set([Int32Array, Uint32Array], 4294967295);
upperBounds.set([BigInt64Array, BigUint64Array], 2 ** 64 - 1);
const upperBoundsArray = Array.from(upperBounds.entries());

/**
 * Get a typed array constructor based on the hypothetical max value it could contain. Signed or unsigned.
 *
 * @alias module:typedArrayConstructor
 * @param {number} maxValue The max value expected.
 * @param {boolean} signed Get a signed or unsigned array.
 * @returns {(Uint8Array|Uint16Array|Uint32Array|BigInt64Array|Int8Array|Int16Array|Int32Array|BigInt64Array)}
 * @see [MDN TypedArray objects]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray#typedarray_objects}
 */
const typedArrayConstructor = (maxValue, signed) => {
  const value = signed ? Math.abs(maxValue) : Math.max(0, maxValue);
  return upperBoundsArray[upperBoundsArray.findLastIndex(([_, bound]) => value > Math[Math.sign(maxValue) === -1 ? "ceil" : "floor"](bound / (signed ? 2 : 1))) + 1][0][signed ? 0 : 1];
};

function merge(geometries) {
  const isTypedArray = !Array.isArray(geometries[0].positions);
  const CellsConstructor = isTypedArray ? typedArrayConstructor(geometries.reduce((sum, geometry) => sum + geometry.positions.length / (isTypedArray ? 3 : 1), 0)) : Array;
  const mergedGeometry = {
    cells: new CellsConstructor()
  };
  let vertexOffset = 0;
  for (let i = 0; i < geometries.length; i++) {
    const geometry = geometries[i];
    const vertexCount = geometry.positions.length / (isTypedArray ? 3 : 1);
    for (let attribute of Object.keys(geometry)) {
      if (attribute === "cells") {
        mergedGeometry.cells = isTypedArray ? typedArrayConcat(CellsConstructor, mergedGeometry.cells,
        // Add previous geometry vertex offset mapped via a new typed array
        // because new value could be larger than what current type supports
        new (typedArrayConstructor(vertexOffset + vertexCount))(geometry.cells).map(n => vertexOffset + n)) : mergedGeometry.cells.concat(geometry.cells.map(cell => cell.map(n => vertexOffset + n)));
      } else {
        const isAttributeTypedArray = !Array.isArray(geometry[attribute]);
        mergedGeometry[attribute] ||= isAttributeTypedArray ? new geometry[attribute].constructor() : [];
        mergedGeometry[attribute] = isAttributeTypedArray ? typedArrayConcat(mergedGeometry[attribute].constructor, mergedGeometry[attribute], geometry[attribute]) : mergedGeometry[attribute].concat(geometry[attribute]);
      }
    }
    vertexOffset += vertexCount;
  }
  return mergedGeometry;
}

export default merge;
