/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  Actions,
  StoreOptions,
  State,
  StateListener,
  ActionsWithoutState,
} from './types';

/**
 * Create a store with a given state outside of a functional component
 * and use the functions that are return to interact with the state.
 *
 * Defined a name for the state.
 *
 * Pass in the initial value.
 *
 * Defined actions for interacting with the state.
 *
 * Actions functions must return a new object.
 *
 * @returns Returns a tuple where the first item is a custom hook
 * for subscribing to the state. The second item is a function for
 * retrieving the actions that are used to interact with the state.
 *
 *
 * @example
 * const [useCounterStore, useCounterActions] = createStore(
 *  {
 *    name: 'counter', initialState: { count: 0 },
 *    actions: {
 *      increment: (state) => ({count: state.count + 1}),
 *      add: (state, amount) => ({count: state.count + amount})
 *    }
 *  }
 * );
 *
 * // The state is stored inside a property with a key that
 * // is the same as the name provided during store creation.
 * const { count } = useCounterStore(state => state.counter.count);
 * const counterActions = useCounterActions(actions => actions);
 * counterActions.add(3);
 *
 */
export const createStore = <S, Name extends string, A extends Actions<S>>(
  options: StoreOptions<S, Name, A>,
) => {
  const state = { [options.name]: options.initialState } as State<Name, S>;
  const stateListeners: StateListener = new Map();

  // Construct the hooks that are use to retrieve the
  // state and actions.
  const useActionSelect = createActions(
    options.actions,
    state,
    options.name,
    stateListeners,
  );
  const useStoreSelect = createStoreHook(state, options.name, stateListeners);

  return [useStoreSelect, useActionSelect] as [
    typeof useStoreSelect,
    typeof useActionSelect,
  ];
};

/**
 * Create a custom hook that can be used inside functions to
 * retrieve the store state.
 */
export const createStoreHook = <StoreState extends State, Name extends string>(
  state: StoreState,
  name: Name,
  stateListeners: StateListener,
) => {
  /**
   * Creates a react state from the store and adds the setState
   * function to the listener for triggering updates.
   */
  const useStoreSelect = <T extends (state: StoreState) => ReturnType<T>>(
    select: T,
  ): ReturnType<T> => {
    const [storeState, setStoreState] = useState<StoreState>(state[name]);
    if (!stateListeners.has(setStoreState)) {
      stateListeners.set(setStoreState, setStoreState);
    }
    return select({ [name]: storeState } as StoreState);
  };

  return useStoreSelect;
};

/**
 * Turns the user functions defined at store creation into actions
 * use to interact with the store state.
 */
export const createActions = <
  StoreState extends State,
  A extends Actions,
  Name extends string,
>(
  actions: A,
  state: StoreState,
  storeName: Name,
  stateListeners: StateListener,
) => {
  const result = { actions: {} } as ActionsWithoutState<A>;
  // Construct a wrapper function for the action that hides
  // the state. when this is called it uses the action to
  // return a new state and then updates all the listeners
  // with the new state.
  for (const key in actions) {
    result.actions[key] = (payload?: unknown) => {
      const newState = actions[key](state[storeName], payload);
      state[storeName] = newState;
      stateListeners.forEach((listener) => {
        listener(newState);
      });
    };
  }

  const useActionSelect = <
    T extends (actions: ActionsWithoutState<A>['actions']) => ReturnType<T>,
  >(
    select: T,
  ): ReturnType<T> => {
    return select(result.actions);
  };

  return useActionSelect;
};
