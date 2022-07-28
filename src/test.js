
const anyState = require('./anyState');
const { createAnyState, getState, setItem, getItem, watch } = anyState;

function main () {
  createAnyState({
    name: 'John',
    age: 30,
    isMarried: false,
    friends: ['Mary', 'Bob'],
  });
  console.log('First State', getState());
  watch('name', (newName, oldName) => {
    console.log(`${oldName} is now ${newName}`);
    console.log('Next State', getState());
  })

  setItem('name', 'Jane');
  setItem('age', 31);
  setItem('isMarried', true);
  console.log(getItem('name')); // John
  console.log(getItem('age')); // 31
  console.log(getItem('isMarried')); // true
}
main();