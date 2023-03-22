import { AiController, KeyController } from "common/controls";
import { arrowDescr, Controls, Player } from "common/constants";

export interface MainMenuProps {
  gameActive: boolean,
  onCtrlClick: () => void,
  onNewGame: () => void,
  onContinue: () => void,
  controls: Controls,
}

export interface ControlsMenuProps {
  controls: Controls;
  cycleCtrlType: (arg: Player) => void,
  cycleSubtype:  (arg: Player) => void, 
  onBack: () => void,
}

export interface PlayerControlsCyclerProps {
  onCycleType: () => void,
  onCycleSetting: () => void, 
  playerLabel: string,
  type: string,
  setting: string
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
        {props.gameActive && <MenuButton
          clickHandler = {props.onContinue}
          text = {"CONTINUE GAME"}
        />
        }
      </div>
    </div>
  );
}

export const ControlsMenu = (props: ControlsMenuProps) => {
  const getCurrentControlTypeLabel = (player: Player) => {
    if (props.controls[player] instanceof AiController) {
      return "ai";
    }
    else if (props.controls[player] instanceof KeyController)  {
      return "key";
    }
    else {
      return "pointer"
    }
  }

  const getCurrentControlSettingLabel = (player: Player) => {
    const ctrl = props.controls[player]; 
    if (ctrl instanceof AiController) {
      return ctrl.difficulty;
    }
    else if (ctrl instanceof KeyController){
      if (player === Player.P1) {
        return "w/s a/d"
      }
      return arrowDescr;
    }
    else {
      return "click";
    }
  }

  return (
    <div className = "menu-container">
      <div className = "menu">
        <h1 className = "menu-title">PONG</h1>
        <PlayerControlsCycler
          playerLabel="P1"
          type={getCurrentControlTypeLabel(Player.P1)}
          setting={getCurrentControlSettingLabel(Player.P1)}
          onCycleType={() => props.cycleCtrlType(Player.P1)}
          onCycleSetting={() => props.cycleSubtype(Player.P1)}
        />
        <PlayerControlsCycler
          playerLabel="P2"
          type={getCurrentControlTypeLabel(Player.P2)}
          setting={getCurrentControlSettingLabel(Player.P2)}
          onCycleType={() => props.cycleCtrlType(Player.P2)}
          onCycleSetting={() => props.cycleSubtype(Player.P2)}
        />
        <MenuButton
          clickHandler={props.onBack}
          text="GO BACK"
        />

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

const PlayerControlsCycler = (props: PlayerControlsCyclerProps) => {
  return (
    <div className = "player-controls-button">
      <p className = "player-controls-label"> {props.playerLabel} </p>
      <CycleButton 
        text = {props.type}
        handleClick = {props.onCycleType}
      />
      <CycleButton 
        text = {props.setting}
        handleClick = {props.onCycleSetting}
      />
    </div>
  );
}