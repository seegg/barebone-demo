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
 * Creates a store for keeping track and manipulating a state
 * that's pass to it.
 *
 * @param options.name The name for the store.
 *
 * @param options.initialState Value of the initial state.
 *
 * @param options.actions Optional, Defined actions for interacting with the state.
 * Actions must return a new state instead of mutating the existing
 * state.
 *
 * @returns Returns a tuple where the first item is a custom hook
 * for subscribing to the state. The second item is an object containing
 * all the actions.
 *
 *
 * @example
 * const [useCounterStore, counterActions] = createStore(
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
 * // Given the store options above, to access the count:
 * const { count } = useCounterStore(state => state.counter.count);
 * const counterActions = useCounterActions(actions => actions);
 * counterActions.add(3);
 *
 */
export const createStore = <
  StateOption,
  Name extends string,
  ActionOption extends Actions<StateOption>,
  SelectFn extends (state: State<Name, StateOption>) => ReturnType<SelectFn>,
  StoreState extends State<Name, StateOption>,
>(
  options: StoreOptions<StateOption, Name, ActionOption>,
): [
  <StoreSelect extends SelectFn>(
    select: StoreSelect,
    equalFn?: EqualityFn<StoreState>,
  ) => ReturnType<StoreSelect>,
  StoreActions<ActionOption>,
] => {
  const state = { [options.name]: options.initialState } as StoreState;
  const stateListeners: StateListener<StoreState> = new Map();

  // Construct the hooks that are use to retrieve the
  // state and actions.
  const useActionSelect = createActions(
    options.actions || ({} as ActionOption),
    state,
    options.name,
    stateListeners,
  );
  const useStore = createUseStoreHook(state, stateListeners);

  return [useStore, useActionSelect];
};

/**
 * Create a custom hook that can be used inside functions to
 * retrieve the store state.
 */
export const createUseStoreHook = <StoreState extends State>(
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
      const newState = {
        [storeName]: newStateValue || state[storeName],
      } as StoreState;
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
