import './App.css'
import { createStore } from './barebone'

const [useCounterStore, useCounterActions] = createStore({name: 'counter', initialState: 0, 
actions: {
  increment: (state)=> state + 1,
  reset: () => 0
}
})


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

interface Count {
  count: number;
}

const InnerCounter = ({count}: Count)=>{
  const counter = useCounterStore(state => state.counter);
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
