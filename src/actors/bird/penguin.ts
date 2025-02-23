import { Config } from '../../config';
import { Pipe } from '../../pipe';
import { Resources } from '../../resources';
import { Level } from '../../scenes/level';
import * as ex from 'excalibur';

export class Bird extends ex.Actor {
  playing = false;
  jumping = false;
  walkAnimation!: ex.Animation;
  startSprite!: ex.Sprite;

  constructor(private level: Level) {
    super({
      pos: Config.BirdStartPos,
      radius: 8,
      color: ex.Color.Yellow,
    });
    this.level = level;
  }

  override onInitialize(): void {
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
    this.walkAnimation = ex.Animation.fromSpriteSheet(
      spriteSheet,
      [0, 1, 2, 3, 4, 5],
      150,
      ex.AnimationStrategy.Loop,
    );

    // Register
    this.graphics.add('walk', this.walkAnimation);
    this.graphics.add('start', this.startSprite);

    this.graphics.use('start');

    this.on('exitviewport', () => {
      this.level.triggerGameOver();
    });
  }

  override onPostUpdate(engine: ex.Engine): void {
    if (!this.playing) return;

    if (engine.input.keyboard.isHeld(ex.Keys.ArrowLeft)) {
      this.vel.x -= Config.BirdAcceleration;
      this.graphics.use('walk');
      this.walkAnimation.flipHorizontal = false;
    } else if (engine.input.keyboard.isHeld(ex.Keys.ArrowRight)) {
      this.vel.x += Config.BirdAcceleration;
      this.graphics.use('walk');
      this.walkAnimation.flipHorizontal = true;
    } else {
      this.graphics.use('start');
      this.startSprite.flipHorizontal = this.walkAnimation.flipHorizontal;
      this.vel.x = 0;
    }

    if (engine.input.keyboard.isHeld(ex.Keys.ArrowUp)) {
      this.vel.y -= Config.BirdAcceleration;
    } else if (engine.input.keyboard.isHeld(ex.Keys.ArrowDown)) {
      this.vel.y += Config.BirdAcceleration;
    } else {
      this.vel.y = 0;
    }

    // keep velocity from getting too big
    this.vel.y = ex.clamp(this.vel.y, -500, 500);
    this.vel.x = ex.clamp(this.vel.x, -500, 500);
    // The "speed" the bird will move relative to pipes
    this.rotation = ex.vec(200, this.vel.y).toAngle();
  }

  start() {
    this.playing = true;
    this.pos = Config.BirdStartPos; // starting position
    this.acc = ex.vec(0, 0); // pixels per second per second
  }

  reset() {
    this.pos = Config.BirdStartPos; // starting position
    this.stop();
  }

  stop() {
    this.playing = false;
    this.vel = ex.vec(0, 0);
    this.acc = ex.vec(0, 0);
  }

  override onCollisionStart(_self: ex.Collider, other: ex.Collider): void {
    if (other.owner instanceof Pipe) {
      this.level.triggerGameOver();
    }
  }
}
