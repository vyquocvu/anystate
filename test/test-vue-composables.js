var assert = require('assert');
var { createStore, useAnyStateVue, useAnyStateMultipleVue, useAnyStateComputed } = require('../dist/index.js');

describe('Vue Composables Integration', function () {
  describe('useAnyStateVue composable', function () {
    it('should be exportable as a function', function () {
      assert.equal(typeof useAnyStateVue, 'function');
    });

    it('should be compatible with store interface', function () {
      const store = createStore({ count: 0, user: { name: 'John' } });
      
      // Test that the composable accepts store and path parameters
      // Note: We can't actually run Vue composables in Node.js tests without Vue test environment
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
  
  describe('useAnyStateMultipleVue composable', function () {
    it('should be exportable as a function', function () {
      assert.equal(typeof useAnyStateMultipleVue, 'function');
    });
  });

  describe('useAnyStateComputed composable', function () {
    it('should be exportable as a function', function () {
      assert.equal(typeof useAnyStateComputed, 'function');
    });
  });
});