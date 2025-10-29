const assert = require('assert');
const { createStore } = require('../dist/index.js');

describe('Middleware', () => {
  it('should call a single middleware', (done) => {
    const middleware = (state, next, payload) => {
      assert.deepStrictEqual(state, { count: 0 });
      next(payload);
      done();
    };
    const store = createStore({ count: 0 }, [middleware]);
    store.setState({ count: 1 });
  });

  it('should call multiple middleware in order', () => {
    let callOrder = [];
    const middleware1 = (state, next, payload) => {
      callOrder.push(1);
      next(payload);
    };
    const middleware2 = (state, next, payload) => {
      callOrder.push(2);
      next(payload);
    };
    const store = createStore({ count: 0 }, [middleware1, middleware2]);
    store.setState({ count: 1 });
    assert.deepStrictEqual(callOrder, [1, 2]);
  });

  it('should modify state with middleware', () => {
    const middleware = (state, next, payload) => {
      next({ ...payload, count: payload.count + 1 });
    };
    const store = createStore({ count: 0 }, [middleware]);
    store.setState({ count: 1 });
    assert.deepStrictEqual(store.getState(), { count: 2 });
  });

  it('should modify state with middleware using setItem', () => {
    const middleware = (state, next, key, value) => {
      next(key, value + 1);
    };
    const store = createStore({ count: 0 }, [middleware]);
    store.setItem('count', 1);
    assert.deepStrictEqual(store.getState(), { count: 2 });
  });

  it('should handle asynchronous middleware', (done) => {
    const middleware = (state, next, payload) => {
      setTimeout(() => {
        next(payload);
        assert.deepStrictEqual(store.getState(), { count: 1 });
        done();
      }, 10);
    };
    const store = createStore({ count: 0 }, [middleware]);
    store.setState({ count: 1 });
  });
});
