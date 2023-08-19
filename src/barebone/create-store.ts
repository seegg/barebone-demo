/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import type {
  Actions,
  StoreOptions,
  State,
  StateListener,
  ActionsWithoutState,
  EqualityFn,
  StoreActions,
} from './types';

/**
 * Create a store with a given state outside of a functional component
 * and use the functions that are return to interact with the state.
 *
 * Defined a name for the state.
 *
 * Pass in the value of the initial state.
 *
 * Defined actions for interacting with the state.
 *
 * Actions must return a new state instead of altering the existing
 * state.
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
  const stateListeners: StateListener<State<Name, S>> = new Map();

  // Construct the hooks that are use to retrieve the
  // state and actions.
  const useActionSelect = createActions(
    options.actions,
    state,
    options.name,
    stateListeners,
  );
  const useStoreSelect = createStoreHook(state, stateListeners);

  return [useStoreSelect, useActionSelect] as [
    <SelectFn extends (state: State<Name, S>) => ReturnType<SelectFn>>(
      select: SelectFn,
      equalFn?: EqualityFn<State<Name, S>>,
    ) => ReturnType<SelectFn>,
    typeof useActionSelect,
  ];
};

/**
 * Create a custom hook that can be used inside functions to
 * retrieve the store state.
 */
export const createStoreHook = <StoreState extends State>(
  state: StoreState,
  stateListeners: StateListener<StoreState>,
): (<SelectFn extends (state: StoreState) => ReturnType<SelectFn>>(
  select: SelectFn,
  equalFn?: EqualityFn<StoreState>,
) => ReturnType<SelectFn>) => {
  /**
   * A Hook use for accessing the state of the store.
   *
   * @param select Function that takes the store state as the argument
   * and can be use to narrow down the value returned.
   *
   * @param equalFn Function that is called when the store state updates.
   * The new state and the old state is passed in as arguments. Can be
   * use to decide whether to trigger local state update and rerender the
   * component.
   */
  const useStoreSelect = <T extends (state: StoreState) => ReturnType<T>>(
    select: T,
    equalFn?: EqualityFn<StoreState>,
  ): ReturnType<T> => {
    const [storeState, setStoreState] = useState<StoreState>(state);
    // Use the setState function as the key to trigger rerenders at
    // related components.
    if (!stateListeners.has(setStoreState)) {
      stateListeners.set(setStoreState, { setState: setStoreState });
    }
    // Add the equality function to stateListener that is use to check if
    // the specific component should rerender or not.
    if (equalFn) {
      // not possible for listener to be undefined.
      const listener = stateListeners.get(setStoreState);
      listener!.equalFn = equalFn;
    }
    return select(storeState);
  };

  return useStoreSelect;
};

/**
 * Turns the user functions defined at store creation into actions
 * use to interact with the store state.
 */
export const createActions = <
  StoreState extends State,
  UserDefinedActions extends Actions,
  Name extends string,
>(
  actions: UserDefinedActions,
  state: StoreState,
  storeName: Name,
  stateListeners: StateListener<StoreState>,
): StoreActions<UserDefinedActions> => {
  const result = { actions: {} } as ActionsWithoutState<UserDefinedActions>;

  /**
   * Take each of the actions defined in during store creation and
   * use a wrapper to hide the store state, this way only the params
   * defined by the user will be available on the actions after the
   * store has been created.
   */
  for (const key in actions) {
    /**
     *
     * @param payload user defined params from storeOptions in `createStore`.
     */
    result.actions[key] = (...payload: unknown[]) => {
      const newStateValue = actions[key](state[storeName], ...payload);
      const newState = { [storeName]: newStateValue } as StoreState;
      stateListeners.forEach((listener) => {
        if (listener.equalFn) {
          if (listener.equalFn(newState, state)) {
            listener.setState(newState);
          }
        } else {
          listener.setState(newState);
        }
      });
      state = newState;
    };
  }
  return result.actions;
};
