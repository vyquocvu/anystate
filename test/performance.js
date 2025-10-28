const assert = require('assert');
const { createStore } = require('../dist/index');

describe('Performance', () => {
  let logs = [];
  const originalLog = console.log;
  beforeEach(() => {
    console.log = (...args) => {
      logs.push(args.join(' '));
    };
  });
  afterEach(() => {
    console.log = originalLog;
    logs = [];
  });

  it('should track performance', () => {
    const store = createStore({ a: 1 });
    store.setState({ a: 2 });
    assert.strictEqual(store.getState().a, 2);
    assert.ok(logs.some(log => log.includes('setState took')));
    assert.ok(logs.some(log => log.includes('getState took')));
  });

  it('should track memory', () => {
    const store = createStore({ a: 1 });
    store.logMemoryUsage();
    assert.ok(logs.some(log => log.includes('State memory usage')));
  });
});
