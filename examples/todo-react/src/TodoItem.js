import { store } from './store';

const TodoItem = ({ onClick, completed, item, index }) => {

  const removeItem = () => {
    const { todos } = store.getState();
    store.setItem('todos', todos.filter((_, i) => i !== index));
  }

  const toggleTodo = (e) => {
    // TODO update get State
    let { todos } = store.getState();
    let currentTodo = todos[index];
    currentTodo = currentTodo.setIn(['status'], e.target.checked ? 'done' : '');
    todos = todos.setIn([index], currentTodo);
    store.setItem('todos', todos);
  }
  return (
    <div key={index}>
      <input onChange={toggleTodo} checked={item.status === 'done'} type="checkbox" />
       {item.text}
       <button onClick={removeItem}> Remove </button>
    </div>
  )
}

export default TodoItem;