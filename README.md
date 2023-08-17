# [Barebone](src/barebone)
Simple React state management using hooks and with typing for TS.

[Demo](https://seegg.github.io/Barebone-state-management/) using
a simple counter shared between sibling components.

```ts
//Set up the store outside of components.
export const [useCounterStore, useCounterActions] = createStore({
  name: 'counter',
  initialState: { count: 0 },
  actions: {
    increment: state => ({...state, count: state.count + 1}),
    setCounterTo: (state, value: number) => ({...state, count: value}),
  },
});
```

```ts
//Import and use the hooks.
import {useCounterStore, useCounterActions} from '...'

const Counter = () => {
  const count = useCounterStore(state => state.counter.count);
  const actions = useCounterActions(actions => actions);

  // After the actions are exported only the non-state
  // param is exposed. 
  const setCountTo = (value: number) => {
    actions.setCounterTo(value);
  }

  return(
    ...
    <button onClick={actions.increment}>
          count is {count}
    </button>
    ...
  )
}

```

The useStore hook also accepts an optional equality function
to check if the local state should be updated or not and rerender
the component.

```ts

// The equality check is called when the state of the store
// changes with the new state and the old state passed in as
// arguments.
const Counter = () => {
  // Only update the local count if the store count is bigger
  // than the local count by at least 3.
  const count = useCounterStore(
    state => state.counter.count,
    (newState, oldState) => newState.counter.count - count > 3
    );
  const actions = useCounterActions(actions => actions);
}

```

