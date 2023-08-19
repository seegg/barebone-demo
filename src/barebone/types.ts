/* eslint-disable  @typescript-eslint/no-explicit-any */
export interface StoreOptions<
  State = any,
  Name extends string = string,
  A extends Actions<State> = any,
> {
  /**
   * A name use to identify the store.
   */
  name: Name;
  /** The initial state of the store. */
  initialState: State;
  /**
   * Functions use to manipulate the state, the state is
   * pass in as the first argument and it optionally accepts
   * a second user define argument.
   *
   * Action functions must return a new state and not
   * just mutating the existing state.
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
  actions?: A;
}

/**
 * Type for user defined functions to manipulate the state.
 */
export interface Actions<State = any> {
  [key: string]: (state: State, ...payload: any[]) => State | Promise<State>;
}

export interface AsyncActions<State = any> {
  [key: string]: (
    setState: SetState<State>,
    state: State,
    ...payload: any[]
  ) => Promise<State>;
}

export type SetState<State = any> = (state: State) => void;

/** Remove the first item on an array. */
type RemoveFirstItem<T extends unknown[]> = T extends [any, ...infer U]
  ? U
  : never;

/** Remove first two items from array. */
export type RemoveFirstTwoItem<T extends unknown[]> = T extends [
  any,
  any,
  ...infer U,
]
  ? U
  : never;

/**
 * Remove the first N items from an array.
 *
 * To construct the type items are removed
 * one at a time from the target array and added
 * to a second array until the length of the second
 * array equals N. Whatever is left in the target
 * array is then returned.
 */
export type RemoveFirstNItem<
  Arr extends unknown[],
  N extends number,
  T extends unknown[] = [],
> = T['length'] extends N
  ? Arr
  : Arr extends [infer M, ...infer Rest]
  ? RemoveFirstNItem<Rest, N, [M, ...T]>
  : never;

type SyncPramCount = 0 | 1;
type AsyncParamCount = 0 | 1 | 2;
/**
 * Remove default params from actions leaving
 * only user defined params.
 *
 * For synchronous actions the number is 1, for
 * async actions it's 2.
 *
 * To account for all cases all numbers of params
 * below the desired count also needs to be provided.
 *
 * i.e. To remove
 */
export type ProcessedAction<
  Action extends (...args: any) => any | Promise<any>,
  N extends number,
  Params extends any[] = Parameters<Action>,
> = Params['length'] extends N
  ? () => void
  : (...payload: RemoveFirstItem<Params>) => void;

export type ActionsWithoutState<T extends Actions> = {
  actions: {
    [key in keyof T]: ProcessedAction<T[key], SyncPramCount>;
  };
};

export type AsyncActionsWithoutState<T extends AsyncActions> = {
  actions: {
    [key in keyof T]: ProcessedAction<T[key], AsyncParamCount>;
  };
};

/**
 * Use for extracting the name from the store options.
 */
export type ExtractStoreName<Name extends string, State> = {
  [key in Name]: State;
};

export type StateListeners<State> = Map<
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
 * Type for the actions available from the store.
 *
 * Uses the types of the user defined actions during store
 * creation to create the final type.
 */
export type StoreActions<ActionsCollection extends Actions> = {
  [key in keyof ActionsCollection]: ProcessedAction<
    ActionsCollection[key],
    SyncPramCount
  >;
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
