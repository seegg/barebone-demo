import './App.css'
import {useCounterStore, useCounterActions} from './store'


function App() {
  const {reset} = useCounterActions(actions => actions);
  return (
    <>
      <div className='reset-button'>
        <button onClick={reset}>
          Reset
        </button>
      </div>
      <div className='counter-container'>
        <InnerCounter count={1}/>
        <InnerCounter count={2}/>
        <InnerCounter count={3}/>
      </div>
    </>
  )
}

export default App

interface Counter {
  count: number;
}

const InnerCounter = ({count}: Counter)=>{
  const counter = useCounterStore(state => {return state.counter});
  const increment = useCounterActions(actions => actions.increment);
  return (
    <div>
      <h1>Counter #{count}</h1>
      <div className="card">
        <button onClick={increment}>
          count is {counter}
        </button>
      </div>
    </div>
  )
}
