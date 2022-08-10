
# anyState


## What is anyState?
- Just an object
- Can must be update via setter
- Watch state changed
- Independent any frontend frameworks

## Roadmap
1. [x] Initialize anyState
2. [x] Simple state
3. [x] getItem/setItem
4. [x] Watch onChange
5. [] Watch onChange with deep optio (inspire by vue)

## Usage

Initialize anyState object with `createAnyState()`
  ```js
    const anyState =  createAnyState({
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

## License
  MIT
