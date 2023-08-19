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
   * Action functions must return a new state and not
   * just manipulate the existing state.
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
 * Type for user defined functions to manipulate the state.
 */
export interface Actions<State = any> {
  [key: string]: (state: State, ...payload: any[]) => State;
}

/** Remove the first item on an array. */
type RemoveFirstItem<T extends unknown[]> = T extends [any, ...infer U]
  ? U
  : never;

/**
 * Functions with 0 or 1 param will have no params.
 *
 * Functions with 2 or more params will have the first
 * param removed.
 */
export type ProcessedAction<
  Action extends (...args: any) => any,
  Params extends Parameters<Action> = Parameters<Action>,
> = Params['length'] extends 1 | 0
  ? () => Params[0]
  : (...payload: RemoveFirstItem<Params>) => Params[0];

export type ActionsWithoutState<T extends Actions> = {
  actions: {
    [key in keyof T]: ProcessedAction<T[key]>;
  };
};

/**
 * Use for extracting the name from the store options.
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

export type EqualityFn<State> = (newState: State, oldState: State) => boolean;

/**
 * Type for the the useStore function returned by createStore
 *
 * Uses the type for the store state and the types of the select
 * and equality check functions.
 */
export type UseStoreHook<StoreState, SelectFn extends (...args: any) => any> = (
  select: SelectFn,
  equalFn?: EqualityFn<StoreState>,
) => ReturnType<SelectFn>;

/**
 * Type for the actions available from the store.
 *
 * Uses the types of the user defined actions during store
 * creation to create the final type.
 */
export type StoreActions<ActionsCollection extends Actions> = {
  [key in keyof ActionsCollection]: ProcessedAction<ActionsCollection[key]>;
};

/**
 * Type for the function to retrieving actions from the store.
 *
 * Uses the type of the select function that is accepted by
 * the actions function to get the final return type.
 */
export type useActionsHook<SelectFn extends (...args: any) => any> = (
  select: SelectFn,
) => ReturnType<SelectFn>;

/** The state of the store */
export type State<Name extends string = string, S = any> = { [key in Name]: S };
