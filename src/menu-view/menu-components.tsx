import { AiController, KeyController } from "common/controls";
import {
  arrowD,
  arrowDescr,
  arrowL,
  arrowR,
  arrowU,
  Controls,
  KeySetting,
  Player
} from "common/constants";
import { useRef, useState } from "react";

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
  cycleSubtype: (arg: Player) => void,
  onBack: () => void,
  setKeys: (
    newKey: string,
    player: Player,
    keys: KeySetting
  ) => string | null;
}

export interface PlayerControlsCyclerProps {
  onCycleType: () => void,
  onCycleSetting: () => void,
  enterKeySettings: () => void,
  playerLabel: string,
  type: string,
  setting: string
}

export interface KeySelectorProps {
  player: Player;
  controls: Controls;
  setKeys: (
    newKey: string,
    player: Player,
    keys: KeySetting
  ) => string | null;
  getKeyLabel: (key: string) => string;
}



export const MainMenu = (props: MainMenuProps) => {
  return (
    <div className="menu-container">
      <div className="menu">
        <h1 className="menu-title">PONG</h1>
        <MenuButton
          clickHandler={props.onCtrlClick}
          text={"SET CONTROLS"}
        />
        <MenuButton
          clickHandler={props.onNewGame}
          text={"NEW GAME"}
        />
        {props.gameActive && <MenuButton
          clickHandler={props.onContinue}
          text={"CONTINUE GAME"}
        />
        }
      </div>
    </div>
  );
}

export const ControlsMenu = (props: ControlsMenuProps) => {
  const [editKeysMenuState, setEditKeysMenuState] = useState({ on: false, player: Player.P1 });

  const getCurrentControlTypeLabel = (player: Player) => {
    if (props.controls[player] instanceof AiController) {
      return "ai";
    }
    else if (props.controls[player] instanceof KeyController) {
      return "key";
    }
    else {
      return "pointer"
    }
  }

  const getKeyCharString = (key: string) => {
    switch (key) {
      case 'ArrowUp':
        return arrowU
      case 'ArrowDown':
        return arrowD
      case 'ArrowLeft':
        return arrowL
      case 'ArrowRight':
        return arrowR
      default:
        return key;
    }
  }

  const getCurrentControlSettingLabel = (player: Player) => {

    const getKeyLabel = (upKeys: string[], downKeys: string[]) => {
      return (
        getKeyCharString(upKeys[0]) +
        "/" +
        getKeyCharString(upKeys[1]) +
        " " +
        getKeyCharString(downKeys[0]) +
        "/" +
        getKeyCharString(downKeys[1])
      );
    }

    const ctrl = props.controls[player];
    if (ctrl instanceof AiController) {
      return ctrl.difficulty;
    }
    else if (ctrl instanceof KeyController) {
      return getKeyLabel(ctrl.upKeys, ctrl.downKeys);
    }
    else {
      return "click";
    }
  }

  if (!editKeysMenuState.on) {
    return (
      <div className="menu-container">
        <div className="menu">
          <h1 className="menu-title">PONG</h1>
          <PlayerControlsCycler
            playerLabel="P1"
            type={getCurrentControlTypeLabel(Player.P1)}
            setting={getCurrentControlSettingLabel(Player.P1)}
            onCycleType={() => props.cycleCtrlType(Player.P1)}
            onCycleSetting={() => props.cycleSubtype(Player.P1)}
            enterKeySettings={
              () => setEditKeysMenuState({ on: true, player: Player.P1 })
            }
          />
          <PlayerControlsCycler
            playerLabel="P2"
            type={getCurrentControlTypeLabel(Player.P2)}
            setting={getCurrentControlSettingLabel(Player.P2)}
            onCycleType={() => props.cycleCtrlType(Player.P2)}
            onCycleSetting={() => props.cycleSubtype(Player.P2)}
            enterKeySettings={
              () => setEditKeysMenuState({ on: true, player: Player.P2 })
            }
          />
          <MenuButton
            clickHandler={props.onBack}
            text="GO BACK"
          />
        </div>
      </div>

    );
  }
  else {
    return (
      <div className="menu-container">
        <div className="menu">
          <h1 className="menu-title">PONG</h1>
          <KeySelector
            player={editKeysMenuState.player}
            controls={props.controls}
            setKeys={props.setKeys}
            getKeyLabel={getKeyCharString}
          />
          <MenuButton
            clickHandler={() => setEditKeysMenuState({ on: false, player: Player.P1 })}
            text="GO BACK"
          />
        </div>
      </div>
    );
  }
}

const MenuButton = (props: { clickHandler: () => void, text: string }) => {
  return (
    <button onClick={props.clickHandler} className="menu-button">
      {props.text}
    </button>
  );
}

const CycleButton = (props: { handleClick: () => void, text: string }) => {
  return (
    <button
      className="menu-button cycle-button"
      dangerouslySetInnerHTML={{ __html: props.text }}
      onClick={props.handleClick}
    >
    </button>
  );
}

const PlayerControlsCycler = (props: PlayerControlsCyclerProps) => {

  return (
    <div className="player-controls-button">
      <p className="player-controls-label"> {props.playerLabel} </p>
      <CycleButton
        text={props.type}
        handleClick={props.onCycleType}
      />
      <CycleButton
        text={props.setting}
        handleClick={props.type === 'key'
          ? props.enterKeySettings
          : props.onCycleSetting
        }
      />
    </div>
  );
}

const KeySelector = (props: KeySelectorProps) => {
  const defaultSubtitle = "P" + props.player + " KEYS";
  const [subtitle, setSubtitle] = useState(defaultSubtitle);
  const keyModeOn = useRef(false);
  const ctrl = props.controls[props.player];
  let keys = { upKeys: ["", ""], downKeys: ["", ""] }
  if (ctrl instanceof KeyController) {
    keys = { upKeys: ctrl.upKeys, downKeys: ctrl.downKeys };
  }

  const onKeyClick = (oldKey: string, dir: string) => {
    keyModeOn.current = !keyModeOn.current;
    const cur: string[] = dir === "up" ? keys.upKeys : keys.downKeys;
    
    const setKey = (e: Event) => {
      if (keyModeOn.current) {
        let newKey = "";
        if (e instanceof KeyboardEvent) {
          newKey = e.key;
        }
        let oldIdx = cur.indexOf(oldKey);
        const newKeys = [...cur].map((val, i) => i === oldIdx ? newKey : val);
        const newSetting = dir === "up"
          ? { ...keys, upKeys: newKeys }
          : { ...keys, downKeys: newKeys };
        keyModeOn.current = false;
        props.setKeys(newKey, props.player, newSetting);
      }
      window.removeEventListener("keydown", setKey);
      setSubtitle(defaultSubtitle);
    }

    if (keyModeOn.current) {
      setSubtitle("ENTER NEW KEY");
      window.addEventListener("keydown", setKey);
    }
    else {
      setSubtitle(defaultSubtitle);
    }
  }

  return (
    <div>
      {
        keyModeOn.current &&
        <div
          className="key-edit-modal"
          onClick={() => onKeyClick("", "up")}
        ></div>
      }
      <p className="player-controls-label edit-keys-subtitle">{subtitle}</p>
      <div className="player-controls-button">
        <div
          className="player-controls-label"
          dangerouslySetInnerHTML={{ __html: arrowL }}
        ></div>
        <button
          className="menu-button key-select-button"
          onClick={() => onKeyClick(keys.upKeys[0], "up")}
          dangerouslySetInnerHTML={{ __html: props.getKeyLabel(keys.upKeys[0]) }}
        ></button>
        <button
          className="menu-button key-select-button"
          onClick={() => onKeyClick(keys.upKeys[1], "up")}
          dangerouslySetInnerHTML={{ __html: props.getKeyLabel(keys.upKeys[1]) }}
        ></button>
      </div>
      <div className="player-controls-button">
        <div
          className="player-controls-label"
          dangerouslySetInnerHTML={{ __html: arrowR }}
        ></div>
        <button
          className="menu-button key-select-button"
          onClick={() => onKeyClick(keys.downKeys[0], "down")}
          dangerouslySetInnerHTML={{ __html: props.getKeyLabel(keys.downKeys[0]) }}
        ></button>
        <button
          className="menu-button key-select-button"
          onClick={() => onKeyClick(keys.downKeys[1], "down")}
          dangerouslySetInnerHTML={{ __html: props.getKeyLabel(keys.downKeys[1]) }}
        ></button>
      </div>
    </div>
  )
}
