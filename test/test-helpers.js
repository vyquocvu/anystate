var assert = require('assert');
var { isObject, getIn, clonedValues, setIn, getPaths, getIdPath } = require('../dist/index.js');

describe('Helper Functions', function () {
  describe('isObject', function () {
    it('should return true for objects', function () {
      assert.strictEqual(isObject({}), true);
      assert.strictEqual(isObject({ a: 1 }), true);
      assert.strictEqual(isObject([]), true);
    });

    it('should return false for non-objects', function () {
      assert.strictEqual(isObject(null), false);
      assert.strictEqual(isObject(undefined), false);
      assert.strictEqual(isObject(123), false);
      assert.strictEqual(isObject('string'), false);
      assert.strictEqual(isObject(true), false);
    });
  });

  describe('getIn', function () {
    const testObj = { a: { b: { c: 1 } }, d: [2, { e: 3 }] };

    it('should get nested properties', function () {
      assert.strictEqual(getIn(testObj, ['a', 'b', 'c']), 1);
      assert.deepStrictEqual(getIn(testObj, ['d', 1]), { e: 3 });
    });

    it('should return undefined for non-existent paths', function () {
      assert.strictEqual(getIn(testObj, ['a', 'x', 'y']), undefined);
      assert.strictEqual(getIn(testObj, ['d', 2]), undefined);
    });
  });

  describe('clonedValues', function () {
    it('should clone objects', function () {
      const obj = { a: 1 };
      const cloned = clonedValues(obj);
      assert.notStrictEqual(obj, cloned);
      assert.deepStrictEqual(obj, cloned);
    });

    it('should return primitives unchanged', function () {
      assert.strictEqual(clonedValues(1), 1);
      assert.strictEqual(clonedValues('test'), 'test');
      assert.strictEqual(clonedValues(null), null);
    });
  });

  describe('setIn', function () {
    it('should set nested properties', function () {
      const obj = { a: { b: { c: 1 } } };
      setIn(obj, ['a', 'b', 'c'], 2);
      assert.strictEqual(obj.a.b.c, 2);
    });

    it('should not create new properties', function () {
      const obj = { a: {} };
      const result = setIn(obj, ['a', 'b', 'c'], 2);
      assert.deepStrictEqual(result, obj);
    });
  });

  describe('getPaths', function () {
    it('should convert string paths to arrays', function () {
      assert.deepStrictEqual(getPaths('a.b.c'), ['a', 'b', 'c']);
      assert.deepStrictEqual(getPaths('a[0].b'), ['a', 0, 'b']);
      assert.deepStrictEqual(getPaths('a[0][1]'), ['a', 0, 1]);
    });
  });

  describe('getIdPath', function () {
    it('should convert array paths to string IDs', function () {
      assert.strictEqual(getIdPath(['a', 'b', 'c']), 'a/b/c');
      assert.strictEqual(getIdPath(['a', 0, 'b']), 'a/0/b');
    });
  });
});
