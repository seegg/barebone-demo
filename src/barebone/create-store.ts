/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
  Actions,
  StoreOptions,
  State,
  StateListener,
  ActionsWithoutState,
  ProcessedAction,
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
    typeof useStoreSelect,
    typeof useActionSelect,
  ];
};

type EqualityFn<State> = (newState: State, oldState: State) => boolean 

/**
 * Custom hook for accessing the store state, takes a select 
 * function as the first param that is use for selecting specific
 * properties from the store.
 */
type UseStoreHook<
  StoreState, 
  SelectFn extends (...args: any)=> any,
> = (select: SelectFn, equalFn?: EqualityFn<StoreState>) => ReturnType<SelectFn>;

/**
 * Create a custom hook that can be used inside functions to
 * retrieve the store state.
 */
export const createStoreHook = <
  StoreState extends State, 
  T extends (state: StoreState) => ReturnType<T>
  >(
    state: StoreState,
    stateListeners: StateListener<StoreState>,
  ): UseStoreHook<StoreState, T> => {
  /**
   * A Hook use for accessing the state of the store.
   * 
   * @param select Function that takes the store state as the argument
   * and can be use to narrow down the value returned.
   * @param equalFn Function that is called when the store state updates.
   * The new state and the old state is passed in as arguments. Can be
   * use to decide whether to trigger local state update and rerender the
   * component.
   * @returns 
   */
  const useStoreSelect = <T extends (state: StoreState) => ReturnType<T>>(
    select: T,
    equalFn?: EqualityFn<StoreState>
  ): ReturnType<T> => {
    const [storeState, setStoreState] = useState<StoreState>(state);
    // Use the setState function as the key to trigger rerenders at
    // related components.
    if (!stateListeners.has(setStoreState)) {
      stateListeners.set(setStoreState, {setState: setStoreState});
    }
    // Add the equality function to stateListener that is use to check if
    // the specific component should rerender or not.
    if(equalFn){
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
  A extends Actions,
  Name extends string,
>(
  actions: A,
  state: StoreState,
  storeName: Name,
  stateListeners: StateListener<StoreState>,
):<T extends (actions: { [key in keyof A]: ProcessedAction<A[key], Parameters<A[key]>>; }) => ReturnType<T>>(select: T) => ReturnType<T> => {
  const result = { actions: {} } as ActionsWithoutState<A>;
  // Construct a wrapper function for the action that hides
  // the state. when this is called it uses the action to
  // return a new state and then updates all the listeners
  // with the new state.
  for (const key in actions) {
    result.actions[key] = (...payload: unknown[]) => {
      // Calculate the new state and call the equality function
      // of each listener to see if they should be rerendered or not.
      const newStateValue = actions[key](state[storeName], ...payload);
      const newState = {[storeName]: newStateValue} as StoreState;
      stateListeners.forEach((listener) => {
        if(listener.equalFn){
          if(listener.equalFn(newState, state)){
            listener.setState(newState);
          }         
        }else{
          listener.setState(newState);
        }
      });
      state = newState;
    };
  }
  /**
   * A function for accessing the user defined actions that are 
   * used to manipulate the store state.
   * 
   * @param select A function with all the actions of the store
   * as argument. Can be use to select a set of specific actions.
   */
  const useActionSelect = <
    T extends (actions: ActionsWithoutState<A>['actions']) => ReturnType<T>,
  >(
    select: T,
  ): ReturnType<T> => {
    return select(result.actions);
  };

  return useActionSelect;
};
