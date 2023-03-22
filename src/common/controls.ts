import { 
  AiLvl,
  AiSetting,
  Controls,
  ControlState,
  Direction,
  KeySetting,
  Player,
  PointerNavigationCoords
} from "./constants";
import { GameState, rand } from "./pong";

function isKeySetting(obj: {}): obj is KeySetting {
  return 'downKeys' in obj && 'upKeys' in obj;
}

function isAiSetting(obj: {}): obj is AiSetting {
  return 'difficulty' in obj;
}

export function newControls (
  controls: Controls,
  player: Player,
  setting: KeySetting | AiSetting | {}
): Controls {
  if (isAiSetting(setting)) {
    const controller = new AiController(player, setting.difficulty)
    return {...controls, [player]: controller };
  }
  else if (isKeySetting(setting)) {
    const controller = new KeyController(setting.upKeys, setting.downKeys)
    return {...controls, [player]: controller };
  }
  else {
    const controller = new PointerController(player)
    return {...controls, [player]: controller }; 
  }
}

export function newControlState(
  controls: Controls,
  gameState: GameState,
  activeKeys: string[],
  activePointerCoords: PointerNavigationCoords
): ControlState {
  let cs = {} as ControlState;
  // Object.keys returns a list of first keys then values when passed an enum 
  let keys = Object.keys(Player).map(s => parseInt(s));
  for (const k of keys.slice(0, keys.length / 2)) {
    const ctrl = (controls as any)[k];
    if (ctrl instanceof AiController) {
      cs = { ...cs, [k]: ctrl.getDirection(gameState) };
    }
    else if (ctrl instanceof KeyController) {
      cs = { ...cs, [k]: ctrl.getDirection(activeKeys) };
    }
    else { // pointer controls
      cs = { ...cs, [k]: ctrl.getDirection(activePointerCoords, gameState)}
    }
  }
  return cs;
}

function predictBallImpact(paddle: Player, gamestate: GameState) {
  const ppos = gamestate[paddle].pos;
  const ball = gamestate.ball;
  let [xSpeed, ySpeed] = Object.values(ball.direction);
  const bpy = ball.pos.y;
  const xDist = Math.abs(ball.pos.x - ppos.x);
  const yDist = Math.abs(ySpeed * xDist / xSpeed);
  let t;
  const yInt = Math.floor(yDist);
  const yFrac = (yDist - yInt);
  // Calculate ball ySpeed and yPos (t) after traversing yFrac in y dimension
  // does not take into account that bounces happpens at offset.y
  // distance to walls
  const wallDist = Math.sign(ySpeed) < 0 ? bpy : (1-bpy);
  if (yFrac < wallDist) {
    t = bpy + Math.sign(ySpeed) * yFrac;
  }
  else {
    t = Math.sign(ySpeed) < 0 ? yFrac - wallDist : 1 - (yFrac - wallDist); 
    ySpeed *= -1;
  }
  // ySPeed and yPos are unchanged after 2 screens of y movement
  ySpeed = (yInt > 0 && yInt % 2) ? -ySpeed : ySpeed;
  t = yInt === 1 ? 1 - t : t; 
  return t;
}

function seek (val:number, target: number, slack: number) {
  // returns direction of change for val to approach target
  // returns value 0 if val and target are within slack of each other
  let d = val > target + slack ? Direction.UP : Direction.NONE;
  d = val < target - slack ? Direction.DOWN : d;
  return d;
}

export class PointerController {
  player: Player;
  SLACK = 0.05;

  constructor(player: Player) {
    this.player = player;
  }

  getDirection(
    pointerCoords: PointerNavigationCoords, 
    gameState: GameState
  ): Direction {
    const target = pointerCoords[this.player];
    const pos = gameState[this.player].pos.y;
    // let dir = Direction.NONE;
    // dir = target > pos + this.SLACK ? Direction.DOWN : dir;
    // dir = target < pos + this.SLACK ? Direction.UP : dir;
    return seek(pos, target, this.SLACK);
  }  
}

export class KeyController {
  upKeys: string[];
  downKeys: string[]; 

  constructor(upKeys: string[], downKeys: string[]) {
    this.upKeys = upKeys;
    this.downKeys = downKeys;
  }

  getDirection(activeKeys: string[]): Direction {
    const up = this.upKeys.some(k => activeKeys.includes(k));
    const down = this.downKeys.some(k => activeKeys.includes(k));
    let dir = Direction.NONE;
    dir = up && !down ? Direction.UP : dir;
    dir = down && !up ? Direction.DOWN : dir;
    return dir;
  }
}

export class AiController {
  player: Player;
  err: number;
  target = 0.5;
  targetSet = false;
  difficulty;

  constructor(player: Player, difficulty: AiLvl) {
    this.player = player;
    this.difficulty = difficulty;
    this.err = {'easy': 0.12, 'medium': 0.08, 'hard': 0.055}[difficulty];
  }

  getDirection(gameState: GameState): Direction {
    const player = gameState[this.player];
    const ball = gameState.ball;
    const receiving = Math.sign(player.pos.x - ball.pos.x) ===
      Math.sign(ball.direction.x); 

    if (receiving && ball.pos.y !== 0.5 && !this.targetSet) {
      let t = predictBallImpact(this.player, gameState);
      this.target = t + rand(-this.err, this.err); 
      this.targetSet = true; 
    }
    else if (!receiving) {
      // Return to middle of court
      this.target = 0.5;
      this.targetSet = false;
    }
    return seek(player.pos.y, this.target, player.size.y / 4);
  }
}




