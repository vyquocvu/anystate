
const createAnyState = require('../src/anyState.js').createAnyState;

function main () {
  const state = createAnyState({
    x: 0,
  });
  console.log('state,', state.getState());
  const state2 = createAnyState({y: 1});

  console.log('state1', state.getState());
  state.watch('x', (x, prevX) => {
    console.log('x changed', x, prevX);
  });
  state.setItem('x', 1);
  console.log('state1 updated', state.getState());
  console.log('state1 getItem', state.getItem(['x']));
  console.log('state2', state2.getState());
}

function testNested () {
  const state = createAnyState({
    x: 0,
    children: [
      { y: 0 },
      { y: 1 },
      { y: 2 }
    ]
  });

  state.watch('children[1].y', (x, prevX) => {
    console.log('x changed', x, prevX);
  });

  state.setItem('children[1].y', 'xxxx');
  console.log('state', state.getState());

}
testNested();