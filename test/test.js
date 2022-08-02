
const anyState = require('../src/anyState');
const { createAnyState, getState, setItem, getItem, watch } = anyState;

function main () {
  createAnyState({
    name: 'John',
    age: 30,
    children: [{
      name: 'Bob',
      age: 5,
    }]
  });
  const state = getState();
  console.log('First State', state);
  state.name = 'Jane';
  console.log('Not State', state);
  console.log('Update State', getState());
  watch('name', (newName, oldName) => {
    console.log(`${oldName} is now ${newName}`);
    console.log('Next State', getState());
  })

  setItem('name', 'Jane');
  console.log('children', getItem('children.0'));
}
main();