import './App.css';
import githubLogoImg from '/github-32px.png?url';
import {
  useCounterStore,
  counterActions,
  useTitleStore,
  titleActions,
} from './store';

function App() {
  /**
   * Resets the states
   */
  const handleOnClick = () => {
    counterActions.reset();
    titleActions.updateTitle('Counter');
  };
  return (
    <>
      <div className="reset-button">
        <button onClick={handleOnClick}>Reset</button>
        <h4>Barebone React state management demo</h4>
      </div>
      <div className="counter-container">
        <InnerCounter
          count={1}
          instruction="Click the button the increment the counters."
          onButtonClick={counterActions.increment}
        />
        <InnerCounter
          count={2}
          instruction="Use the text box to the change the card titles."
          onButtonClick={counterActions.increment}
        />
        <TitleController
          count={3}
          instruction="Only update counter for multiples of 3 by passing in by passing in a
          function that checks against new state changes."
        />
      </div>
      <Contact
        url="https://github.com/seegg/Barebone-state-management"
        img={githubLogoImg}
        alt="github logo linking to repo."
      />
    </>
  );
}

export default App;

interface Counter {
  count?: number;
  instruction?: string;
  onButtonClick?: () => void | Promise<void>;
}

const InnerCounter = ({ count, instruction, onButtonClick }: Counter) => {
  const counter = useCounterStore((state) => state.counter);
  const title = useTitleStore((state) => state.Title.value);
  return (
    <div>
      <h1 className="card-title">
        {title} {count && '#' + count}
      </h1>
      <div className="card">
        <button onClick={onButtonClick}>count is {counter}</button>
        <p>{instruction && instruction}</p>
      </div>
    </div>
  );
};

const TitleController = ({ count, instruction }: Counter) => {
  const counter = useCounterStore(
    (state) => {
      return state.counter;
    },
    (state) => state.counter % 3 == 0,
  );
  const title = useTitleStore((state) => state.Title.value);

  const handleOnChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    titleActions.updateTitle(ev.target.value);
  };

  return (
    <div>
      <h1 className="card-title">
        {title} {count && '#' + count}
      </h1>
      <div className="card">
        <button onClick={counterActions.increment}>count is {counter}</button>
        <p>{instruction}</p>
        <input type="text" value={title} onChange={handleOnChange} />
      </div>
    </div>
  );
};

interface IContact {
  url: string;
  img: string;
  alt: string;
}

const Contact = ({ url, img, alt }: IContact) => {
  return (
    <a href={url} className="contact">
      <img src={img} alt={alt} />
    </a>
  );
};
