/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  Actions,
  StoreOptions,
  State,
  StateListeners,
  EqualityFn,
  StoreActions,
  AsyncActions,
  ActionTypes,
} from './types';
/**
 * Creates a store for keeping track and manipulating a state
 * that's pass to it.
 *
 * @param options.name The name for the store.
 * @param options.initialState Value of the initial state.
 * @param options.actions Optional, actions for interacting with the state.
 * The first param of an action function is the state and it accepts
 * any number of additional params for passing in additional data.
 *
 * Actions must return a new state instead of mutating the existing
 * state.
 * @param options.asyncActions Optional, async actions. Unlike synchronous
 * actions where the new state is returned async actions has a callback function
 * as the first param which accepts the new state as the argument updates the store.
 * The second param is now the state.
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
 *    },
 *    asyncActions: {
 *      delayedAddToCount: async (setState, state, value: number) => {
 *        const newState = {count: state.count + value};
 *        // Wait 3000ms before updating the store.
 *        await setTimeout(() => { setState(newState)}, 3000)
 *      }
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
  AsyncActionOptions extends AsyncActions<StateOption>,
  SelectFn extends (state: State<Name, StateOption>) => ReturnType<SelectFn>,
  StoreState extends State<Name, StateOption>,
>(
  options: StoreOptions<StateOption, Name, ActionOption, AsyncActionOptions>,
): [
  <StoreSelect extends SelectFn>(
    select: StoreSelect,
    equalFn?: EqualityFn<StoreState>,
  ) => ReturnType<StoreSelect>,
  StoreActions<ActionOption, ActionTypes.sync>,
  StoreActions<AsyncActionOptions, ActionTypes.async>,
] => {
  const state = { [options.name]: options.initialState } as StoreState;
  const stateListeners: StateListeners<StoreState> = new Map();

  // Construct the hooks that are use to retrieve the
  // state and actions.
  const actions = createActions(
    options.actions || ({} as ActionOption),
    state,
    options.name,
    stateListeners,
  );
  const asyncActions = createActions(
    options.asyncActions || ({} as AsyncActionOptions),
    state,
    options.name,
    stateListeners,
    2,
  );
  const useStore = createUseStoreHook(state, stateListeners);

  return [useStore, actions, asyncActions];
};

/**
 * Create a custom hook that can be used inside functions to
 * retrieve the store state.
 */
export const createUseStoreHook = <StoreState extends State>(
  state: StoreState,
  stateListeners: StateListeners<StoreState>,
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
      stateListeners.set(setStoreState, {
        setState: setStoreState,
        equalFn:
          equalFn ||
          ((oldState, newState) => select(oldState) !== select(newState)),
      });
    }
    return select(storeState);
  };

  return useStoreSelect;
};

/**
 * Turns the user functions defined at store creation into actions
 * use to interact with the store state.
 *
 * For async actions, isAsync must be set to true.
 */
export const createActions = <
  StoreState extends State,
  UserDefinedActions extends Actions,
  Name extends string,
>(
  actions: UserDefinedActions,
  state: StoreState,
  storeName: Name,
  stateListeners: StateListeners<StoreState>,
  actionType: ActionTypes = ActionTypes.sync,
): StoreActions<UserDefinedActions, typeof actionType> => {
  const result = {} as StoreActions<UserDefinedActions, typeof actionType>;
  /**
   * Take each of the actions defined in during store creation and
   * use a wrapper to hide the store state, this way only the params
   * defined by the user will be available on the actions after the
   * store has been created.
   */
  for (const key in actions) {
    /**
     * @param payload user defined params from storeOptions in `createStore`.
     */
    result[key] = (...payload: unknown[]) => {
      if (actionType === ActionTypes.async) {
        /**
         * A function pass to async actions as the first argument. Accepts
         * the values that are use to update the store state.
         * @param newStateValue values for updating the store.
         */
        const updateStateCallback = (newStateValue: any) => {
          const newState = {
            [storeName]: newStateValue,
          } as StoreState;
          updateLocalStates(state, newState, stateListeners);
          state[storeName] = newStateValue;
        };
        actions[key](updateStateCallback, state[storeName], ...payload);
      } else {
        const newStateValue = actions[key](state[storeName], ...payload);
        const newState = {
          [storeName]: newStateValue,
        } as StoreState;
        updateLocalStates(state, newState, stateListeners);
        state[storeName] = newStateValue;
      }
    };
  }
  return result;
};

/**
 * Helper for calling the listeners when the store
 * is being updated.
 * @param oldState current store state.
 * @param newState new state the store is being updated to.
 * @param stateListeners list of listeners.
 */
const updateLocalStates = <StoreState extends State>(
  oldState: StoreState,
  newState: StoreState,
  stateListeners: StateListeners<StoreState>,
) => {
  stateListeners.forEach((listener) => {
    // Check if new store state meets conditions for
    // each local state before updating that local state.
    if (listener.equalFn) {
      if (listener.equalFn(newState, oldState)) {
        listener.setState(newState);
      }
    } else {
      listener.setState(newState);
    }
  });
};
