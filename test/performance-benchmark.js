const assert = require('assert');
const { createStore } = require('../dist/index');

describe('Performance Benchmarks', () => {
  const largeState = {};
  for (let i = 0; i < 1000; i++) {
    largeState[`key${i}`] = { value: i };
  }

  it('should handle large state object with setState', () => {
    const store = createStore(largeState);
    const start = process.hrtime();
    store.setState({ key500: { value: 501 } });
    const end = process.hrtime(start);
    const duration = (end[0] * 1e9 + end[1]) / 1e6;
    assert.ok(duration < 10, `setState took ${duration}ms, which is too long.`);
  });

  it('should handle large state object with getState', () => {
    const store = createStore(largeState);
    const start = process.hrtime();
    store.getState();
    const end = process.hrtime(start);
    const duration = (end[0] * 1e9 + end[1]) / 1e6;
    assert.ok(duration < 5, `getState took ${duration}ms, which is too long.`);
  });

  it('should handle watchers with a large state object', () => {
    const store = createStore(largeState);
    let watchCount = 0;
    store.watch('key777', () => {
      watchCount++;
    });
    const start = process.hrtime();
    store.setState({ key777: { value: 778 } });
    const end = process.hrtime(start);
    const duration = (end[0] * 1e9 + end[1]) / 1e6;
    assert.strictEqual(watchCount, 1);
    assert.ok(duration < 10, `Watcher took ${duration}ms, which is too long.`);
  });
});
