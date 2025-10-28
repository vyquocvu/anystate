const assert = require('assert');
const { createStore } = require('../dist/index');

describe('Edge Case Testing', () => {
  describe('Initial State', () => {
    it('should handle empty initial state', () => {
      const store = createStore();
      assert.deepStrictEqual(store.getState(), {});
    });

    it('should handle initial state with null values', () => {
      const store = createStore({ a: null, b: { c: null } });
      assert.deepStrictEqual(store.getState(), { a: null, b: { c: null } });
    });
  });

  describe('State Updates', () => {
    it('should handle setting state to undefined', () => {
      const store = createStore({ a: 1 });
      store.setState({ a: undefined });
      assert.strictEqual(store.getState().a, undefined);
    });

    it('should handle updates with empty objects', () => {
      const store = createStore({ a: { b: 1 } });
      store.setState({ a: {} });
      assert.deepStrictEqual(store.getState().a, {});
    });

    it('should handle updates with empty arrays', () => {
        const store = createStore({ a: [1, 2, 3] });
        store.setState({ a: [] });
        assert.deepStrictEqual(store.getState().a, []);
    });
  });

  describe('Watchers', () => {
    it('should not trigger watcher for same value update', () => {
      const store = createStore({ a: 1 });
      let watchCount = 0;
      store.watch('a', () => {
        watchCount++;
      });
      store.setState({ a: 1 });
      assert.strictEqual(watchCount, 0);
    });

    it('should handle unwatching inside a watcher', () => {
      const store = createStore({ a: 0 });
      let unwatch;
      let watchCount = 0;
      unwatch = store.watch('a', () => {
        watchCount++;
        unwatch();
      });
      store.setState({ a: 1 });
      store.setState({ a: 2 });
      assert.strictEqual(watchCount, 1);
    });
  });
});
