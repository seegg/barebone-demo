# [Barebone](src/barebone)
Simple React state management using hooks and with typing for TS.

[Demo](https://seegg.github.io/Barebone-state-management/) using
a simple counter shared between sibling components.


Setting up the store. The `createStore` function returns two custom
hooks, the first is for accessing the state and the second is for
accessing the actions. 

For actions, the first param is always the state of the store. Any
number of optional params can be added for passing in arguments
when the actions are called.

After the store is created the state param for actions is hidden and
only the user defined ones are exposed.

When updating a state, a new state must be returned instead of altering
the existing one.

```ts
import {createStore} from './barebone'

export const [useCounterStore, useCounterActions] = createStore({
  name: 'counter',
  initialState: { count: 0 },
  actions: {
    increment: (state) => ({ ...state, count: state.count + 1 }),
    setCounterTo: (state, value: number) => ({ ...state, count: value }),
    addMultiple: (state, one: number, two: number) => ({
      ...state,
      count: state.count + one + two,
    }),
  },
});

// The signature of addMultiple becomes
(one: number, two: number) ...
// when imported from the store.
```

Import and use the hooks as normal. Both hooks uses a function
for filtering specific values of the state and actions. For the 
`useStore` hook, the values of the state is access through
`state => state.<store name>` where `<store name>` is the name that
was provided while creating the store.
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

The useStore hook also accepts an optional equality function
to check if the local state should be updated or not and rerender
the component.

The equality check is called when the state of the store
changes with the new state and the old state passed in as
arguments.

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

