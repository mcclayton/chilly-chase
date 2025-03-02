import { Eskimo } from '../eskimo/eskimo';
import { EskimoSnowball } from '../eskimo/eskimoSnowball';
import { Ice } from '../ice/ice';
import { Seal } from '../seal/seal';
import { Snowball } from '../snowball/snowball';
import { Config } from '@/config';
import { Resources } from '@/resources';
import { Game } from '@/scenes/game';
import * as ex from 'excalibur';

export class Penguin extends ex.Actor {
  walkAnimation!: ex.Animation;
  startSprite!: ex.Sprite;
  private timeSinceLastIce = 0;
  private timeSinceSpacePress = 0;
  private iceCrackling = false;

  constructor(private game: Game) {
    super({
      pos: Config.Player.StartPos,
      radius: 8,
      z: 2,
    });
    this.game = game;
  }

  override onInitialize(engine: ex.Engine): void {
    engine.input.pointers.primary.on('down', (evt) => {
      Resources.SnowballThrow.playbackRate = Math.random() * 0.3 + 0.7;
      Resources.SnowballThrow.play(1);
      const snowball = new Snowball(this.game, evt.worldPos.sub(this.pos));
      this.game.add(snowball);
    });

    this.initSprites();
    this.on('exitviewport', () => {
      this.game.triggerGameOver();
    });
  }

  override onPostUpdate(engine: ex.Engine, delta: number): void {
    if (this.game.gameState !== 'playing') return;

    // Accumulate time since last ice creation
    const deltaSeconds = delta / 1000;
    this.timeSinceLastIce += deltaSeconds;

    // Spacebar
    if (engine.input.keyboard.isHeld(ex.Keys.Space) && this.hasIceInMeter()) {
      this.timeSinceLastIce += deltaSeconds;
      this.timeSinceSpacePress = 0; // reset refill idle timer

      if (!this.iceCrackling) {
        Resources.IceCrackling.loop = true;
        Resources.IceCrackling.playbackRate = 0.7;
        Resources.IceCrackling.play(0.1);
        this.iceCrackling = true;
      }

      // If it's time to drop ice
      if (this.timeSinceLastIce >= 0.05) {
        this.dropIceBlock();
      }
    } else {
      if (this.iceCrackling) {
        Resources.IceCrackling.stop();
        this.iceCrackling = false;
      }

      // If spacebar NOT held or there is no ice in meter, accumulate idle time
      this.timeSinceSpacePress += deltaSeconds;

      // Once idle time passes 5s, start refilling the meter
      if (this.timeSinceSpacePress > Config.IceMeter.RefillAfterIdleSeconds) {
        const iceMeter = this.game.getIceMeter();
        if (iceMeter.value() < 1) {
          // Refill some portion each *frame*
          iceMeter.increment(Config.IceMeter.RefillRate * deltaSeconds);
        }
      }
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
    this.pos = Config.Player.StartPos; // starting position
    this.acc = ex.vec(0, 0); // pixels per second per second
  }

  reset() {
    this.pos = Config.Player.StartPos; // starting position

    // Remove all ice blocks that have been dropped
    for (const actor of this.game.actors) {
      if (actor instanceof Ice) {
        actor.kill();
      }
    }

    this.stop();
  }

  stop() {
    this.vel = ex.vec(0, 0);
    this.acc = ex.vec(0, 0);
  }

  private hasIceInMeter() {
    const iceMeter = this.game.getIceMeter();
    return iceMeter.value() > 0;
  }

  private dropIceBlock() {
    const iceMeter = this.game.getIceMeter();

    if (this.hasIceInMeter()) {
      const iceBlock = new Ice(this.game);
      this.game.add(iceBlock);
      // Reset ice timer
      this.timeSinceLastIce = 0;
      iceMeter.decrement(0.01);
    }
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
    if (
      other.owner instanceof EskimoSnowball &&
      other.owner.vel !== ex.Vector.Zero
    ) {
      this.graphics.use('fainted');
      this.game.triggerGameOver();
    }

    if (other.owner instanceof Seal || other.owner instanceof Eskimo) {
      this.graphics.use('fainted');
      this.game.triggerGameOver();
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

    const faintedSprite = Resources.PenguinFaint.toSprite();
    faintedSprite.width = 64;
    faintedSprite.height = 64;

    // Register
    this.graphics.add('fainted', faintedSprite);
    this.graphics.add('walk', this.walkAnimation);
    this.graphics.add('start', this.startSprite);
    this.graphics.use('start');
  }
}
