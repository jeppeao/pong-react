import { AiController, KeyController, PointerController } from "./controls";

export const arrowL = `<span class="rotate90">&#8593;</span>`
export const arrowR = `<span class="rotate90">&#8595;</span>`
export const arrowU = `&#8593;`;
export const arrowD = `&#8595;`;
export const arrowDescr = `&#8593;/&#8595; ${arrowL}/${arrowR}`;

export interface Vec2D {
  x: number,
  y: number,
}

export enum Player {
  P1 = 1,
  P2 = 2 
}

export enum Direction {
  UP = -1,
  NONE = 0,
  DOWN = 1
}

export type ControlState = {
  [val in Player]: Direction
}

export interface KeySetting {
  upKeys: string[],
  downKeys: string[],
}

export interface AiSetting {
  difficulty: AiLvl;
}

export enum AiLvl {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export type Controls = {
  [key in Player]: KeyController | AiController | PointerController
}

export type PointerNavigationCoords = {
  [key in Player]: number
}

export enum Orientation {
  horizontal = 'horizontal',
  vertical = 'vertical'
}

export const defaultKeySettings = {
  [Player.P1]: {
    upKeys: ['w', 'a'], 
    downKeys: ['s', 'd']
  },
  [Player.P2]: {
    upKeys: ['ArrowLeft','ArrowUp'], 
    downKeys: ['ArrowDown','ArrowRight']
  },
}

export const defaultControls = {
  [Player.P1] : new KeyController(['w', 'a'], ['s', 'd']),
  [Player.P2] : new AiController(Player.P2, AiLvl.EASY),
}


export const defaultMobileControls = {
  [Player.P1] : new PointerController(Player.P1),
  [Player.P2] : new AiController(Player.P2, AiLvl.EASY),
}