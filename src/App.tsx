import './App.css';
import { useCallback, useRef, useState } from 'react';
import { useInitialOrientation, useOrientationOnResize } from './common/hooks';
import { 
  Controls, 
  defaultControls, 
  defaultMobileControls,
  Orientation } from './common/constants';
import { Game } from './common/pong';
import { MenuController } from 'menu-view/menu-controller';
import { GameController } from 'game-view/game-controller';

const isMobileDevice = () => {
  const regexp = /android|iphone|ipod|ipad|kindle|IEMobile|webOS|Opera Mini/i;
  const ua = navigator.userAgent;
  return regexp.test(ua);
}

const setupControls = isMobileDevice() ? defaultMobileControls : defaultControls;

export const App = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [menuOn, setMenuOn] = useState(true);
  const [controls, setControls] = useState<Controls>(setupControls);
  const [orientation, setOrientation] = useState(Orientation.vertical);
  
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
          onAnyKey={onNewGame}
          orientation={orientation}
        />
      } 
    </div>
  )
}

export default App;