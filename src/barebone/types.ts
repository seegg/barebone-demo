/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface StoreOptions<
  State = any,
  Name extends string = string,
  A extends Actions<State> = any,
> {
  /**
   * A name use to identify the store.
   */
  name: Name extends 'state' | 'actions' ? never : Name;
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
  actions: A;
}

/**
 * Functions for manipulating the state.
 */
export interface Actions<State = any> {
  [key: string]: (state: State, ...payload: any[]) => State;
}

/**
 * Maps the actions function to a wrapper where the
 * first argument(state) is removed.
 */
export type ActionsWithoutState<T extends Actions> = {
  actions: {
    [key in keyof T]: ProcessedAction<T[key]>;
  };
};

/** Remove the first item on an array. */
type RemoveFirstItem<T extends unknown[]> = T extends [any, ...infer U]
  ? U
  : never;

/**
 * If the number of params is less than or equal
 * 1 then make the function signature empty, otherwise
 * remove the first param from the function signature.
 */
export type ProcessedAction<
  Action extends (...args: any) => any,
  Params extends Parameters<Action> = Parameters<Action>,
> = Params['length'] extends 1 | 0
  ? () => Params[0]
  : (...payload: RemoveFirstItem<Params>) => Params[0];

/**
 * Extracts the name from the store options and
 * creates property with the name as key and the state
 * as the value.
 */
export type ExtractStoreName<Name extends string, State> = {
  [key in Name]: State;
};

export type StateListener<State> = Map<
  unknown,
  {
    /** Updates the state of a component using the store
     * hook and causing a rerender.
     */
    setState: (state: any) => void;
    /**
     * Check to see if the listener's state should be
     * updated or not.
     * @param oldState The old store state.
     * @param newState The new store state.
     * @returns Whether the state for this listener should
     * be updated or not.
     */
    equalFn?: (oldState: State, newState: State) => boolean;
  }
>;

/** The state of the store */
export type State<Name extends string = string, S = any> = { [key in Name]: S };

export type CreateStoreResults<
  S,
  N extends string,
  A extends Actions<S>,
> = ExtractStoreName<N, S> & ActionsWithoutState<A>;
