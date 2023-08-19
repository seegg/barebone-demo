import { createStore } from './barebone';

export const [useCounterStore, useCounterActions] = createStore({
  name: 'counter',
  initialState: 0,
  actions: {
    /** Increment counter. */
    increment: (state) => state + 1,
    /** Reset the counter. */
    reset: () => 0,
  },
});

const initialState = {
  /** Value of the title. */
  value: 'Counter',
};

export const [useTitleStore, useTitleActions] = createStore({
  name: 'Title',
  initialState,
  /** Some actions */
  actions: {
    /** Update the title. */
    updateTitle: (state, value: string) => ({ ...state, value }),
  },
});
