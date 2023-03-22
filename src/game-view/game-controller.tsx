import { Controls, Orientation, Player } from "common/constants";
import { newControlState } from "common/controls";
import { useActiveKeys, useFrameTime, usePointerEventNavigation } from "common/hooks";
import { Game, GameState, MobileRect } from "common/pong";
import { useEffect, useRef, useState } from "react";
import { GameScreen } from "./game-components";

export interface GameControlProps {
  game: Game | null,
  controls: Controls,
  orientation: Orientation,
  onMenuClick: () => void;
  onAnyKey: () => void;
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

export const GameController = (props : GameControlProps) => {
  const game = props.game || {} as Game;
  const controls = props.controls;
  const [gameState, setGameState] = useState(displayState(game.getGameState()));
  const [prevFrameTime, setPrevFrameTime] = useState(0);
  const frameTime = useFrameTime();
  const controlState = useRef(newControlState(controls, game.getGameState(), []));
  const activeKeys = useActiveKeys();

  const activePointerCoords = usePointerEventNavigation();
  useEffect( () => {
    if (game.winner && game.winner !== null && activeKeys.length !== 0) {
      props.onAnyKey();
    }
  });

  useEffect( () => {
    if (activeKeys.includes("Escape")) {
      props.onMenuClick();
    }
  });

  if (frameTime - prevFrameTime > 12) {
    // Prevent infinite re-render loop
    // Expected interval is around 16ms
    if (frameTime - prevFrameTime > 32) {
      setPrevFrameTime(frameTime);
    }
    else {
      setPrevFrameTime(frameTime);
      controlState.current = newControlState(controls, game.getGameState(), activeKeys);
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
    onMenuClick = {props.onMenuClick}
    winner = {game.getWinner()}
    orientation = {props.orientation}
  />
}


