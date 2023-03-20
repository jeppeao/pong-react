import { useCallback, useRef, useState } from 'react';
import './App.css';

import { useActiveKeys, useInitialOrientation, useOrientationOnResize } from './common/hooks';
import { defaultControls, Orientation } from './common/constants';
import { Game } from './common/pong';
import { MenuController } from 'menu-view/menu-controller';
import { Controls } from 'common/controls';
import { GameController } from 'game-view/game-controller';


export const App = () => {
  console.log('starting App')

  const ref = useRef<HTMLDivElement | null>(null);
  const [orientation, setOrientation] = useState(Orientation.vertical);
  const [menuOn, setMenuOn] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [controls, setControls] = useState<Controls>(defaultControls);
  const controlState = useRef();

  const activeKeys = useActiveKeys();
  
  useInitialOrientation(ref, setOrientation);
  useOrientationOnResize(ref, setOrientation);

  const onNewGame = useCallback(() => {
    setGame(new Game());
    setMenuOn(false);
  }, []);

 
  return (
    <div ref={ref}>
      {menuOn &&
        <MenuController
          gameActive={game !== null}
          onNewGame={onNewGame}
          onContinue={() => setMenuOn(false)}
          controls={controls}
          setControls={(ctrl: Controls) => setControls(() => ctrl)}
        />}
      {!menuOn &&
        <GameController
          game={game}
          controls={controls}
          onMenuClick={() => setMenuOn(true)}
          orientation={orientation}
        />
      } 
    </div>
  )
  
}

export default App;