const { createAnyState } = require('../dist/index');

  const state = createAnyState({
    x: 0,
    items: [],
  });
  const items = state.getItem(['items']);
  // const { items } = state.getState();
  state.watch('items[0]', (item, prevItem) => {
    console.log('[x] items[0] changed', prevItem, 'to ', item);
  });


  console.log('[1] items', items);
  // items []
  items.push({ id: 1, name: 'item 1' });
  console.log('[2] Check items shadow', items == state.getItem(['items']));
  // Check items shadow [ { id: 1, name: 'item 1' } ] []
  state.setItem('items', items);
  console.log('[3] Update setItem', items, '==>', state.getItem(['items']));
  // Update setItem [ { id: 1, name: 'item 1' } ] [ { id: 1, name: 'item 1' } ]
  console.log('[4] STATE BEFORE', state.getState());
  items[0].name = 'item 1 updated';
  console.log('[5] STATE AFTER', items[0], '|', state.getItem(['items', 0]));
  state.setItem('items[0]', items[0]);
  console.log('[7] Update Array element', items,'==>', state.getItem(['items']));
  // Update Array element [ { id: 1, name: 'item 1 updated' } ] [ { id: 1, name: 'item 1' } ]
  state.setItem('items[0].name', 'item 1 updated updated');
  console.log('[8] Update Array element 11', items, '==>', state.getItem(['items']));
  // Update Array element [ { id: 1, name: 'item 1 updated' } ] [ { id: 1, name: 'item 1 updated updated' } ]

