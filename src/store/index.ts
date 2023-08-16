
interface State<S=any, N extends string = string> {
  name: N;
  initialValue: S;
}

interface Actions<S=any> {
  [key: string]: ((state: S)=>S) | ((state: S, payload: any)=>S)
}

type Act2 <T extends Actions> = {
  [key in keyof T]: Parameters<T[key]>['length'] extends 2? (payload: Parameters<T[key]>[1])=>Parameters<T[key]>[0]
                    : ()=>Parameters<T[key]>[0]
}

type CS<N extends string, S> = {
  [key in N]: S
}

export const c2 = <S, Name extends string = string>(initialState: State<S, Name>):{ lob: CS<Name, S> } => {
  const name = initialState.name;
  const state = initialState.initialValue;
  return {lob:{[name]: state}} as { lob: CS<Name, S> };
};


export const d2 = <T extends Actions>(action:T): Act2<T> => {
  return {} as Act2<T>;
}

const xx = d2({
  arg: (state: number, input: string)=>{
    if(input === 'hello'){
      return state + 1;
    }
    return state + 2;
  },
  arg2: (state: number, input: {d: number})=>{
    if(input.d === 1){
      return state + 1;
    }
    return state + 2;
  }
});



