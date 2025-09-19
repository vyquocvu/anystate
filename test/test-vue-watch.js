var assert = require('assert');
var { createStore } = require('../dist/index.js');

describe('Vue-like Watch', function () {
  describe('Object-based watching', function () {
    it('should watch multiple properties with object syntax', function () {
      const state = createStore({
        name: 'John',
        age: 30,
        nested: {
          value: 'test'
        }
      });

      let nameChanges = [];
      let ageChanges = [];
      let nestedChanges = [];

      // Use Vue-like watch syntax
      state.watch({
        'name': (newVal, oldVal) => {
          nameChanges.push({ new: newVal, old: oldVal });
        },
        'age': (newVal, oldVal) => {
          ageChanges.push({ new: newVal, old: oldVal });
        },
        'nested.value': (newVal, oldVal) => {
          nestedChanges.push({ new: newVal, old: oldVal });
        }
      });

      // Change values and verify watchers are called
      state.setItem('name', 'Jane');
      state.setItem('age', 31);
      state.setItem('nested.value', 'updated');

      // Verify state changes
      assert.deepEqual(state.getState(), {
        name: 'Jane',
        age: 31,
        nested: {
          value: 'updated'
        }
      });

      // Verify watcher calls
      assert.equal(nameChanges.length, 1);
      assert.deepEqual(nameChanges[0], { new: 'Jane', old: 'John' });

      assert.equal(ageChanges.length, 1);
      assert.deepEqual(ageChanges[0], { new: 31, old: 30 });

      assert.equal(nestedChanges.length, 1);
      assert.deepEqual(nestedChanges[0], { new: 'updated', old: 'test' });
    });

    it('should work with array paths', function () {
      const state = createStore({
        items: [
          { name: 'item1', value: 1 },
          { name: 'item2', value: 2 }
        ]
      });

      let item0Changes = [];
      let item1Changes = [];

      state.watch({
        'items[0].name': (newVal, oldVal) => {
          item0Changes.push({ new: newVal, old: oldVal });
        },
        'items[1].value': (newVal, oldVal) => {
          item1Changes.push({ new: newVal, old: oldVal });
        }
      });

      state.setItem('items[0].name', 'updated-item1');
      state.setItem('items[1].value', 22);

      assert.equal(item0Changes.length, 1);
      assert.deepEqual(item0Changes[0], { new: 'updated-item1', old: 'item1' });

      assert.equal(item1Changes.length, 1);
      assert.deepEqual(item1Changes[0], { new: 22, old: 2 });
    });

    it('should throw error for invalid callbacks', function () {
      const state = createStore({ test: 'value' });

      assert.throws(() => {
        state.watch({
          'test': 'not a function'
        });
      }, /callback for path 'test' must be a function/);
    });
  });

  describe('Backward compatibility', function () {
    it('should still support original string-based watch syntax', function () {
      const state = createStore({
        name: 'John',
        age: 30
      });

      let nameChanges = [];

      // Use original watch syntax
      state.watch('name', (newVal, oldVal) => {
        nameChanges.push({ new: newVal, old: oldVal });
      });

      state.setItem('name', 'Jane');

      assert.equal(nameChanges.length, 1);
      assert.deepEqual(nameChanges[0], { new: 'Jane', old: 'John' });
    });

    it('should throw error for invalid arguments', function () {
      const state = createStore({ test: 'value' });

      assert.throws(() => {
        state.watch(123);
      }, /watch: first argument must be a string path or an object with path-callback pairs/);

      assert.throws(() => {
        state.watch('test');
      }, /callback must be a function/);
    });
  });
});