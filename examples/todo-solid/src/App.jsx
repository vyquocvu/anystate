import { createSignal } from "solid-js";
import { store } from './store';
import AddTodo from "./AddTodo";
import TodoItem from "./TodoItem";

const App = () => {
  const [todos, setTodos] = createSignal(store.getItem('todos') || []);
  store.watch('todos', (newTodos) => {
    setTodos(newTodos)
  });

  return (
    <>
      <For each={todos()}>
       {(item, index) => <TodoItem item={item} index={index} />}
      </For>
      <AddTodo />
    </>
  );
};

export default App;
