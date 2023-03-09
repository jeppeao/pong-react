import {useState, useEffect, useRef, useLayoutEffect, useCallback} from "react"
import { Game, GameState, MobileRect, rand, seek, Vec2D, vec2D } from "./pong";
import { GameScreen, MainMenu, SetControlsMenu } from "./view";

export enum PlayerID {
  p1 = 'p1',
  p2 = 'p2'
}

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

const useKeyEvent = (key: string, eventType: string, callback: (e: Event) => void, node = document) => {
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  const handleEvent = useCallback((e: Event) => {
    if (e instanceof KeyboardEvent && e.key === key) {
      callbackRef.current(e);
    }
  }, [key]);
  
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
    p1: displayElement(gameState.p1),
    p2: displayElement(gameState.p2)
  };
}

const useKeyControls = (keyControls: {up: string[], down: string[]}) => {
  const dir = useRef(0);
  const moveUp = () => dir.current = -1;
  const moveDown = () => dir.current = 1;
  const reset = () => dir.current = 0;
  // keyControls.up.forEach(key => {
  //   useKeyEvent(key, "keydown", moveUp);
  //   useKeyEvent(key, "keyup", reset);
  // });
  // keyControls.down.forEach(key => {
  //   useKeyEvent(key, "keydown", moveDown);
  //   useKeyEvent(key, "keyup", reset);
  // });
  return dir.current;
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

const predictBallImpact = (paddle: PlayerID, gamestate: GameState)=> {
  const ppos = gamestate[paddle].pos;
  const ball = gamestate.ball;
  let [xSpeed, ySpeed] = Object.values(ball.direction);
  const [bpx, bpy, boy] = [...Object.values(ball.pos), ball.offset.y];
  const xDist = Math.abs(ball.pos.x - ppos.x);
  const yDist = Math.abs(ySpeed * xDist / xSpeed);
  let t;
  const yInt = Math.floor(yDist);
  const yFrac = (yDist - yInt);
  // Calculate ball ySpeed and yPos (t) after traversing yFrac in y dimension
  // For now does not take into account that bounces happpens at offset.y
  // distance to walls
  const wallDist = Math.sign(ySpeed) < 0 ? bpy : (1-bpy);
  if (yFrac < wallDist) {
    t = bpy + Math.sign(ySpeed) * yFrac;
  }
  else {
    t = Math.sign(ySpeed) < 0 ? yFrac - wallDist : 1 - (yFrac - wallDist); 
    ySpeed *= -1;
  }
  // Complete prediction of ySPeed and yPos using the fact that 2 screens 
  // of y movement leaves both unchanged
  ySpeed = (yInt > 0 && yInt % 2) ? -ySpeed : ySpeed;
  t = yInt === 1 ? 1 - t : t; 
  return t;
}

const useAIControls = (paddle: PlayerID, gamestate: GameState, err = 0) => {
  const dir = useRef(0);
  const receiving = useRef(false);
  const incomingTargetSet = useRef(false);
  const target = useRef(0.5);
  const [player, ball] = [gamestate[paddle], gamestate.ball]

  receiving.current = Math.sign(player.pos.x - ball.pos.x) ===
    Math.sign(ball.direction.x); 

  if (receiving.current && ball.pos.y != 0.5 && !incomingTargetSet.current) {
    let t = predictBallImpact(paddle, gamestate);
    target.current = t + rand(-err, err); 
    incomingTargetSet.current = true; 
  }
  else if (!receiving.current) {
    // Return to middle of court
    target.current = 0.5;
    incomingTargetSet.current = false;
  }
  dir.current = seek(player.pos.y, target.current, player.size.y / 4);
  return dir.current;
}

const useControls = (paddle: PlayerID, game: Game, control: Control, dimensions: Vec2D, orientation: string) => {
  const board = game.getBoard();
  const player = board[paddle];
  const d = {easy: 0.12, medium:0.08, hard: 0.05}[control.subtype];
  const aiCtrl = useAIControls(paddle, board, d);
  const human = control.type === "human";
  const defKeys = paddle === "p1" ? defaultKeyControls1 : defaultKeyControls2;
  const keys = human ? defKeys : noKeyControls;
  const humanCtrl = useKeyControls(keys);
  // const pointerPos = usePointerControls(dimensions, orientation);
  // const pointerCtrl = seek(player.pos.y, pointerPos.y, player.size.y /4);
  // if (control.type === "human" && 
    // control.subtype === "pointer" &&
    // Math.abs(pointerPos.x - player.pos.x) < 0.4) {
    //  return pointerCtrl;
  // }
  // return human ? humanCtrl : aiCtrl;
  return human ? humanCtrl : aiCtrl;
}

const controlTypes = ['human', 'ai'];
const ailvls = ['easy', 'medium', 'hard'];

const defHuman = isMobileDevice() ? "pointer" : "key";
const defaultControls = {
  "p1": {type: "human", subtype: defHuman},
  "p2": {type: "ai", subtype: "easy"},
}

//======================
//    APP CONTROLLER   
//======================

export const App = () => {
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
  
  const [gameState, setGameState] = useState(displayState(game.getBoard()));
  const [prevFrameTime, setPrevFrameTime] = useState(0);
  const paddleCtrl = useRef({"p1": 0, "p2": 0});
  const frameTime = useFrameTime();
  const p1Contr = useRef(0);
  const p2Contr = useRef(0);
  p1Contr.current = useControls(
    PlayerID.p1, game, props.controlP1, props.dimensions, props.orientation, 
  ); 
  p2Contr.current = useControls(
    PlayerID.p2, game, props.controlP2, props.dimensions, props.orientation, 
  ); 

  const updatePaddleCtrl = () => {
    paddleCtrl.current = {"p1": p1Contr.current, "p2": p2Contr.current};
  }

  const handleEsc = () => props.goBack("");
  useKeyEvent("Escape", "keydown", handleEsc);

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
      updatePaddleCtrl();
      game.updatePaddleDirections(paddleCtrl.current);
      game.advanceBoard((frameTime - prevFrameTime) / (1000/60));
      setGameState(displayState(game.getBoard()));
    }
  }

  return <GameScreen 
    score = {game.getScore()}
    p1 = {gameState.p1} 
    p2 = {gameState.p2}
    ball = {gameState.ball}
    goBack = {props.goBack}
    winner = {game.getWinner()}
    setDimensions = {props.setDimensions}
    orientation = {props.orientation}
    setOrientation = {props.setOrientation}
  />
}



