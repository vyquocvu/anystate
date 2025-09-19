var assert = require('assert');
var { createStore, useAnyState, useAnyStateMultiple } = require('../dist/index.js');

describe('React Hooks Integration', function () {
  describe('useAnyState hook', function () {
    it('should be exportable as a function', function () {
      assert.equal(typeof useAnyState, 'function');
    });

    it('should be compatible with store interface', function () {
      const store = createStore({ count: 0, user: { name: 'John' } });
      
      // Test the hook accepts store and path parameters
      // Note: We can't actually run React hooks in Node.js tests without React test environment
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
  
  describe('useAnyStateMultiple hook', function () {
    it('should be exportable as a function', function () {
      assert.equal(typeof useAnyStateMultiple, 'function');
    });
  });
});