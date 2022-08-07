const { createAnyState } = require('../src/index');

  const state = createAnyState({
    x: 0,
    items: [],
  });
  const items = state.getItem(['items']);
  // const { items } = state.getState();

  console.log('items', items);
  // items []
  items.push({ id: 1, name: 'item 1' });
  console.log('check items shadow', items, state.getItem(['items']));
  //check items shadow [ { id: 1, name: 'item 1' } ] []
  state.setItem('items', items);
  console.log('Update setItem', items, state.getItem(['items']));
  // Update setItem [ { id: 1, name: 'item 1' } ] [ { id: 1, name: 'item 1' } ]
  items[0].name = 'item 1 updated';
  state.setItem('items[0]', items[0]);
  console.log('Update Array element', items, state.getItem(['items']));
  // Update Array element [ { id: 1, name: 'item 1 updated' } ] [ { id: 1, name: 'item 1' } ]
  state.setItem('items[0].name', 'item 1 updated updated');
  console.log('Update Array element', items, state.getItem(['items']));
  // Update Array element [ { id: 1, name: 'item 1 updated' } ] [ { id: 1, name: 'item 1 updated updated' } ]

