import { Ice } from '../ice/ice';
import { Snowball } from '../snowball/snowball';
import { Pipe } from '@/actors/pipe/pipe';
import { Config } from '@/config';
import { Resources } from '@/resources';
import { Level } from '@/scenes/level';
import * as ex from 'excalibur';

export class Penguin extends ex.Actor {
  playing = false;
  walkAnimation!: ex.Animation;
  startSprite!: ex.Sprite;
  private timeSinceLastIce = 0;

  constructor(private level: Level) {
    super({
      pos: Config.Player.StartPos,
      radius: 8,
      color: ex.Color.Yellow,
    });
    this.level = level;
  }

  override onInitialize(engine: ex.Engine): void {
    engine.input.pointers.primary.on('down', (evt) => {
      const snowball = new Snowball(this, evt.worldPos.sub(this.pos));
      this.level.add(snowball);
    });

    this.initSprites();
    this.on('exitviewport', () => {
      this.level.triggerGameOver();
    });
  }

  override onPostUpdate(engine: ex.Engine, delta: number): void {
    if (!this.playing) return;

    // Accumulate time since last Ice creation
    const deltaSeconds = delta / 1000;
    this.timeSinceLastIce += deltaSeconds;

    if (
      engine.input.keyboard.isHeld(ex.Keys.Space) &&
      this.timeSinceLastIce >= 0.05
    ) {
      const snowball = new Ice(this);
      this.level.add(snowball);
      // Reset ice timer
      this.timeSinceLastIce = 0;
    }

    if (
      [ex.Keys.ArrowLeft, ex.Keys.A].some((k) =>
        engine.input.keyboard.isHeld(k),
      )
    ) {
      // Move Left
      this.vel.x -= Config.Player.Acceleration;
      this.walkAnimation.flipHorizontal = false;
      this.graphics.use('walk');
    } else if (
      [ex.Keys.ArrowRight, ex.Keys.D].some((k) =>
        engine.input.keyboard.isHeld(k),
      )
    ) {
      // Move Right
      this.vel.x += Config.Player.Acceleration;
      this.walkAnimation.flipHorizontal = true;
      this.graphics.use('walk');
    }

    if (
      [ex.Keys.ArrowUp, ex.Keys.W].some((k) => engine.input.keyboard.isHeld(k))
    ) {
      // Move Up
      this.vel.y -= Config.Player.Acceleration;
      this.graphics.use('walk');
    } else if (
      [ex.Keys.ArrowDown, ex.Keys.S].some((k) =>
        engine.input.keyboard.isHeld(k),
      )
    ) {
      // Move Down
      this.graphics.use('walk');
      this.vel.y += Config.Player.Acceleration;
    }

    if (
      ![
        ex.Keys.ArrowDown,
        ex.Keys.ArrowUp,
        ex.Keys.ArrowLeft,
        ex.Keys.ArrowRight,
        ex.Keys.W,
        ex.Keys.A,
        ex.Keys.S,
        ex.Keys.D,
      ].some((k) => engine.input.keyboard.isHeld(k))
    ) {
      this.graphics.use('start');
      // Preserve flip state
      this.startSprite.flipHorizontal = this.walkAnimation.flipHorizontal;

      // Slow the player down
      this.decelerate();
    }

    // Keep velocity from getting too big
    this.vel.y = ex.clamp(
      this.vel.y,
      Config.Player.MinVelocity,
      Config.Player.MaxVelocity,
    );
    this.vel.x = ex.clamp(
      this.vel.x,
      Config.Player.MinVelocity,
      Config.Player.MaxVelocity,
    );
  }

  start() {
    this.playing = true;
    this.pos = Config.Player.StartPos; // starting position
    this.acc = ex.vec(0, 0); // pixels per second per second
  }

  reset() {
    this.pos = Config.Player.StartPos; // starting position
    this.stop();
  }

  stop() {
    this.playing = false;
    this.vel = ex.vec(0, 0);
    this.acc = ex.vec(0, 0);
  }

  private decelerate() {
    if (Math.abs(this.vel.x) < Config.Player.Deceleration) {
      this.vel.x = 0;
    } else {
      // Subtract deceleration in the direction of current velocity
      this.vel.x -= Math.sign(this.vel.x) * Config.Player.Deceleration;
    }

    if (Math.abs(this.vel.y) < Config.Player.Deceleration) {
      this.vel.y = 0;
    } else {
      // Subtract deceleration in the direction of current velocity
      this.vel.y -= Math.sign(this.vel.y) * Config.Player.Deceleration;
    }
  }

  override onCollisionStart(_self: ex.Collider, other: ex.Collider): void {
    if (other.owner instanceof Pipe) {
      this.level.triggerGameOver();
    }
  }

  private initSprites() {
    const spriteSheet = ex.SpriteSheet.fromImageSource({
      image: Resources.PenguinWalk,
      grid: {
        rows: 1,
        columns: 6,
        spriteWidth: 64,
        spriteHeight: 64,
      },
    });

    this.startSprite = spriteSheet.getSprite(0, 0);
    this.startSprite.flipHorizontal = true;

    this.walkAnimation = ex.Animation.fromSpriteSheet(
      spriteSheet,
      [0, 1, 2, 3, 4, 5],
      150,
      ex.AnimationStrategy.Loop,
    );
    this.walkAnimation.flipHorizontal = true;

    // Register
    this.graphics.add('walk', this.walkAnimation);
    this.graphics.add('start', this.startSprite);
    this.graphics.use('start');
  }
}
