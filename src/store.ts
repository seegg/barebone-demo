import { createStore } from './barebone';

export const [useCounterStore, useCounterActions] = createStore({
  name: 'counter',
  initialState: 0,
  actions: {
    increment: (state) => state + 1,
    reset: () => 0,
  },
});

export const [useTitleStore, useTitleActions] = createStore({
  name: 'Title',
  initialState: { value: 'Counter' },
  actions: {
    /** Update the title. */
    updateTitle: (state, value: string) => ({ ...state, value }),
  },
});
