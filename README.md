# [Barebone](src/barebone)
Simple React state management using hooks and with typing for TS.

[Demo](https://seegg.github.io/Barebone-state-management/) using
a simple counter shared between sibling components.

## Creating the store
Setting up the store. The `createStore` function returns an object
containing `{useStore, actions, asyncActions, store}`. `useStore` is
for accessing the store inside a functional component. `actions` contains
functions defined by the user for interacting with the store.
`asyncActions` is the same as `actions` but for async functions. `store`
is use for accessing the store outside of components.

When defining `actions` the first param is the state, any additional
param can be included for passing in additional data when the `action`
is called. After the store is created the state param for actions is 
hidden and only the user defined ones are exposed.

When updating a state, a new state must be returned instead of mutating
the existing one.

For `asyncActions` the first param is a callback for setting the new state
and the second param is the current state. Instead of directly returning 
the new state, it's instead pass to the callback as an argument. This allows
for running any additional code directly before and after the action.

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
##
Import and use the hooks as normal. Both hooks uses a function
for filtering specific values of the state and actions. For the 
`useStore` hook, the values of the state is access through
`state => state.<store name>` where `<store name>` is the name that
was provided while creating the store.

Actions can be imported use outside of components.
```ts
import {useCounterStore, useCounterActions} from './counterStore'

const Counter = () => {
  const count = useCounterStore(state => state.counter.count);
  const actions = useCounterActions(actions => actions);

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

The useStore hook also accepts an optional function to test if
the local state should be updated when the store is updated.

The check is done when the store is updating. The new state and
the old state is pass to the function as the first two arguments.

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

