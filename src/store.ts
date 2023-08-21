/**
 * Examples of stores.
 */
import { createStore } from './barebone';

export const {
  useStore: useCounterStore,
  actions: counterActions,
  asyncActions: asyncCounterActions,
  store,
} = createStore({
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
    addFourAsync: async (setState, state) => {
      const oldTitle = titleStore.Titles.value;
      titleActions.setTitle('...');

      let resolve: (value?: unknown) => void;
      const promise = new Promise((res) => {
        resolve = res;
      });
      setTimeout(() => {
        resolve();
      }, 1000);

      await promise;

      titleActions.setTitle(oldTitle);
      setState(state + 4);
    },
  },
});

asyncCounterActions.addFourAsync;
counterActions.increment;

const initialState = {
  /** Value of the title. */
  value: 'Counter',
};

export const {
  useStore: useTitleStore,
  actions: titleActions,
  store: titleStore,
} = createStore({
  name: 'Titles',
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
