var assert = require('assert');
var { createStore } = require('../dist/index.js');

describe('GetItem', function () {
  describe('Initial state', function () {
    const state = createStore({
      x: 0,
    });
    it('should return {x: 0}', function () {
      assert.deepEqual(state.getState(), {x: 0});
    });
  });
  describe('Initial state with array', function () {
    const state = createStore({
      x: 0,
      items: [],
    });

    it('should return  []', function () {
      const items = state.getItem('items');
      assert.deepEqual(items, []);
    });
  });
});

describe('Watch', function () {
  it('should call watch callback with correct values', function () {
    const state = createStore({
      x: {
        y: 0,
        d: {
          z: 0,
        }
      },
    });

    let yValue, prevYValue, zValue, prevZValue;

    state.watch('x.y', (y, prevY) => {
      yValue = y;
      prevYValue = prevY;
    });
    state.watch('x.d.z', (z, prevZ) => {
      zValue = z;
      prevZValue = prevZ;
    });

    state.setItem('x.y', 1);
    state.setItem('x.d.z', 2);

    assert.strictEqual(prevYValue, 0, 'prevY should be 0');
    assert.strictEqual(yValue, 1, 'y should be 1');
    assert.strictEqual(prevZValue, 0, 'prevZ should be 0');
    assert.strictEqual(zValue, 2, 'z should be 2');
  });
});

describe('Watch array', function () {
  it('should watch array element changes', function () {
    const state = createStore({
      x: 0,
      k: [
        { y: { z: 0 } },
        { y: 1 },
        { y: 2 }
      ]
    });

    let yValue, prevYValue, zValue, prevZValue;

    // watch for changes k
    state.watch('k[0].y', (y, prevy) => {
      yValue = y;
      prevYValue = prevy;
    });

    // watch for changes child of k[0]
    state.watch('k[0].y.z', (z, prevz) => {
      zValue = z;
      prevZValue = prevz;
    });

    state.setItem('k[0].y', 1000);

    assert.deepStrictEqual(prevYValue, { z: 0 }, 'prevy should be { z: 0 }');
    assert.strictEqual(yValue, 1000, 'y should be 1000');
    assert.strictEqual(prevZValue, 0, 'prevz should be 0');
    assert.strictEqual(zValue, undefined, 'z should be undefined after parent is replaced');
  });
});
