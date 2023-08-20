/**
 * Examples of stores.
 */
import { createStore } from './barebone';

export const [useCounterStore, counterActions, asyncActions] = createStore({
  name: 'counter',
  initialState: 0,
  actions: {
    /** Increment counter. */
    increment: (state) => state + 1,
    /** Reset the counter. */
    reset: () => 0,
  },
  asyncActions: {
    /** Reset the counter after a delay. */
    asyncReset: async (set, state, num: number) => {
      console.log(state, num);
      let resolve: (value?: unknown) => void;
      const promise = new Promise((res) => {
        resolve = res;
      });
      setTimeout(() => {
        resolve();
      }, 3000);
      await promise;
      set(0);
    },
  },
});

asyncActions.asyncReset;
counterActions.increment;

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
