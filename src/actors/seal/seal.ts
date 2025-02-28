import { Ice } from '../ice/ice';
import { Penguin } from '../penguin/penguin';
import { ScorePopup } from '../scorePopup/scorePopup';
import { Snowball } from '../snowball/snowball';
import { Config } from '@/config';
import { Resources } from '@/resources';
import { Level } from '@/scenes/level';
import * as ex from 'excalibur';

export type Alignment = 'top' | 'bottom' | 'left' | 'right';

export class Seal extends ex.Actor {
  private freezeTime = 0; // Number of seconds remaining to unfreeze

  constructor(
    private level: Level,
    pos: ex.Vector,
    public alignment: Alignment,
    public speed: number = Config.Seal.Velocity,
  ) {
    super({
      pos,
      width: 16,
      height: 16,
      color: ex.Color.Red,
      z: 1,
    });

    this.on('exitviewport', () => this.kill());
  }

  override onInitialize(engine: ex.Engine): void {
    this.initSprites();
  }

  override onPostUpdate(engine: ex.Engine, delta: number): void {
    const dt = delta / 1000;

    if (this.isFrozen()) {
      this.freezeTime -= dt;
      this.updateFrozenAnimation();
      // No chasing logic while frozen
      return;
    }

    // Otherwise, chase the player
    const direction = this.level.player.pos.sub(this.pos);
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
        const points = 25;
        const popup = new ScorePopup(this.pos.clone(), points);
        this.level.add(popup);
        this.level.scoreTracker.increment(points);
      } else {
        const points = 10;
        const popup = new ScorePopup(this.pos.clone(), points);
        this.level.add(popup);
        this.level.scoreTracker.increment(points);
      }
      this.kill();
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
    const spriteSheet = ex.SpriteSheet.fromImageSource({
      image: Resources.Seal,
      grid: {
        rows: 2,
        columns: 2,
        spriteWidth: 16,
        spriteHeight: 16,
      },
    });

    const frozenSealSheet = ex.SpriteSheet.fromImageSource({
      image: Resources.FrozenSeal,
      grid: {
        rows: 2,
        columns: 1,
        spriteWidth: 16,
        spriteHeight: 16,
      },
    });

    const frozenSealDownwards = frozenSealSheet.getSprite(0, 0);
    const frozenSealUpwards = frozenSealSheet.getSprite(0, 1);

    const walkDownwardsAnimation = ex.Animation.fromSpriteSheet(
      spriteSheet,
      [0, 1],
      100,
      ex.AnimationStrategy.Loop,
    );

    const walkUpwardsAnimation = ex.Animation.fromSpriteSheet(
      spriteSheet,
      [2, 3],
      100,
      ex.AnimationStrategy.Loop,
    );

    // Register animations/frames
    this.graphics.add('walk-downwards', walkDownwardsAnimation);
    this.graphics.add('walk-upwards', walkUpwardsAnimation);
    this.graphics.add('frozen-downwards', frozenSealDownwards);
    this.graphics.add('frozen-upwards', frozenSealUpwards);

    // Default animation when actor spawns
    this.graphics.use('walk-downwards');
  }
}
