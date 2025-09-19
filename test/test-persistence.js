var assert = require('assert');
var { createStore, addPersistence, localStoragePlugin, sessionStoragePlugin, indexedDBPlugin, createCustomPlugin } = require('../dist/index.js');

describe('Persistence Plugins', function () {
  describe('addPersistence function', function () {
    it('should be exportable as a function', function () {
      assert.equal(typeof addPersistence, 'function');
    });

    it('should work with store interface', function () {
      const store = createStore({ count: 0, user: { name: 'John' } });
      
      // Test that the required store methods exist
      assert.equal(typeof store.getState, 'function');
      assert.equal(typeof store.setState, 'function');
      assert.equal(typeof store.getItem, 'function');
      assert.equal(typeof store.setItem, 'function');
      assert.equal(typeof store.watch, 'function');
    });
  });
  
  describe('localStoragePlugin function', function () {
    it('should be exportable as a function', function () {
      assert.equal(typeof localStoragePlugin, 'function');
    });

    it('should return a valid plugin object', function () {
      const plugin = localStoragePlugin('test-key');
      assert.equal(plugin.name, 'localStorage');
      assert.equal(typeof plugin.load, 'function');
      assert.equal(typeof plugin.save, 'function');
      assert.equal(typeof plugin.clear, 'function');
    });
  });

  describe('sessionStoragePlugin function', function () {
    it('should be exportable as a function', function () {
      assert.equal(typeof sessionStoragePlugin, 'function');
    });

    it('should return a valid plugin object', function () {
      const plugin = sessionStoragePlugin('test-key');
      assert.equal(plugin.name, 'sessionStorage');
      assert.equal(typeof plugin.load, 'function');
      assert.equal(typeof plugin.save, 'function');
      assert.equal(typeof plugin.clear, 'function');
    });
  });

  describe('indexedDBPlugin function', function () {
    it('should be exportable as a function', function () {
      assert.equal(typeof indexedDBPlugin, 'function');
    });

    it('should return a valid plugin object', function () {
      const plugin = indexedDBPlugin('test-db', 'test-store', 'test-key');
      assert.equal(plugin.name, 'indexedDB');
      assert.equal(typeof plugin.load, 'function');
      assert.equal(typeof plugin.save, 'function');
      assert.equal(typeof plugin.clear, 'function');
    });
  });

  describe('createCustomPlugin function', function () {
    it('should be exportable as a function', function () {
      assert.equal(typeof createCustomPlugin, 'function');
    });

    it('should create a valid custom plugin', function () {
      const plugin = createCustomPlugin(
        'test-plugin',
        () => ({ test: 'data' }),
        (state) => console.log('Saving:', state),
        () => console.log('Clearing')
      );
      
      assert.equal(plugin.name, 'test-plugin');
      assert.equal(typeof plugin.load, 'function');
      assert.equal(typeof plugin.save, 'function');
      assert.equal(typeof plugin.clear, 'function');
    });
  });

  describe('Custom plugin functionality', function () {
    it('should work with in-memory custom plugin', async function () {
      const store = createStore({ count: 0, user: { name: 'John' } });
      let memoryStorage = null;
      
      const memoryPlugin = createCustomPlugin(
        'memory',
        () => memoryStorage,
        (state) => { memoryStorage = state; },
        () => { memoryStorage = null; }
      );

      const persistence = await addPersistence(store, {
        plugins: [memoryPlugin],
        autoSave: false
      });

      // Test save and load
      store.setItem('count', 5);
      await persistence.save();
      
      assert.deepEqual(memoryStorage, { count: 5, user: { name: 'John' } });
      
      store.setItem('count', 0);
      await persistence.load();
      
      assert.equal(store.getItem('count'), 5);
      
      // Test clear
      await persistence.clear();
      assert.equal(memoryStorage, null);
      
      persistence.destroy();
    });
  });
});