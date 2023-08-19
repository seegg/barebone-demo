import { createStore } from './barebone';

export const [useCounterStore, counterActions] = createStore({
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

export const [useTitleStore, titleActions] = createStore({
  name: 'Title',
  initialState,
  /** Some actions */
  actions: {
    /**
     * updates the title.
     * @param value value of the new title.
     */
    updateTitle: (state, value: string) => ({ ...state, value }),
  },
});
