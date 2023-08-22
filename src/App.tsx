import { useRef } from 'react';
import './App.css';
import githubLogoImg from '/github-32px.png?url';
import Spinner from './assets/spinner.svg';
import { useCounterStore, counterActions, asyncCounterActions } from './store';

function App() {
  /**
   * Resets the states
   */
  const handleOnClick = () => {
    counterActions.reset();
  };

  const add4 = async () => {
    const result = await asyncCounterActions.addFourAsync();
    console.log(result);
  };

  return (
    <>
      <div className="reset-button">
        <h4>Barebone React state management demo</h4>
        <button onClick={handleOnClick}>Reset</button>
      </div>
      <div className="counter-container">
        <Counter
          count={1}
          instruction="Click the button to increment the counters."
          onButtonClick={counterActions.increment}
        />
        <AsyncCounter
          count={2}
          instruction="Add 4 to the counter with some delay."
          onButtonClick={add4}
        />
        <TitleController
          count={3}
          instruction="Only update the counter for multiples of 3 and not while performing any async updates."
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

const Counter = ({ instruction, onButtonClick }: Counter) => {
  const counter = useCounterStore((state) => state.counter.count);
  const renderCount = useRef(0);
  renderCount.current++;
  return (
    <div key={Math.random()}>
      <div className="card">
        <button onClick={onButtonClick}>count is {counter}</button>
        <RenderCount count={renderCount.current} />
        <p>{instruction && instruction}</p>
      </div>
    </div>
  );
};

const AsyncCounter = ({ instruction, onButtonClick }: Counter) => {
  const counter = useCounterStore((state) => state.counter);
  const renderCount = useRef(0);
  renderCount.current++;
  return (
    <div key={Math.random()}>
      <div className="card">
        <button onClick={onButtonClick}>count is {counter.count}</button>
        <RenderCount count={renderCount.current} />
        <p>{instruction && instruction}</p>
        <p>{counter.isUpdating && <img src={Spinner} height={'40rem'} />}</p>
      </div>
    </div>
  );
};

const TitleController = ({ instruction }: Counter) => {
  const counter = useCounterStore(
    (state) => {
      return state.counter.count;
    },
    (state) => {
      return state.counter.count % 3 === 0 && !state.counter.isUpdating;
    },
  );
  const renderCount = useRef(0);
  renderCount.current++;

  return (
    <div key={Math.random()}>
      <div className="card">
        <button onClick={counterActions.increment}>count is {counter}</button>
        <RenderCount count={renderCount.current} />
        <p>{instruction}</p>
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
    <div className="contact">
      <a href={url}>
        <img src={img} alt={alt} />
      </a>
    </div>
  );
};

const RenderCount = ({ count }: { count: number }) => {
  return (
    <p>
      rendered {count} {count > 1 ? 'times' : 'time'}.
    </p>
  );
};
