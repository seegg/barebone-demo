/* eslint-disable  @typescript-eslint/no-explicit-any */

interface State<S = any, N extends string = string, A extends Actions<S> = any> {
  /** A name use to keep track of the state. */
  name: N extends 'state'? never: N;
  /** */
  initialValue: S;
  actions: A
}

interface Actions<S = any> {
  [key: string]: ((state: S)=>S) | ((state: S, payload: any) => S);
}

type ActionsWithoutState <T extends Actions> = {
  [key in keyof T]: Parameters<T[key]>['length'] extends 2? (payload: Parameters<T[key]>[1])=>Parameters<T[key]>[0]
                    : ()=>Parameters<T[key]>[0]
}

type CS<N extends string, S> = {
  /** Why doesn't this comment show up. */
  [key in N]: S
}

type CreateStoreResults<S, N extends string, A extends Actions<S>> = CS<N, S> & ActionsWithoutState<A>

export const c2 = <S, Name extends string = string>(initialState: State<S, Name>):CS<Name, S> => {
  const name = initialState.name;
  const state = initialState.initialValue;
  return {[name]: state} as CS<Name, S>;
};

export const c3 = <S, Name extends string, A extends Actions<S>>(initialState: State<S, Name, A>): CreateStoreResults<S, Name, A>=> {
  console.log(initialState);
  return {} as CreateStoreResults<S, Name, A>;
};


export const d2 = <T extends Actions>(action:T): ActionsWithoutState<T> => {
  return {} as ActionsWithoutState<T>;
}

const dd = c3({
  name: 'dob', 
  initialValue: 4, 
  actions: {
    /** add stuff */
    add: (state, to: number)=> state + to
}})

dd.dob



type DD = {
  /** Number stuff. */
  [key: string]: number;
}

