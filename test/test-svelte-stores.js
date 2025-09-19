var assert = require('assert');
var { createStore, createAnyStateStore, createAnyStateStores, createAnyStateDerived, createAnyStateReadable } = require('../dist/index.js');

describe('Svelte Stores Integration', function () {
  describe('createAnyStateStore function', function () {
    it('should be exportable as a function', function () {
      assert.equal(typeof createAnyStateStore, 'function');
    });

    it('should be compatible with store interface', function () {
      const store = createStore({ count: 0, user: { name: 'John' } });
      
      // Test that the function accepts store and path parameters
      // Note: We can't actually run Svelte stores in Node.js tests without Svelte test environment
      // But we can test that the functions exist and have correct interfaces
      assert.equal(typeof store.getItem, 'function');
      assert.equal(typeof store.setItem, 'function');
      assert.equal(typeof store.watch, 'function');
      
      // Test that the required store methods work as expected
      assert.equal(store.getItem('count'), 0);
      assert.equal(store.getItem('user.name'), 'John');
      
      let watchCalled = false;
      const unwatch = store.watch('count', (newValue, oldValue) => {
        watchCalled = true;
        assert.equal(oldValue, 0);
        assert.equal(newValue, 1);
      });
      
      store.setItem('count', 1);
      assert.equal(watchCalled, true);
      
      if (typeof unwatch === 'function') {
        unwatch();
      }
    });
  });
  
  describe('createAnyStateStores function', function () {
    it('should be exportable as a function', function () {
      assert.equal(typeof createAnyStateStores, 'function');
    });
  });

  describe('createAnyStateDerived function', function () {
    it('should be exportable as a function', function () {
      assert.equal(typeof createAnyStateDerived, 'function');
    });
  });

  describe('createAnyStateReadable function', function () {
    it('should be exportable as a function', function () {
      assert.equal(typeof createAnyStateReadable, 'function');
    });
  });
});