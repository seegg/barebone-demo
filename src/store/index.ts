/* eslint-disable  @typescript-eslint/no-explicit-any */

interface StoreOptions<State = any, Name extends string = string, A extends Actions<State> = any> {
  /**
   * A name use to identify the store. This name also becomes
   * a property after the createStore call that can be use
   * to access the state.
   */
  name: Name extends 'state'? never: Name;
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
interface Actions<State = any> {
  [key: string]: ((state: State)=>State) | ((state: State, payload: any) => State);
}

/**
 * Maps the actions function to a wrapper where the
 * first argument(state) is removed.
 */
type ActionsWithoutState <T extends Actions> = {
  /** Functions for manipulating the state. */
  actions: {[key in keyof T]: Parameters<T[key]>['length'] extends 2? (payload: Parameters<T[key]>[1])=>Parameters<T[key]>[0]
                    : ()=>Parameters<T[key]>[0]}
}

/**
 * Extracts the name from the store options and
 * creates property with the name as key and the state
 * as the value.
 */
type ExtractStoreName<Name extends string, State> = {
  [key in Name]: State;
}

type State<S> = {value: S}; 

type CreateStoreResults<S, N extends string, A extends Actions<S>> = ExtractStoreName<N, S> & ActionsWithoutState<A>

export const c3 = <S, Name extends string, A extends Actions<S>>(options: StoreOptions<S, Name, A>): CreateStoreResults<S, Name, A>=> {
  const state: State<S> = {value: options.initialState};
  console.log(state);
  return {} as CreateStoreResults<S, Name, A>;
};

export const constructActions = <State, A extends Actions<State>>(actions: A, state: State):ActionsWithoutState<A> =>{
  const result = {actions: {}} as ActionsWithoutState<A>;
  for(const key in actions){
    result.actions[key] = (payload?: unknown) => {
      return actions[key](state, payload);
    }
  }
  return result;
};

export const dd = c3({
  name: 'dob', 
  initialState: 4, 
  actions: {
    /** add stuff */
    add: (state, to: number)=> state + to
  }
});

dd.actions
