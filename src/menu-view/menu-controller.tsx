import { Controls, AiLvl, aiSetting, keySetting } from "common/constants";
import { newControls, AiController } from "common/controls";
import { Player } from "common/pong";
import { ControlsMenu, MainMenu } from "menu-view/menu-components";
import { useState } from "react";

export interface MenuControllerProps {
  gameActive: boolean,
  controls: Controls,
  onNewGame: () => void,
  onContinue: () => void,
  setControls: (controls: Controls) => void
}

export const MenuController = (props: MenuControllerProps) => {
  const [ctrlMenuOn, setCtrlMenuOn]  = useState(false);
  const controls = props.controls;
  
  const onChangeControls = (
    control: Controls,
    player: Player,
    setting: keySetting | aiSetting
  ) => {
    props.setControls(newControls(control, player, setting));
  }

  const getPlayerKeys = (player: Player): keySetting => {
    let settings: keySetting;
    if (player === Player.P1 ) {
      settings = {upKeys: ['w', 'a'], downKeys: ['s', 'd']}
    }
    else {
      settings = {
        upKeys: ['ArrowLeft','ArrowUp'], downKeys: ['ArrowDown','ArrowRight']
      };
    }
    return settings;
  }

  const cycleControlType = (player: Player) => {
    if (controls[player] instanceof AiController) {
      onChangeControls(controls, player, getPlayerKeys(player));
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
    else {
      onChangeControls(controls, player, getPlayerKeys(player))
    }
  }
  
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
      />
    )
  }
}