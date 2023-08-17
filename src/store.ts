import { createStore } from './barebone'

export const [useCounterStore, useCounterActions] = createStore({
  name: 'counter',
  initialState: 0,
  actions: {
    increment: (state) => state + 1,
    reset: () => 0,
  },
});
