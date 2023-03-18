import { Game } from "common/pong";
import { Controls } from "common/controls";

export interface MainMenuProps {
  gameActive: boolean,
  onCtrlClick: () => void,
  onNewGame: () => void,
  onContinue: () => void,
  controls: Controls,
}

export interface ContinuteButtonProps {
  clickHandler: () => void
}

export const MainMenu = (props: MainMenuProps) => {
  
  return (
    <div className = "menu-container">
      <div className = "menu">
        <h1 className = "menu-title">PONG</h1>
        <MenuButton 
          clickHandler = {props.onCtrlClick} 
          text = {"SET CONTROLS"}
        />
        <MenuButton 
          clickHandler = {props.onNewGame} 
          text = {"NEW GAME"}
        />
        {props.gameActive && <ContinueButton
          clickHandler = {props.onContinue}
        />
        }
      </div>
    </div>
  );
}

const MenuButton = (props: {clickHandler: () => void, text: string}) => {
  return (
    <button onClick = {props.clickHandler} className="menu-button">
      {props.text}
    </button>
  );
}

const ContinueButton = (props: ContinuteButtonProps) => {
    return (
      <button 
        onClick={props.clickHandler}
        className="menu-button"
      >
        CONTINUE GAME
      </button>
    );
}

const CycleButton = (props: {handleClick: () => void, text: string}) => {
  return (
    <button 
      className = "menu-button cycle-button"
      dangerouslySetInnerHTML={{__html: props.text}}
      onClick = {props.handleClick}
    >
    </button>
  );
}