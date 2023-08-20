/**
 * Examples of stores.
 */
import { createStore } from './barebone';

export const [useCounterStore, counterActions, asyncCounterActions] =
  createStore({
    name: 'counter',
    initialState: 0,
    actions: {
      /** Increment counter. */
      increment: (state) => state + 1,
      /** Reset the counter. */
      reset: () => 0,
    },
    asyncActions: {
      /** Add 4 to the counter after some delay. */
      addFourAsync: async (set, state) => {
        titleActions.setTitle('updating...');
        let resolve: (value?: unknown) => void;
        const promise = new Promise((res) => {
          resolve = res;
        });
        setTimeout(() => {
          resolve();
        }, 500);
        await promise;
        set(state + 4);
        titleActions.setTitle('counter');
      },
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
     * set the title.
     * @param value value of the new title.
     */
    setTitle: (state, value: string) => ({ ...state, value }),
  },
});
