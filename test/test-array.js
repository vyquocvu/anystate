var assert = require('assert');
// const { describe } = require('node:test');
var { createStore } = require('../src/index.js');

describe('Test State array', function () {
  const state = createStore({
    x: 0,
    items: [],
  });
  describe('Initial state', function () {
    const items = state.getItem(['items']);
    // state.watch('items[0]', (item, prevItem) => {
    //   console.log('[x] items[0] changed', prevItem, 'to ', item);
    // });
    items.push({ id: 1, name: 'item 1' });
    it(`[Not shadow] Should return [ { id: 1, name: 'item 1' } ]`, function () {
      state.setItem('items', items);
      assert.deepEqual(state.getItem(['items']), [ { id: 1, name: 'item 1' } ]);
    });

    it(`[Not shadow] Should return [ { id: 1, name: 'item 1' } ]`, function () {
      items[0].name = 'item 1 updated';
      assert.deepEqual(state.getItem(['items']), [ { id: 1, name: 'item 1' } ]);
    });

    it(`[Update array element] Should return [ { id: 1, name: 'item 1 updated updated' } ]`, function () {
      state.setItem('items[0].name', 'item 1 updated updated');
      assert.deepEqual(state.getItem(['items']), [ { id: 1, name: 'item 1 updated updated' } ]);
    });
  });
//   console.log('[4] STATE BEFORE', state.getState());
//   items[0].name = 'item 1 updated';
//   console.log('[5] STATE AFTER', items[0], '|', state.getItem(['items', 0]));
//   state.setItem('items[0]', items[0]);
//   console.log('[7] Update Array element', items,'==>', state.getItem(['items']));
//   // Update Array element [ { id: 1, name: 'item 1 updated' } ] [ { id: 1, name: 'item 1' } ]
//   state.setItem('items[0].name', 'item 1 updated updated');
//   console.log('[8] Update Array element 11', items, '==>', state.getItem(['items']));
//   // Update Array element [ { id: 1, name: 'item 1 updated' } ] [ { id: 1, name: 'item 1 updated updated' } ]


});