import { ControlTypes } from "common/constants";
import { Controls, keySetting, aiSetting, newControls, AiController, AiLvl } from "common/controls";
import { Player } from "common/pong";
import { MainMenu } from "menu-view/menu-component";
import { useState } from "react";
import { SetControlsMenu } from "view";

export interface MenuControllerProps {
  gameActive: boolean,
  onNewGame: () => void,
  onContinue: () => void,
  controls: Controls,
  setControls: (controls: Controls) => void
}

export const MenuController = (props: MenuControllerProps) => {
  const [ctrlMenuOn, setCtrlMenuOn]  = useState(false);


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

  const nextControlType = (controls: Controls, player: Player) => {
    if (controls[player] instanceof AiController) {
      onChangeControls(controls, player, getPlayerKeys(player));
    }
    else {
      onChangeControls(controls, player, {difficulty: AiLvl.EASY});
    }
  }

  const nextControlSetting = (controls: Controls, player: Player) => {
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
      <p></p>
    )
  }
}