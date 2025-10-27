var assert = require('assert');
var { createStore } = require('../dist/index.js');

describe('Test State array', function () {
  let state;

  beforeEach(() => {
    state = createStore({
      x: 0,
      items: [],
    });
  });

  describe('Initial state', function () {
    it(`[Not shadow] Should return [ { id: 1, name: 'item 1' } ]`, function () {
      const items = [{ id: 1, name: 'item 1' }];
      state.setItem('items', items);
      assert.deepEqual(state.getItem(['items']), [{ id: 1, name: 'item 1' }]);
    });

    it(`[Not shadow] Should not be mutable from outside`, function () {
      const initialItems = [{ id: 1, name: 'item 1' }];
      state.setItem('items', initialItems);

      const itemsFromState = state.getItem('items');
      itemsFromState[0].name = 'item 1 updated';

      assert.deepEqual(state.getItem(['items']), [{ id: 1, name: 'item 1' }]);
    });

    it(`[Update array element] Should return [ { id: 1, name: 'item 1 updated updated' } ]`, function () {
      const items = [{ id: 1, name: 'item 1' }];
      state.setItem('items', items);
      state.setItem('items[0].name', 'item 1 updated updated');
      assert.deepEqual(state.getItem(['items']), [{ id: 1, name: 'item 1 updated updated' }]);
    });
  });
});
