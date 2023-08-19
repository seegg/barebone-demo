# [Barebone](src/barebone)
Simple React state management using hooks and with typing for TS.

[Demo](https://seegg.github.io/Barebone-state-management/) using
a simple counter shared between sibling components.

## Creating the store
The `createStore` function returns an object
```ts
const {useStore, actions, asyncActions, store} = createStore({...storeOptions});
```
`useStore` is for accessing the store inside a functional component. 
`actions` contains functions defined by the user for interacting with 
the store. `asyncActions` is the same as `actions` but for async functions. 
`store` is for accessing the store outside of React components.

When defining `actions` the first param is the state, any additional
param can be included for passing in additional data when the `action`
is called. After the store is created the state param for actions is 
hidden and only the user defined ones are exposed.

When updating a state, a new state must be returned instead of mutating
the existing one.

```ts
import {createStore} from './barebone'

export const {useStore, actions, store} = createStore({
  name: 'counter',
  initialState: { count: 0 },
  actions: {
    increment: (state) => ({ count: state.count + 1 }),
    setCounterTo: (state, value: number) => ({ ...state, count: value }),
    addMultiple: (state, one: number, two: number) => ({
      ...state,
      count: state.count + one + two,
    }),
    reset: () => ({count: 0})
  },
});

// The signature of addMultiple becomes
(one: number, two: number) => void
// when imported from the store.
```
## Async Actions

To use async actions, include them under `asyncActions` while creating the
store. Unlike synchronous actions the first param is a callback for setting 
the new state and the second param is the current state. Instead of directly 
returning the new state, it's instead pass to the callback as an argument. 
This allows for running any additional code directly before and after the 
action. After creating the store, import and use async actions the same
way as synchronous actions.

```ts
import {createStore} from './barebone'

export const {useStore, asyncActions, store} = createStore({
  name: 'counter',
  initialState: { count: 0 },
  asyncActions: {
    // Delay updating the store by 3 seconds.
    delayedAddToCount: async (setState, state, value: number) => {
      const newState = {count: state.count + value};
      console.log('Start updating counter store.')
      await setTimeout(() => { setState(newState)}, 3000);
      console.log('Updated counter store after 3 seconds.')
    }
  }
});
```
## Using the store
Import the hook and actions from where the store is defined.
`useStore` uses a select function where the store is pass in
as the argument and can be use for selecting specific properties
from the store.

Actions are not restricted to components and can be use anywhere.
```ts
import {useStore: useCounterStore, actions} from './counterStore'

const Counter = () => {
  const count = useCounterStore(state => state.counter.count);

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

The `useStore` hook also accepts an optional function to test if
the local state should be updated along with the store.

This check is done when the store is updating. The new state and
the old state is pass to the function as the first two arguments for
convenience and returns a boolean indicating whether the local state
should be updated.

```ts
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
