var assert = require('assert');
var { createAnyState } = require('../src/index.js');

describe('GetItem', function () {
  describe('Initial state', function () {
    const state = createAnyState({
      x: 0,
    });
    it('should return {x: 0}', function () {
      assert.deepEqual(state.getState(), {x: 0});
    });
  });
  describe('Initial state with array', function () {
    const state = createAnyState({
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
  it('should return 0', function () {
    const state = createAnyState({
      x: {
        y: 0,
        d: {
          z: 0,
        }
      },
    });
    state.watch('x.y', (y, prevY) => {
      console.log('y changed', prevY, 'to ', y);
    });
    state.setItem('x.y', 1);
    state.setItem('x.d.z', 2);
    // const a = state.getState();
    // console.log("x ----- ", a);
    assert.deepEqual([], []);
  });
});
