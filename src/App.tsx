import { useEffect, useRef } from 'react';
import './App.css';
import githubLogoImg from '/github-32px.png?url';
import dragIcon from '/dragicon.png?url';
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
    <main>
      <div className="reset-button">
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
      <StoreDisplay />
    </main>
  );
}

export default App;

interface Counter {
  count?: number;
  instruction?: string;
  onButtonClick?: () => void | Promise<void>;
}

const Counter = ({ instruction, onButtonClick }: Counter) => {
  const counter = useCounterStore((state) => [
    state.counter.count,
    state.counter.isUpdating,
  ]);
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
        <button
          onClick={onButtonClick}
          className={counter.isUpdating ? 'disabled' : ''}
        >
          count is {counter.count}
        </button>
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

const StoreDisplay = () => {
  const counter = useCounterStore(({ counter }) => counter);
  const containerElement = useRef<HTMLDivElement>(null);

  const startCoord = useRef({ x: 0, y: 0 });
  const transformDelta = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const handleOnPointerDown = (evt: React.PointerEvent<HTMLDivElement>) => {
    startCoord.current.x = evt.clientX;
    startCoord.current.y = evt.clientY;
    isDragging.current = true;
  };

  useEffect(() => {
    const handleOnPointerMove = (evt: PointerEvent) => {
      if (!isDragging.current) return;

      const deltaX = evt.clientX - startCoord.current.x;
      const deltaY = evt.clientY - startCoord.current.y;
      transformDelta.current.x += deltaX;
      transformDelta.current.y += deltaY;

      requestAnimationFrame(() => {
        if (containerElement.current) {
          containerElement.current.style.transform = `translate(${transformDelta.current.x}px, ${transformDelta.current.y}px)`;
        }
      });

      startCoord.current.x = evt.clientX;
      startCoord.current.y = evt.clientY;
    };

    const handleOnPointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('pointermove', handleOnPointerMove);
    window.addEventListener('pointerup', handleOnPointerUp);
    window.addEventListener('pointercancel', handleOnPointerUp);

    return () => {
      window.removeEventListener('pointermove', handleOnPointerMove);
      window.removeEventListener('pointerup', handleOnPointerUp);
      window.removeEventListener('pointercancel', handleOnPointerUp);
    };
  }, []);
  return (
    <div
      className="stats-card"
      onContextMenu={(evt) => {
        evt.preventDefault();
      }}
      onPointerDown={handleOnPointerDown}
      ref={containerElement}
    >
      <div className="stat-item">
        <label htmlFor="store-count" className="store-label">
          Count:
        </label>
        <input type="text" id="store-count" value={counter.count} readOnly />
      </div>
      <div className="stat-item">
        <label htmlFor="store-updating">
          Updating:
          {counter.isUpdating && <img src={Spinner} height={'17rem'} />}
        </label>
        <input
          type="text"
          id="store-updating"
          value={counter.isUpdating ? 'Yes' : 'No'}
          readOnly
        />
      </div>
      <img
        src={dragIcon}
        alt="finger drag icon"
        className="icon-small drag-icon"
      />
    </div>
  );
};
