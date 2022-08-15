var assert = require('assert');
var { createStore } = require('../src/index.js');

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
  it('should return Object', function () {
    const state = createStore({
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
    state.watch('x.d.z', (z, prevZ) => {
      console.log('z changed', prevZ, 'to ', z);
    });
    state.setItem('x.y', 1);
    state.setItem('x.d.z', 2);
    assert.deepEqual(state.getState(), {
      x: {
        y: 1,
        d: {
          z: 2,
        }
      },
    });
  });
});

describe('Watch array', function () {
  it('should return 0', function () {
    const state = createStore({
      x: 0,
      k: [
        { y:
          {
            z: 0,
          }
        },
        { y: 1 },
        { y: 2 }
      ]
    });

    // watch for changes k
    state.watch('k[0].y', (y, prevy) => {
      console.log('y changed', prevy, 'to ', y);
    });

    // watch for changes child of k[0]
    state.watch('k[0].y.z', (z, prevy) => {
      console.log('z changed', prevy, 'to ', z);
    });

    state.setItem('k[0].y', 1000);
    assert.deepEqual(state.getState(), {
      x: 0,
      k: [
        { y:1000 },
        { y: 1 },
        { y: 2 }
      ]
    });
  })
});
