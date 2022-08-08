import { store } from './store';

const TodoItem = ({ item, index }) => {

  const idx = index();
  const removeItem = () => {
    let todos = store.getItem('todos');
    store.setItem('todos', todos.filter((_, i) => i !== idx));
  }

  const toggleTodo = (e) => {
    // TODO update get State
    let todos = store.getItem('todos');
    todos[idx].status = e.target.checked ? 'done' : '';
    store.setItem('todos', todos);
  }
  return (
    <div key={idx}>
      <input onChange={toggleTodo} checked={item.status === 'done'} type="checkbox" />
       {item.text}
       <button onClick={removeItem}> Remove </button>
    </div>
  )
}

export default TodoItem;