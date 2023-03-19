import { AiController, AiLvl, KeyController } from "./controls";
import { Player } from "./pong";

const arrowL = `<span class="rotate90">&#8593;</span>`
const arrowR = `<span class="rotate90">&#8595;</span>`
export const arrowDescr = `&#8593;/&#8595; ${arrowL}/${arrowR}`;

export enum Orientation {
  horizontal = 'horizontal',
  vertical = 'vertical'
}

export enum ControlTypes {
  key = 0,
  ai = 1
}

export const KeySettings = {
  1: {upKeys: ['w', 'a'], downKeys: ['s', 'd']},
  2: {upKeys: ['ArrowLeft','ArrowUp'], downKeys: ['ArrowDown','ArrowRight']},
}

export const defaultControls = {
  [Player.P1] : new AiController(Player.P1, AiLvl.EASY),
  [Player.P2] : new KeyController(['a', 'w'], ['s', 'd']),
}