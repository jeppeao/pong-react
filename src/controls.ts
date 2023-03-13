import { Player, Direction, ControlState, GameState, rand } from "./pong";

export enum AiLvl {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

type Controls = {
  [key in Player]: KeyController | AiController
}

export function newControlState(
  controls: Controls,
  gameState: GameState,
  activeKeys: string[]
): ControlState {
  let cs = {} as ControlState;
  // Object.keys returns a list of first keys then values when passed an enum 
  let keys = Object.keys(Player).map(s => parseInt(s));
  for (const k of keys.slice(0, keys.length / 2)) {
    const ctrl = (controls as any)[k];
    if (ctrl instanceof AiController) {
      cs = { ...cs, [k]: ctrl.getDirection(gameState) };
    }
    else {
      cs = { ...cs, [k]: ctrl.getDirection(activeKeys) };
    }
  }
  return cs;
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

  constructor(player: Player, difficulty: AiLvl) {
    this.player = player;
    this.err = {'easy': 0.2, 'medium': 0.1, 'hard': 0.05}[difficulty];
  }

  getDirection(gameState: GameState): Direction {
    const player = gameState[this.player];
    const ball = gameState.ball;
    const receiving = Math.sign(player.pos.x - ball.pos.x) ===
      Math.sign(ball.direction.x); 

    if (receiving && ball.pos.y != 0.5 && !this.targetSet) {
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

function predictBallImpact(paddle: Player, gamestate: GameState) {
  const ppos = gamestate[paddle].pos;
  const ball = gamestate.ball;
  let [xSpeed, ySpeed] = Object.values(ball.direction);
  const [bpx, bpy, boy] = [...Object.values(ball.pos), ball.offset.y];
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

export const testControls = {
  [Player.P1] : new AiController(Player.P1, AiLvl.EASY),
  [Player.P2] : new AiController(Player.P2, AiLvl.HARD),
}


