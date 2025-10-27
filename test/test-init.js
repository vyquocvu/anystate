var assert = require('assert');
var { createStore } = require('../dist/index.js');

describe('GetItem', function () {
  describe('Initial state', function () {
    const state = createStore({
      x: 0,
    });
    it('should return {x: 0}', function () {
      assert.deepEqual(state.getState(), {x: 0});
    });
  });
  describe('Initial state with array', function () {
    const state = createStore({
      x: 0,
      items: [],
    });

    it('should return  []', function () {
      const items = state.getItem('items');
      assert.deepEqual(items, []);
    });
  });
});

describe('Watch', function () {
  it('should return Object', function () {
    const state = createStore({
      x: {
        y: 0,
        d: {
          z: 0,
        }
      },
    });
    state.watch('x.y', (y, prevY) => {
      console.log('y changed', prevY, 'to ', y);
    });
    state.watch('x.d.z', (z, prevZ) => {
      console.log('z changed', prevZ, 'to ', z);
    });
    state.setItem('x.y', 1);
    state.setItem('x.d.z', 2);
    assert.deepEqual(state.getState(), {
      x: {
        y: 1,
        d: {
          z: 2,
        }
      },
    });
  });
});

describe('Watch array', function () {
  it('should return 0', function () {
    const state = createStore({
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

    state.setItem('k[0].y', 1000);
    assert.deepEqual(state.getState(), {
      x: 0,
      k: [
        { y:1000 },
        { y: 1 },
        { y: 2 }
      ]
    });
  })
});

describe('Reset', function () {
  it('should reset the state to its initial value', function () {
    const state = createStore({
      x: 0,
      y: {
        z: 1,
      },
    });

    state.setItem('x', 10);
    state.setItem('y.z', 20);

    assert.deepEqual(state.getState(), {
      x: 10,
      y: {
        z: 20,
      },
    });

    let watchedValue;
    state.watch('x', (newValue) => {
      watchedValue = newValue;
    });

    state.reset();

    assert.deepEqual(state.getState(), {
      x: 0,
      y: {
        z: 1,
      },
    });

    assert.equal(watchedValue, 0);
  });
});

describe('Advanced Reset', function () {
  const createInitialState = () => ({
    user: {
      name: 'John Doe',
      details: {
        email: 'john.doe@example.com',
        address: {
          city: 'New York',
          zip: '10001'
        }
      }
    },
    posts: [
      { id: 1, title: 'First Post' },
      { id: 2, title: 'Second Post' }
    ],
    metadata: {
      lastUpdated: 0
    }
  });

  it('should reset a deeply nested state object and notify multiple watchers', function () {
    const initialState = createInitialState();
    const store = createStore(initialState);

    // Modify the state deeply
    store.setItem('user.details.address.city', 'San Francisco');
    store.setItem('posts[0].title', 'Updated First Post');
    store.setItem('metadata.lastUpdated', Date.now());

    // Setup watchers
    let userNameChanged = false;
    let cityChanged = false;
    let firstPostTitleChanged = false;
    let lastUpdatedChanged = false;

    let finalCityValue;
    let finalPostTitleValue;

    store.watch('user.name', () => {
      userNameChanged = true; // This should not be triggered as it is not changed before reset
    });

    store.watch('user.details.address.city', (newCity) => {
      cityChanged = true;
      finalCityValue = newCity;
    });

    store.watch('posts[0].title', (newTitle) => {
      firstPostTitleChanged = true;
      finalPostTitleValue = newTitle;
    });

    store.watch('metadata.lastUpdated', () => {
        lastUpdatedChanged = true;
    });

    // Reset the store
    store.reset();

    // Verify the state is back to the initial state
    assert.deepEqual(store.getState(), createInitialState());

    // Verify watchers were triggered correctly
    assert.strictEqual(userNameChanged, false, 'User name watcher should not have been triggered');
    assert.strictEqual(cityChanged, true, 'City watcher should have been triggered');
    assert.strictEqual(firstPostTitleChanged, true, 'Post title watcher should have been triggered');
    assert.strictEqual(lastUpdatedChanged, true, 'Last updated watcher should have been triggered');

    assert.strictEqual(finalCityValue, 'New York', 'Final city value should be the initial value');
    assert.strictEqual(finalPostTitleValue, 'First Post', 'Final post title value should be the initial value');
  });

  it('should handle multiple resets correctly', function () {
    const initialState = createInitialState();
    const store = createStore(initialState);

    // First modification and reset
    store.setItem('user.name', 'Jane Doe');
    store.reset();
    assert.deepEqual(store.getState(), createInitialState(), 'State should be reset after first modification');

    // Second modification (more complex) and reset
    store.setItem('posts[1].title', 'A Whole New Title');
    store.setItem('user.details.email', 'jane.doe@example.com');
    store.reset();
    assert.deepEqual(store.getState(), createInitialState(), 'State should be reset after second modification');

    // Verify watcher behavior after multiple resets
    let watchCount = 0;
    store.watch('user.name', () => {
      watchCount++;
    });

    store.setItem('user.name', 'Again');
    store.reset(); // Should trigger the watcher

    store.setItem('user.name', 'And Again');
    store.reset(); // Should trigger the watcher again

    assert.deepEqual(store.getState(), createInitialState());
    assert.strictEqual(watchCount, 4, 'Watcher should have been triggered for each state change');
  });
});
