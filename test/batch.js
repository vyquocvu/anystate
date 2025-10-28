const assert = require('assert');
const { createStore } = require('../dist/index');

describe('Batching', () => {
  it('should batch updates', (done) => {
    const store = createStore({ a: 1, b: 2 });
    let watchCount = 0;
    store.watch('a', () => {
      watchCount++;
    });
    store.watch('b', () => {
      watchCount++;
    });

    store.batch(() => {
      store.setItem('a', 2);
      store.setItem('b', 3);
    });

    assert.strictEqual(store.getItem('a'), 2);
    assert.strictEqual(store.getItem('b'), 3);
    assert.strictEqual(watchCount, 2);
    done();
  });

  it('should run atomic updates', (done) => {
    const store = createStore({ a: 1, b: 2 });
    let watchCount = 0;
    store.watch('a', () => {
      watchCount++;
    });
    store.watch('b', () => {
      watchCount++;
    });

    store.atomic(() => {
      store.setItem('a', 2);
      store.setItem('b', 3);
    });

    assert.strictEqual(store.getItem('a'), 2);
    assert.strictEqual(store.getItem('b'), 3);
    assert.strictEqual(watchCount, 0);
    done();
  });
});
