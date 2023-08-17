/* eslint-disable  @typescript-eslint/no-explicit-any */
import {useState} from 'react';

export interface StoreOptions<State = any, Name extends string = string, A extends Actions<State> = any> {
  /**
   * A name use to identify the store.
   */
  name: Name extends 'state' | 'actions' ? never: Name;
  /** The initial state of the store. */
  initialState: State;
  /**
 * Functions use to manipulate the state, the state is
 * pass in as the first argument and it optionally accepts
 * a second user define argument.
 * 
 * Actions must return a new state.
 * 
 * @example 
 * //Setting a counter to a specific value. and
 * //incrementing a counter.
 * {
 *   setCounter: (state, value: number) => {
 *      return value;
 *   },
 *   increment: (state) => state + 1; 
 * }
 */
  actions: A
}

/**
 * Functions for manipulating the state.
 */
export interface Actions<State = any> {
  [key: string]: ((state: State, payload?: any) => State);
}

/**
 * Maps the actions function to a wrapper where the
 * first argument(state) is removed.
 */
export type ActionsWithoutState <T extends Actions> = {
  /** Functions for manipulating the state. */
  actions: {[key in keyof T]: Parameters<T[key]>['length'] extends 2? (payload: Parameters<T[key]>[1])=>Parameters<T[key]>[0]
                    : ()=>Parameters<T[key]>[0]}
}

/**
 * Extracts the name from the store options and
 * creates property with the name as key and the state
 * as the value.
 */
export type ExtractStoreName<Name extends string, State> = {
  [key in Name]: State;
}

type SelectFn<S, T extends (state: S)=> ReturnType<T>> = (selectFn: T) => ReturnType<T>

/** Keeps track of the states in components that are using the store. */
export type StateListener = Map<unknown, (state: any)=>void>
/** The state of the store */
export type State<Name extends string = string, S = any> = {[key in Name]: S}; 

export type CreateStoreResults<S, N extends string, A extends Actions<S>> = ExtractStoreName<N, S> & ActionsWithoutState<A>

/**
 * Creates a store that keeps track of a user defined state.
 */
export const createStore = <S, Name extends string, A extends Actions<S>>(options: StoreOptions<S, Name, A>):
[SelectFn<State<Name, S>, (state: State<Name, S>) => S>, SelectFn<ActionsWithoutState<A>['actions'], (actions: ActionsWithoutState<A>['actions']) => ActionsWithoutState<A>['actions'][keyof ActionsWithoutState<A>['actions']]>] => {
  const state = {[options.name]: options.initialState} as  State<Name, S>;
  const stateListeners:StateListener = new Map();

  // Construct the hooks that are use to retrieve the
  // state and actions.
  const useActionSelect = createActions(options.actions, state, options.name, stateListeners);
  const useStoreSelect = createStoreHook(state, options.name, stateListeners);

  return [useStoreSelect, useActionSelect];
};

/**
 * Create a custom hook that can be used inside functions to
 * retrieve the store state.
 */
export const createStoreHook = <StoreState extends State, Name extends string>(state: StoreState, name: Name, stateListeners: StateListener) =>{
  /**
   * Creates a react state from the store and adds the setState
   * function to the listener for triggering updates.
   */
  const useStoreSelect = <T extends (state: StoreState) => ReturnType<T>>(select: T): ReturnType<T> =>{
    const [storeState, setStoreState] = useState<StoreState>(state[name]);
    if(!stateListeners.has(setStoreState)){
      stateListeners.set(setStoreState, setStoreState);
    }
    return select({[name]: storeState} as StoreState);
  } 

  return useStoreSelect;
}

/**
 * Turns the user functions defined at store creation into actions
 * use to interact with the store state.
 */
export const createActions = <StoreState extends State, A extends Actions, Name extends string>(actions: A, state: StoreState, storeName: Name, stateListeners: StateListener) =>{
  const result = {actions: {}} as ActionsWithoutState<A>;
  // Construct a wrapper function for the action that hides
  // the state. when this is called it uses the action to
  // return a new state and then updates all the listeners
  // with the new state.
  for(const key in actions){
    result.actions[key] = (payload?: unknown) => {
      const newState = actions[key](state[storeName], payload);
      state[storeName] = newState;
      stateListeners.forEach(listener => {
        listener(newState);
      })
    }
  }

  const useActionSelect = <T extends (actions: ActionsWithoutState<A>['actions']) => ReturnType<T>>(select: T): ReturnType<T> => {
    return select(result.actions)
  }

  return useActionSelect;
};
