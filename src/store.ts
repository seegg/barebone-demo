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
  initialState: { count: 0, isUpdating: false },
  actions: {
    /** Increment counter. */
    increment: (state) => ({ ...state, count: state.count + 1 }),
    /** Reset the counter. */
    reset: () => ({ count: 0, isUpdating: false }),
    setUpdateStatus: (state, status: boolean) => ({
      ...state,
      isUpdating: status,
    }),
  },
  asyncActions: {
    /** Add some value to the counter after some delay.*/
    addToCounterAsync: async (state, value: number) => {
      let resolve: (value?: unknown) => void;
      const promise = new Promise((res) => {
        resolve = res;
      });
      setTimeout(() => {
        resolve();
      }, 1000);
      await promise;

      return { ...state, count: state.count + value };
    },
  },
});

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
