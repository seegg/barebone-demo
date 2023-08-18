import './App.css'
import githubLogoImg from '../public/github-32px.png';
import {useCounterStore, useCounterActions, useTitleStore, useTitleActions} from './store'


function App() {
  const {reset} = useCounterActions(actions => actions);
  const updateTitle = useTitleActions(actions => actions.updateTitle);

  const handleOnClick = ()=>{
    reset();
    updateTitle('Counter');
  }
  return (
    <>
      <div className='reset-button'>
        
        <button onClick={handleOnClick}>
          Reset
        </button>
        <h4>Barebone React state management demo</h4>
        <p>Click the button the increment the counters.</p>
        <p>Use the input to the change the card titles.</p>
      </div>
      <div className='counter-container'>
        <InnerCounter count={1}/>
        <InnerCounter count={2}/>
        <TitleController count={3}/>
      </div>
      <Contact 
        url='https://github.com/seegg/Barebone-state-management' 
        img={githubLogoImg} 
        alt='github logo linking to repo.'
      />
    </>
  )
}

export default App

interface Counter {
  count?: number;
}

const InnerCounter = ({count}: Counter)=>{
  const counter = useCounterStore(state => state.counter);
  const increment = useCounterActions(actions => actions.increment);
  const title = useTitleStore(state => state.Title.value);
  return (
    <div>
      <h1 className='card-title'>{title} {count && '#'+count}</h1>
      <div className="card">
        <button onClick={increment}>
          count is {counter}
        </button>
      </div>
    </div>
  )
}

const TitleController = ({count}: Counter)=>{
  const counter = useCounterStore(
    state => {return state.counter}, 
    state => state.counter % 3 == 0
  );
  const counterActions = useCounterActions(actions => actions);
  const title = useTitleStore(state => state.Title.value);
  const titleActions = useTitleActions(actions => actions);

  const handleOnChange = (ev: React.ChangeEvent<HTMLInputElement>)=>{
    titleActions.updateTitle(ev.target.value);
  }

  return (
    <div>
      <h1 className='card-title'>{title} {count && '#'+count}</h1>
      <div className="card">
        <button onClick={counterActions.increment}>
          count is {counter}
        </button>
        <p>
          Only update counter for multiples of 3 by passing in by passing in a function that checks against new state changes.
          </p>
        <input type='text' value={title} onChange={handleOnChange}/>
      </div>
    </div>
  )
}

interface IContact {
  url: string;
  img: string;
  alt: string;
}

const Contact = ({url, img, alt}: IContact)=>{

  return(
    <a href={url} className='contact'>
      <img src={img} alt={alt}/>
    </a>
  )

}