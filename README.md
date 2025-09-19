
# anyState


## What is anyState?
anystate is a tiny state management library for any framework!
- Just an object has observable function
- Can must be update via setter
- Watch state changed
- Independent any frontend frameworks

Back to basic, the callback function is a point. I put handle onChange in callback functions, this is have identify string to make sure target state has been updated. So, that we can get any changes from anywhere.

## Roadmap
1. [x] Initialize anyState
2. [x] Simple state
3. [x] getItem/setItem
4. [x] Watch onChange

...


## Usage

Initialize anyState object with `createStore()`
  ```js
    const anyState =  createStore({
      name: 'John',
      age: 30,
      children: [{
        name: 'Bob',
        age: 5,
      }]
    });
  ```

Set state
  ```js
    anyState.setState({
      name: 'John',
      age: 32,
      children: [{
        name: 'Bob',
        age: 4,
      }]
    });
  ```

 Get state

  ```js
    const state = anyState.getState();
  ```

 Set item
  ```js
    // const path = 'name';
    const path = 'children[0].name'; // the path to the item
    anyState.setItem(path, 'Jane');
  ```

  Get item

  ```js
    const path = 'children[0]';
    const child = anyState.getItem(path);
  ```

  Watch onChange
  ```js
    const path = 'name'; // path to item
    anyState.watch(path, (nextState, prevState) => {
       // do anything
    });
  ```

  Vue-like Watch (multiple properties)
  ```js
    anyState.watch({
      name: (newValue, oldValue) => {
        console.log(`Name changed from ${oldValue} to ${newValue}`);
      },
      age: (newValue, oldValue) => {
        console.log(`Age changed from ${oldValue} to ${newValue}`);
      },
      'children[0].name': (newValue, oldValue) => {
        console.log(`Child name changed from ${oldValue} to ${newValue}`);
      }
    });
  ```
## Development

  install dependencies:
  ```bash
    npm install
  ```

  run tests:
  ```bash
    npm test
  ```

  dev:
  ```bash
    npm run dev
  ```

## Examples
  [React Todo](/examples/todo-react)
  
  [Solid Todo](/examples/todo-solid)
  
  [Svelte Todo](/examples/todo-svelte)
  
## License
  MIT
