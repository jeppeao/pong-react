import {useState, useEffect, useRef, useLayoutEffect, useCallback} from "react"
import { AiController, AiLvl, KeyController, newControls, newControlState } from "./common/controls";
import { useActiveKeys } from "./common/hooks";
import { Game, GameState, MobileRect, Player, Vec2D, vec2D } from "./common/pong";
import { GameScreen, MainMenu, SetControlsMenu } from "./view";

export interface Control {
  type: string,
  subtype: Difficulty | string
}

export enum Difficulty {
  easy = 'easy',
  medium = 'normal',
  hard = 'hard'
}

export interface DisplayElement {
  id: string
  top: string,
  left: string,
  height: string,
  width: string,
}

export interface GameControlProps {
  game: Game | undefined,
  controlP1: Control,
  controlP2: Control,
  goBack: React.Dispatch<React.SetStateAction<string>>,
  orientation: string,
  dimensions: Vec2D,
  setDimensions: React.Dispatch<React.SetStateAction<Vec2D>>,
  setOrientation: React.Dispatch<React.SetStateAction<string>>,
}


//========================
//    HELPER FUNCTIONS    
//========================    

const isMobileDevice = () => {
  const regexp = /android|iphone|ipod|ipad|kindle|IEMobile|webOS|Opera Mini/i;
  const ua = navigator.userAgent;
  return regexp.test(ua);
}

const useFrameTime = () => {
  const [frameTime, setFrameTime] = useState(0);
  useEffect(() => {
    let frameId: number;
    const frame = (time: number) => {
      setFrameTime(time);
      frameId = requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, []);
  
  return frameTime;
}

const useAnyKey = (callback: () => void) => {
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  const handleEvent = useCallback(() => {
    return callbackRef.current();
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleEvent);
    return () => document.removeEventListener("keydown", handleEvent);
  }, [handleEvent]);
}

const usePointerEvent = (eventType: string, callback: (e: Event) => void, node = document) => {
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  const handleEvent = useCallback((e: Event) => {
    if (e.type === eventType) {
      callbackRef.current(e);
    }
  }, [eventType]);
  
  useEffect(() => {
    node.addEventListener(eventType, handleEvent);
    return () => node.removeEventListener(eventType, handleEvent);
  }, [handleEvent, node, eventType]);
}


function displayVal(gameVal: number) {
  return (100 * gameVal).toString() + "%";
}

function displayElement(gameElement: MobileRect) {
  // Converts game position and size of element to css dimensions
  let left = displayVal(gameElement.pos.x - gameElement.offset.x);
  let top = displayVal(gameElement.pos.y - gameElement.offset.y);
  let width = displayVal(gameElement.size.x);
  let height =  displayVal(gameElement.size.y);

  return {id: gameElement.id, left, top, width, height};
}

function displayState(gameState: GameState) {
  return {
    ball: displayElement(gameState.ball),
    [Player.P1]: displayElement(gameState[Player.P1]),
    [Player.P2]: displayElement(gameState[Player.P2]),
    winner: gameState.winner
  };
}

const usePointerControls = (dimensions: Vec2D, orientation: string) => {
  const coor = useRef(vec2D(0.5, 0.5));

  const handleDrag = (e: Event) => {
    if (e instanceof MouseEvent) {
      const x = e.clientX / dimensions.x;
      const y = e.clientY / dimensions.y;
      coor.current = orientation === "horz" ? vec2D(x, y) : vec2D(y, x);
    }
  }

  const handlePointerUp = () => {
    document.removeEventListener("pointermove", handleDrag);
  }
  const handlePointerDown = (e:Event) => {
    if (e instanceof MouseEvent) {
      const x = e.clientX / dimensions.x;
      const y = e.clientY / dimensions.y;
      coor.current = orientation === "horz" ? vec2D(x, y) : vec2D(y, x);
      document.addEventListener("pointermove", handleDrag);
      document.addEventListener("pointerup", handlePointerUp, {once: true});
    }
  }
  usePointerEvent("pointerdown", handlePointerDown);
  return coor.current;
}

const defaultKeyControls1 = {
  up: ["w", "a"],
  down: ["s", "d"],
};

const defaultKeyControls2 = {
  up: ["ArrowUp", "ArrowLeft"],
  down: ["ArrowDown", "ArrowRight"],
};

const noKeyControls = {
  up: [],
  down: []
};

const defHuman = isMobileDevice() ? "pointer" : "key";
const defaultControls = {
  "p1": {type: "human", subtype: defHuman},
  "p2": {type: "ai", subtype: "easy"},
}

//======================
//    APP CONTROLLER   
//======================

export const AppOld = () => {
  const [orientation, setOrientation] = useState("");
  const [dimensions, setDimensions] = useState(vec2D(0,0));
  const [game, setGame] = useState<Game>();
  const [clicked, setClicked] = useState("");
  const [controlP1, setControlP1] = useState(defaultControls.p1);
  const [controlP2, setControlP2] = useState(defaultControls.p2);
  const handleNewGameClick = () => setClicked("newGame");
  const handleContinueClick = () => setClicked("continue");
  const handleCtrlClick = () => setClicked("setCtrls");
  

  const toggleCtrlType = (player: string) => {
    const setC = player === "p1" ? setControlP1 : setControlP2;
    setC(cur => {
      const ntype = cur.type === "human" ? "ai" : "human";
      const nsubt = ntype === "ai" ? "easy" : defHuman;
      return {type: ntype, subtype: nsubt};
    });
  }
  const toggleSubtype = (player: string) => {
    function nextDif(dif: Difficulty): Difficulty {
      switch (dif) {
        case Difficulty.easy:
          return Difficulty.medium;
        case Difficulty.medium:
          return Difficulty.hard;      
        case Difficulty.hard:
          return Difficulty.easy
      }
    }
    const nCtrl = {key: 'pointer', pointer: 'key'};
    const setC = player === "p1" ? setControlP1 : setControlP2;
    setC((cur: Control) => {
      if (cur.type = 'ai') {
        let dif = cur.subtype as Difficulty;
        const nsubt = nextDif(dif);
        return {type: cur.type, subtype: nsubt};
      }
      else {
        const nsubt = cur.subtype === "key" ? "pointer" : "key"
        return {type: cur.type, subtype: nsubt};
      }
    });
  }

  switch (clicked) {
    case "newGame":
      setGame(new Game());
      setClicked(() => "continue");
    return <GameControl 
      game = {game}
      goBack = {setClicked}
      controlP1 = {controlP1}
      controlP2 = {controlP2}
      setDimensions = {setDimensions}
      dimensions = {dimensions}
      orientation = {orientation}
      setOrientation = {setOrientation}
    />;
    case "continue":
      return <GameControl 
        game = {game}
        goBack = {setClicked}
        controlP1 = {controlP1}
        controlP2 = {controlP2}
        setDimensions = {setDimensions}
        dimensions = {dimensions}
        orientation = {orientation}
        setOrientation = {setOrientation}
      />;
    case "setCtrls":
      return <SetControlsMenu 
        goBack = {setClicked} 
        controlP1 = {controlP1}
        controlP2 = {controlP2}
        toggleSubtype = {toggleSubtype}
        toggleCtrl = {toggleCtrlType}
      />;
    default: 
      return <MainMenu 
        game = {game}
        controlP1 = {controlP1}
        controlP2 = {controlP2}
        handleCtrlClick = {handleCtrlClick}
        handleNewGameClick = {handleNewGameClick}
        handleContinueClick = {handleContinueClick}
      />
  }
}

const GameControl = (props : GameControlProps) => {
  const game = props.game || {} as Game;
  
  const [gameState, setGameState] = useState(displayState(game.getGameState()));
  const [prevFrameTime, setPrevFrameTime] = useState(0);
  const frameTime = useFrameTime();
  const testControls = {
    [Player.P1] : new KeyController(['a', 'w'], ['s', 'd']),
    [Player.P2] : new KeyController(['a', 'w'], ['s', 'd']),
  }
  const newCtrls = newControls(testControls, Player.P1, {difficulty: AiLvl.HARD})
  const controls = useRef(newCtrls);
  const controlState = useRef(newControlState(controls.current, game.getGameState(), []));
  const activeKeys = useActiveKeys();

  const restartGame = () => props.goBack("newGame");
  useEffect(() => {
    if (game.winner) {
      document.addEventListener("keydown", restartGame);
    }
    return () => document.removeEventListener("keydown", restartGame);
  }, [game.winner]);

  if (frameTime - prevFrameTime > 12) {
    // Prevent infinite re-render loop
    // Expected interval is around 16ms
    if (frameTime - prevFrameTime > 32) {
      setPrevFrameTime(frameTime);
    }
    else {
      setPrevFrameTime(frameTime);
      controlState.current = newControlState(controls.current, game.getGameState(), activeKeys);
      game.updatePaddleDirections(controlState.current);
      game.advanceBoard((frameTime - prevFrameTime) / (1000/60));
      setGameState(displayState(game.getGameState()));
    }
  }

  return <GameScreen 
    score = {game.getScore()}
    p1 = {gameState[Player.P1]} 
    p2 = {gameState[Player.P2]}
    ball = {gameState.ball}
    goBack = {props.goBack}
    winner = {game.getWinner()}
    setDimensions = {props.setDimensions}
    orientation = {props.orientation}
    setOrientation = {props.setOrientation}
  />
}



