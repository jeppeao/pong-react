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

export interface Vec2D {
  x: number,
  y: number,
}

export interface GameState {
  ball: MobileRect,
  [Player.P1]: MobileRect,
  [Player.P2]: MobileRect,
  winner: Player | null,
}

export enum Dim {
  x = 'x',
  y = 'y'
}

export const clamp = (min: number, num: number, max: number) => Math.min(Math.max(num, min), max);
export const rand = (min=0, max=1) => Math.random() * (max - min) + min;
export const randSign = () => (rand() < 0.5 ? -1 : 1);
export const vec2D = (x: number, y: number) => { return { 'x': x, 'y': y } };


export class MobileRect {
  pos: Vec2D;
  size: Vec2D;
  offset: Vec2D;
  ymin: number;
  ymax: number;
  direction: Vec2D;
  id: string;
  constructor(id: string, center: Vec2D, size: Vec2D) {
    this.pos = center;
    this.size = size;
    this.offset = vec2D(size.x / 2, size.y / 2);
    this.ymin = 0 + this.offset.y;
    this.ymax = 1 - this.offset.y;
    this.direction = vec2D(0, 0);
    this.id = id;
  }

  isColliding(rect: MobileRect) {
    if (this.pos.x - this.offset.x < rect.pos.x + rect.offset.x &&
      this.pos.x + this.offset.x > rect.pos.x - rect.offset.x &&
      this.pos.y - this.offset.y < rect.pos.y + rect.offset.y &&
      this.pos.y + this.offset.y > rect.pos.y - rect.offset.y) {
      return rect;
    }
    return false;
  }

  align(rect: MobileRect, dim: Dim) {
    // Returns closest coordinate that avoids collision with rect
    // in dimension dim
    // Adds a small correction to account for float imprecision
    const d = rect.offset[dim] + this.offset[dim] + 0.000001;
    return rect.pos[dim] > this.pos[dim] ? rect.pos[dim] -d : rect.pos[dim] +d;
  }

  move(corr=1) {
    this.pos.x += this.direction.x * corr;
    this.pos.y += this.direction.y * corr;
    // Constrain movement to board in the y-dimension
    this.pos.y = clamp(this.ymin, this.pos.y, this.ymax);
  }
}

//==================================
//    PADDLE AND BALL COMPONENTS   
//==================================

class Ball extends MobileRect {
  START_SPEED = 0.2;
  SPEED_INCREASE = 0.08;
  MAX_SPEED = vec2D(1.2, 0.6);
  serving = false;

  constructor(id: string, center: Vec2D, size: Vec2D) {
    super(id, center, size);
  }

  move(corr: number) {
    super.move(corr);
    // Bounce off walls
    if (this.pos.y === this.ymin || this.pos.y === this.ymax) {
      this.direction.y *= -1;
    }
  }
   
  increaseSpeed(inc: number) {
    // increase speed in x-dimension only
    let s = this.direction.x * 1 + inc * Math.sign(this.direction.x);
    s = clamp(-1 * this.MAX_SPEED.x, s, this.MAX_SPEED.x);
    this.direction.x = -s;
  }

  paddleBounce(rect: MobileRect) {
    this.pos.x = this.align(rect, Dim.x);
    this.increaseSpeed(this.SPEED_INCREASE);
    // Set y-speed, ie angle, based on paddle center to ball distance
    const d2c = (this.pos.y - rect.pos.y) / (rect.offset.y + this.offset.y);
    let y = this.MAX_SPEED.y * d2c;
    this.direction.y = clamp(-1 * this.MAX_SPEED.x, y, this.MAX_SPEED.x);
  }

  randomDir() {
    const dirX = this.START_SPEED * randSign();
    const dirY = rand(0, this.MAX_SPEED.y / 2) * randSign();
    this.direction = vec2D(dirX, dirY);
  }

  serve() {
    this.pos = vec2D(0.5, 0.5);
    this.randomDir();
  }
}

class Paddle extends MobileRect {
  score = 0;
  constructor(id: string, center: Vec2D, size: Vec2D) {
    super(id, center, size);
  }
}

//=============
//    GAME    
//=============

export class Game {
  WIN_SCORE = 11;
  RATIO = 16/9; // Only used to adjust y-size of ball 
  ballSize = vec2D(0.015, 0.015*this.RATIO);
  ballStart = vec2D(0.5, 0.5);
  playerSize = vec2D(0.015, 0.1);
  p1Start = vec2D(0.05, 0.5);
  p2Start = vec2D(0.95, 0.5);
  ball = new Ball("ball", this.ballStart, this.ballSize);
  p1 = new Paddle("p1", this.p1Start, this.playerSize);
  p2 = new Paddle("p2", this.p2Start, this.playerSize);
  
  framesToWait = 60;
  waitCallback: (() => void )| null = null;
  winner: Player | null = null;
  constructor() {
    this.ball.randomDir()
  }

  getBoard() {
    return {ball: this.ball, [Player.P1]: this.p1, [Player.P2]: this.p2};
  }

  getGameState() {
    return {...this.getBoard(), winner: this.winner}
  }

  getScore() {
    return {p1: this.p1.score, p2: this.p2.score};
  }

  getWinner() {
    return this.winner;
  }

  updatePaddleDirections(ctrlState: ControlState) {
    this.p1.direction.y = ctrlState[Player.P1];
    this.p2.direction.y = ctrlState[Player.P2];
  }

  advanceBoard(frames: number) {
    if (this.winner) {
      return;
    }
    // parameter frames as float, 1 frame should be 1/60 secs
    const s = frames / 60;
    this.p1.move(s);
    this.p2.move(s);

    if (this.framesToWait > 0) {
      this.framesToWait -= frames;
      this.framesToWait = Math.max(this.framesToWait, 0);
      return
    }
    if (this.waitCallback) {
      const f = this.waitCallback;
      this.waitCallback = null;
      f();
      return;
    }
    this.ball.move(s);

    const col = this.ballPaddleCollision()
    col ? this.ball.paddleBounce(col) : this.checkForGoals();
  }

  scoreGoal(player: Paddle) {
    this.framesToWait = 60;
    this.waitCallback = () => {
      this.ball.serve(); 
      this.framesToWait = 60;
    }
    this.ball.direction = vec2D(0, 0);
    player.score += 1;
  }

  ballPaddleCollision() {
    return this.ball.isColliding(this.p1) || this.ball.isColliding(this.p2);
  }

  checkForGoals() {
    const p1goal = this.p1.pos.x - 2* this.ball.offset.x - this.p1.offset.x;
    const p2goal = this.p2.pos.x + 2* this.ball.offset.x + this.p2.offset.x;
    if (this.ball.pos.x < p1goal) {
      this.scoreGoal(this.p2);
      if (this.p2.score === this.WIN_SCORE) {
        this.winner = Player.P2;
      }
    }
    if (this.ball.pos.x > p2goal) {
      this.scoreGoal(this.p1);
      if (this.p1.score === this.WIN_SCORE) {
        this.winner = Player.P1;
      }
    }
  }
}


