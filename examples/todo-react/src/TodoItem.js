import { store } from './store';

const TodoItem = ({ onClick, completed, item, index }) => {

  const removeItem = () => {
    let todos = store.getItem('todos');
    store.setItem('todos', todos.filter((_, i) => i !== index));
  }

  const toggleTodo = (e) => {
    // TODO update get State
    let todos = store.getItem('todos');
    todos[index].status = e.target.checked ? 'done' : '';
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