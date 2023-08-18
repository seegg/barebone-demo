import './App.css'
import {useCounterStore, useCounterActions, useTitleStore, useTitleActions} from './store'


function App() {
  const {reset} = useCounterActions(actions => actions);
  return (
    <>
      <div className='reset-button'>
        <p>A simple demo using a counter shared between components.</p>
        <button onClick={reset}>
          Reset
        </button>
        <p>Click the button the increment the counters.</p>
        <p>Use the input to the change the card titles.</p>
      </div>
      <div className='counter-container'>
        <InnerCounter count={1}/>
        <InnerCounter count={2}/>
        <TitleController count={3}/>
      </div>
    </>
  )
}

export default App

interface Counter {
  count?: number;
}

const InnerCounter = ({count}: Counter)=>{
  const counter = useCounterStore(state => state.counter);
  const increment = useCounterActions(actions => actions.increment);
  const title = useTitleStore(state => state.Title.value);
  return (
    <div>
      <h1 className='card-title'>{title} {count && '#'+count}</h1>
      <div className="card">
        <button onClick={increment}>
          count is {counter}
        </button>
      </div>
    </div>
  )
}

const TitleController = ({count}: Counter)=>{
  const counter = useCounterStore(
    state => {return state.counter}, 
    state => state.counter % 3 == 0
  );
  const counterActions = useCounterActions(actions => actions);
  const title = useTitleStore(state => state.Title.value);
  const titleActions = useTitleActions(actions => actions);

  const handleOnChange = (ev: React.ChangeEvent<HTMLInputElement>)=>{
    titleActions.updateTitle(ev.target.value);
  }

  return (
    <div>
      <h1 className='card-title'>{title} {count && '#'+count}</h1>
      <div className="card">
        <button onClick={counterActions.increment}>
          count is {counter}
        </button>
        <p>Only increment counter for multiples of 3.</p>
        <input type='text' value={title} onChange={handleOnChange}/>
      </div>
    </div>
  )
}

