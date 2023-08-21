import { useRef } from 'react';
import './App.css';
import githubLogoImg from '/github-32px.png?url';
import {
  useCounterStore,
  counterActions,
  useTitleStore,
  titleActions,
  asyncCounterActions,
} from './store';

function App() {
  /**
   * Resets the states
   */
  const handleOnClick = () => {
    counterActions.reset();
    titleActions.setTitle('Counter');
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
          instruction="Click the button to increment the counters."
          onButtonClick={counterActions.increment}
        />
        <InnerCounter
          count={2}
          instruction="Add 4 to the counter with some delay."
          onButtonClick={asyncCounterActions.addFourAsync}
        />
        <TitleController
          count={3}
          instruction="Only update counter for multiples of 3."
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
  const counter = useCounterStore((state) => state.counter.count);
  const title = useTitleStore((state) => state.Titles.value);
  const renderCount = useRef(0);
  renderCount.current++;
  return (
    <div>
      <h1 className="card-title">
        {title} {count && '#' + count}
      </h1>
      <div className="card">
        <button onClick={onButtonClick}>count is {counter}</button>
        <p>{instruction && instruction}</p>
        <p>
          render: {renderCount.current}{' '}
          {renderCount.current > 1 ? 'times' : 'time'}.
        </p>
      </div>
    </div>
  );
};

const TitleController = ({ count, instruction }: Counter) => {
  const counter = useCounterStore(
    (state) => {
      return state.counter.count;
    },
    (state) => state.counter.count % 3 === 0,
  );
  const title = useTitleStore((state) => state.Titles.value);
  const renderCount = useRef(0);
  renderCount.current++;

  const handleOnChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    titleActions.setTitle(ev.target.value);
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
        <p>
          render: {renderCount.current}{' '}
          {renderCount.current > 1 ? 'times' : 'time'}.
        </p>
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
