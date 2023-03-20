import { Orientation } from "common/constants";
import { Player } from "common/pong";

export interface DisplayElement {
  id: string
  top: string,
  left: string,
  height: string,
  width: string,
}

export interface GameScreenProps {
  onMenuClick: () => void;
  score: {p1: number, p2: number},
  ball: DisplayElement,
  p1: DisplayElement,
  p2: DisplayElement,
  winner: Player | null
  orientation: Orientation,
}

export const GameScreen = (props: GameScreenProps) => {

  return (
    <div className="game-screen">
      {MidLine(props.orientation)}
      {IngameMenuButton(props.onMenuClick, props.orientation)}
      {ScoreView("p1", props.score.p1, props.orientation)}
      {ScoreView("p2", props.score.p2, props.orientation)}
      {PieceView(props.ball, props.orientation)}
      {PieceView(props.p1, props.orientation)}
      {PieceView(props.p2, props.orientation)}
      {MessageView(props.winner)}
    </div>
  );
}


export const MessageView = (winner: Player | null) => {
  if (winner) {
    const wp = winner === Player.P1 ? "PLAYER 1" : "PLAYER 2";
    return (
      <div className="win-message">
        <h1 className = "win-h1">
          {wp + " WON!"}
        </h1>
        <p className="win-p">press any key to continue</p>
      </div>
    );
  }
}

export const MidLine = (orientation: Orientation) => {
  const cn = orientation === Orientation.horizontal 
    ? 'midline-vert' 
    : 'midline-horz';
  return (
    <div className={cn}></div>
  );
}

export const PieceView = (el: DisplayElement, orientation: Orientation) => {
  const className = el.id === "ball" ? "ball" : "paddle";
  const vert = orientation === Orientation.vertical;
  const style = {
    left: vert ? el.top : el.left,
    top: vert ? el.left : el.top,
    width: vert ? el.height : el.width,
    height: vert ? el.width : el.height
  };
  return (
    <div className={className} style={style}></div>
  );
}

export const ScoreView = (pid: string, score: number, orientation: Orientation) => {
  const cn = orientation === Orientation.vertical 
    ? `${pid}-vert` 
    : `${pid}-horz`;
  return (
      <p className = {"score " + cn} >
        {score}
      </p>
  );
}

export const IngameMenuButton = (onMenuClick: () => void, orientation: Orientation) => {
  const co = orientation === Orientation.vertical ? "mbi-vert" : "mbi-horz";
  const cn = "menu-button-ingame " + co; 

  return (
    <button className={cn}>
      <div className="menu-icon" onClick ={onMenuClick}>
        <div className="menu-icon-dot"></div>
        <div className="menu-icon-dot"></div>
        <div className="menu-icon-dot"></div>
      </div>
    </button>
  );
}