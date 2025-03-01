import { Ice } from '../ice/ice';
import { ScorePopup } from '../scorePopup/scorePopup';
import { Snowball } from '../snowball/snowball';
import { EskimoSnowball } from './eskimoSnowball';
import { Config } from '@/config';
import { Resources } from '@/resources';
import { Game } from '@/scenes/game';
import * as ex from 'excalibur';

export type Alignment = 'top' | 'bottom' | 'left' | 'right';

export class Eskimo extends ex.Actor {
  private freezeTime = 0; // Number of seconds remaining to unfreeze
  private timeSinceLastEskimoSnowball = 0;

  constructor(
    private game: Game,
    pos: ex.Vector,
    public alignment: Alignment,
    // TODO: Use eskimo speed
    public speed: number = Config.Seal.Velocity,
  ) {
    super({
      pos,
      width: 16,
      height: 16,
      z: 1,
    });

    this.on('exitviewport', () => this.kill());
  }

  override onInitialize(engine: ex.Engine): void {
    this.initSprites();
  }

  override onPostUpdate(engine: ex.Engine, delta: number): void {
    const dt = delta / 1000;

    this.timeSinceLastEskimoSnowball += dt;

    if (this.timeSinceLastEskimoSnowball > 3 && !this.isFrozen()) {
      const snowball = new EskimoSnowball(this.pos.clone(), this.game.player);
      this.game.add(snowball);
      this.timeSinceLastEskimoSnowball = 0;
    }

    if (this.isFrozen()) {
      this.freezeTime -= dt;
      this.updateFrozenAnimation();
      // No chasing logic while frozen
      return;
    }

    // Otherwise, chase the player
    const direction = this.game.player.pos.sub(this.pos);
    if (direction.magnitude > 0.0001) {
      // Move toward the player
      this.vel = direction.normalize().scale(this.speed);
      this.updateWalkAnimation();
    } else {
      // If seal is basically on top of the player
      this.vel = ex.Vector.Zero;
    }
  }

  override onCollisionStart(_self: ex.Collider, other: ex.Collider): void {
    if (other.owner instanceof Snowball) {
      if (this.isFrozen()) {
        const points = 40;
        const popup = new ScorePopup(this.pos.clone(), points);
        this.game.add(popup);
        this.game.scoreTracker.increment(points);
        this.kill();
      }
    }

    if (other.owner instanceof Ice) {
      const normal = this.pos.sub(other.owner.pos).normalize();
      const bounceFactor = 0.5;
      this.vel = this.reflect(this.vel, normal).scale(bounceFactor);

      // Freeze the seal
      this.freezeTime = Config.Seal.FreezeTimeSeconds;
      this.updateFrozenAnimation();
    }
  }

  private isFrozen(): boolean {
    return this.freezeTime > 0;
  }

  private isMovingUp(): boolean {
    // Negative y-velocity means it's moving upwards
    return this.vel.y < 0;
  }

  private updateWalkAnimation(): void {
    // Decide walk-up vs. walk-down
    if (this.isMovingUp()) {
      this.graphics.use('walk-upwards');
    } else {
      this.graphics.use('walk-downwards');
    }
  }

  private updateFrozenAnimation(): void {
    // Since we freeze on bounce off of an ice block
    // we invert the logic here
    if (!this.isMovingUp()) {
      this.graphics.use('frozen-upwards');
    } else {
      this.graphics.use('frozen-downwards');
    }
  }

  private reflect(incident: ex.Vector, normal: ex.Vector): ex.Vector {
    // Reflection formula: R = V - 2 * (V dot N) * N
    const n = normal.normalize();
    const dot = incident.dot(n);
    return incident.sub(n.scale(2 * dot));
  }

  private initSprites() {
    const downardsSpriteSheet = ex.SpriteSheet.fromImageSource({
      image: Resources.EskimoDownwards,
      grid: {
        rows: 2,
        columns: 2,
        spriteWidth: 17,
        spriteHeight: 17,
      },
    });

    const upwardsSpriteSheet = ex.SpriteSheet.fromImageSource({
      image: Resources.EskimoUpwards,
      grid: {
        rows: 2,
        columns: 2,
        spriteWidth: 17,
        spriteHeight: 17,
      },
    });

    const walkDownwardsAnimation = ex.Animation.fromSpriteSheet(
      downardsSpriteSheet,
      [0, 1, 2, 3],
      150,
      ex.AnimationStrategy.Loop,
    );
    const walkUpwardsAnimation = ex.Animation.fromSpriteSheet(
      upwardsSpriteSheet,
      [0, 1, 2, 3],
      150,
      ex.AnimationStrategy.Loop,
    );

    const frozenDownwards = Resources.EskimoFrozenDownwards.toSprite({
      height: 17,
      width: 17,
    });

    const frozenUpwards = Resources.EskimoFrozenUpwards.toSprite({
      height: 17,
      width: 17,
    });

    // Register animations/frames
    this.graphics.add('walk-downwards', walkDownwardsAnimation);
    this.graphics.add('walk-upwards', walkUpwardsAnimation);
    this.graphics.add('frozen-downwards', frozenDownwards);
    this.graphics.add('frozen-upwards', frozenUpwards);

    // Default animation when actor spawns
    this.graphics.use('walk-downwards');
  }
}
