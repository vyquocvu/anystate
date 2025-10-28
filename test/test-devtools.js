const assert = require('assert');
const { createStore } = require('../dist/index');
const { JSDOM } = require('jsdom');

describe('DevTools Integration', () => {
  let dom;

  beforeEach(() => {
    dom = new JSDOM('<!DOCTYPE html><html><head></head><body></body></html>', {
      url: 'http://localhost/',
    });
    global.window = dom.window;
    global.document = dom.window.document;
  });

  afterEach(() => {
    dom.window.close();
  });

  it('should connect to the DevTools extension and send initial state', () => {
    let connected = false;
    let initialStateSent = false;

    window.__REDUX_DEVTOOLS_EXTENSION__ = {
      connect: () => {
        connected = true;
        return {
          init: (state) => {
            initialStateSent = true;
            assert.deepStrictEqual(state, { a: 1 });
          },
          subscribe: () => {},
        };
      },
    };

    createStore({ a: 1 });

    assert.strictEqual(connected, true, 'Did not connect to DevTools');
    assert.strictEqual(initialStateSent, true, 'Did not send initial state');
  });

  it('should send state updates to the DevTools extension', () => {
    let sendCalled = 0;

    window.__REDUX_DEVTOOLS_EXTENSION__ = {
      connect: () => ({
        init: () => {},
        subscribe: () => {},
        send: (action, state) => {
          sendCalled++;
          if (action.type.startsWith('@performance')) {
            return;
          }
          assert.strictEqual(action.type, 'setState');
          assert.deepStrictEqual(state, { a: 2 });
        },
      }),
    };

    const store = createStore({ a: 1 });
    store.setState({ a: 2 });

    assert.strictEqual(sendCalled > 0, true, 'Did not send state update');
  });

  it('should handle time-travel messages from the DevTools extension', () => {
    let subscribeCallback;

    window.__REDUX_DEVTOOLS_EXTENSION__ = {
      connect: () => ({
        init: () => {},
        subscribe: (callback) => {
          subscribeCallback = callback;
        },
        send: () => {},
      }),
    };

    const store = createStore({ a: 1 });

    assert.deepStrictEqual(store.getState(), { a: 1 });

    if (!subscribeCallback) {
      assert.fail('subscribe was not called by the devtools connector');
    }

    // Simulate time travel
    subscribeCallback({
      type: 'DISPATCH',
      payload: { type: 'JUMP_TO_STATE' },
      state: JSON.stringify({ a: 3 }),
    });

    assert.deepStrictEqual(store.getState(), { a: 3 }, 'Did not handle time-travel message correctly');
  });
});
