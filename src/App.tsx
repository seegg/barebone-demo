import './App.css'
import { createStore } from './barebone'

const [useCounterStore, useCounterActions] = createStore({name: 'counter', initialState: 0, 
actions: {increment: (state)=> {
  return state+1}}})


function App() {
  return (
    <>
      <InnerCounter count={1}/>
      <InnerCounter count={2}/>
      <InnerCounter count={3}/>
    </>
  )
}

export default App

interface Count {
  count: number;
}

const InnerCounter = ({count}: Count)=>{
  const counter = useCounterStore(state => state.counter);
  const incr = useCounterActions(actions => actions.increment);
  return (
    <div>
      <h1>Counter #{count}</h1>
      <div className="card">
        <button onClick={incr}>
          count is {counter}
        </button>
      </div>
    </div>
  )
}
