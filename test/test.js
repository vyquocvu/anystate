
const { createAnyState } = require('../src/index');

function multipleState () {
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
  console.log('state2 ', state2.getState());
}

function child () {
  const state = createAnyState({
    x: 0,
    k: [
      { y:
        {
          z: 0,
        }
      },
      { y: 1 },
      { y: 2 }
    ]
  });

  // watch for changes k
  state.watch('k[0].y', (y, prevy) => {
    console.log('y changed', prevy, 'to ', y);
  });

  // watch for changes child of k[0]
  state.watch('k[0].y.z', (z, prevy) => {
    console.log('z changed', prevy, 'to ', z);
  });

  state.setItem('k[0].y', 'change');
  console.log('state', state.getState());

}
child();