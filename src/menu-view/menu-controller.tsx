import { 
  Controls,
  AiLvl,
  AiSetting,
  KeySetting,
  Player,
  defaultKeySettings,
} from "common/constants";
import { newControls, AiController, KeyController } from "common/controls";
import { ControlsMenu, MainMenu } from "menu-view/menu-components";
import { useEffect, useRef, useState } from "react";

export interface MenuControllerProps {
  gameActive: boolean,
  controls: Controls,
  onNewGame: () => void,
  onContinue: () => void,
  setControls: (controls: Controls) => void
}

export const MenuController = (props: MenuControllerProps) => {
  const [ctrlMenuOn, setCtrlMenuOn] = useState(false);
  const controls = props.controls;
  const reservedKeys = useRef(defaultKeySettings);
  const validControlKeys = /^([a-z0-9]|Arrow(Up|Down|Left|Right))$/

  const verifyCustomKey = (key: string) => {
    // returns the error, null indicates valid key
    let error = null;
    const cur = reservedKeys.current;

    if (!validControlKeys.test(key)) {
      error = 'INVALID KEY'; 
    }
    else if (
      cur[Player.P1].upKeys.includes(key) ||
      cur[Player.P2].upKeys.includes(key) ||
      cur[Player.P1].downKeys.includes(key) ||
      cur[Player.P2].downKeys.includes(key)
    ) {
      error = 'KEY ALREADY ACTIVE'
    }
    return error;
  }

  const setKeys = (newKey: string, player: Player, keys: KeySetting) => {
    const error = verifyCustomKey(newKey);
    if (error != null) {
      return error;
    }
    const newPlayerKeys = {...keys};
    reservedKeys.current = {...reservedKeys.current, [player]: newPlayerKeys};

    onChangeControls(controls, player, newPlayerKeys);
    return error;
  }

  const onChangeControls = (
    control: Controls,
    player: Player,
    setting: KeySetting | AiSetting | {}
  ) => {
    props.setControls(newControls(control, player, setting));
  }

  const getPlayerKeys = (player: Player): KeySetting => {
    return reservedKeys.current[player];
  }

  const cycleControlType = (player: Player) => {
    if (controls[player] instanceof AiController) {
      onChangeControls(controls, player, getPlayerKeys(player));
    }
    else if (controls[player] instanceof KeyController) {
      onChangeControls(controls, player, {});

    }
    else {
      onChangeControls(controls, player, {difficulty: AiLvl.EASY});
    }
  }

  const cycleControlSetting = (player: Player) => {
    const ctrl = controls[player]
    if (ctrl instanceof AiController) {
      switch(ctrl.difficulty) {
        case AiLvl.EASY:
          onChangeControls(controls, player, {difficulty: AiLvl.MEDIUM});
          break;
        case AiLvl.MEDIUM:
          onChangeControls(controls, player, {difficulty: AiLvl.HARD});
          break;
        case AiLvl.HARD:
          onChangeControls(controls, player, {difficulty: AiLvl.EASY});
          break;
      }
    }
    // for key and pointer controls, no cycling is done
  }

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (props.gameActive) {
          props.onContinue();
        }
      }
    }
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [props]); 
  
  if (!ctrlMenuOn) {
    return (
      <MainMenu
        gameActive={props.gameActive}
        onCtrlClick={() => setCtrlMenuOn(true)}
        onNewGame={props.onNewGame}
        onContinue={props.onContinue}
        controls={props.controls}
      />
    )
  }
  else {
    return (
      <ControlsMenu
        controls={props.controls}
        cycleCtrlType={cycleControlType}
        cycleSubtype={cycleControlSetting}
        onBack={() => setCtrlMenuOn(false)}
        setKeys={setKeys}
      />
    )
  }
}