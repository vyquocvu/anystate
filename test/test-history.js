var assert = require('assert');
var { createStore } = require('../dist/index.js');

describe('History', function () {
  it('should undo and redo state changes', function () {
    const state = createStore({
      x: 0,
      y: {
        z: 1,
      },
    });

    state.setItem('x', 10);
    state.setItem('y.z', 20);

    assert.deepEqual(state.getState(), {
      x: 10,
      y: {
        z: 20,
      },
    });

    state.undo();
    assert.deepEqual(state.getState(), {
      x: 10,
      y: {
        z: 1,
      },
    });

    state.undo();
    assert.deepEqual(state.getState(), {
      x: 0,
      y: {
        z: 1,
      },
    });

    state.redo();
    assert.deepEqual(state.getState(), {
      x: 10,
      y: {
        z: 1,
      },
    });
  });
});

describe('Snapshots', function () {
  it('should create and restore snapshots', function () {
    const state = createStore({
      x: 0,
      y: {
        z: 1,
      },
    });

    state.setItem('x', 10);
    state.setItem('y.z', 20);

    const snapshot = state.createSnapshot();

    state.setItem('x', 100);
    state.setItem('y.z', 200);

    assert.deepEqual(state.getState(), {
      x: 100,
      y: {
        z: 200,
      },
    });

    state.restoreSnapshot(snapshot);

    assert.deepEqual(state.getState(), {
      x: 10,
      y: {
        z: 20,
      },
    });
  });
});

describe('Action Replay', function () {
    it('should replay actions', function () {
      const state = createStore({
        x: 0,
      });

      const actions = [
        { type: 'SET_ITEM', payload: { key: 'x', value: 10 } },
        { type: 'SET_ITEM', payload: { key: 'x', value: 20 } },
      ];

      actions.forEach((action) => {
        state.replayAction(action);
      });

      assert.deepEqual(state.getState(), { x: 20 });
    });
  });
