import { useState } from 'react';
import { store } from './store';


const ButtonCreate = () => {
  const [text, setText] = useState('');
  const onClick = () => {
    const todos = store.getItem('todos')
    store.setItem('todos', todos.concat({
      text: text,
      status: ''
    }));
    setText('');
  }
  return (
    <div>
      <input placeholder='new todo' type="text" value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={onClick}>Create</button>
    </div>
)};
export default ButtonCreate;