import { Eskimo } from '../eskimo/eskimo';
import { Seal } from '../seal/seal';
import { Config } from '@/config';
import { Game } from '@/scenes/game';
import * as ex from 'excalibur';

export class Snowball extends ex.Actor {
  private melting = false;
  private currentRadius;
  private snowEmitter!: ex.ParticleEmitter;
  private snowExplosionEmitter!: ex.ParticleEmitter;

  constructor(private game: Game, private trajectory: ex.Vector) {
    const player = game.player;
    super({
      pos: player.pos.add(new ex.Vector(0, -5)),
      radius: Config.Snowball.Radius,
      color: ex.Color.White,
      z: 3,
    });
    this.trajectory = trajectory;
    this.currentRadius = Config.Snowball.Radius;
  }

  override onInitialize(engine: ex.Engine): void {
    // Normalize the trajectory to get a direction
    const direction = this.trajectory.normalize();

    const initialSpeed = Config.Snowball.InitialSpeed;
    this.vel = direction.scale(initialSpeed);

    // Negate the direction so acceleration is opposite of velocity
    this.acc = direction.negate().scale(Config.Snowball.Deceleration);

    engine.clock.schedule(() => {
      this.melting = true;
    }, Config.Snowball.SecondsUntilMelt * 1000);

    this.snowExplosionEmitter = new ex.ParticleEmitter({
      x: 0,
      y: 0,
      emitterType: ex.EmitterType.Circle,
      emitRate: 300,
      isEmitting: false,
      particle: {
        acc: new ex.Vector(0, 20),
        minAngle: 0,
        maxAngle: 6.2,
        minSpeed: 1,
        maxSpeed: 30,
        opacity: 0.8,
        minSize: 1,
        maxSize: 4,
        beginColor: ex.Color.White,
        endColor: ex.Color.fromHex('#96bdf8'),
        fade: true,
      },
    });
    this.addChild(this.snowExplosionEmitter);

    this.snowEmitter = new ex.ParticleEmitter({
      x: 0,
      y: 0,
      radius: 0.001,
      emitterType: ex.EmitterType.Circle,
      emitRate: 60,
      isEmitting: true,
      particle: {
        opacity: 0.4,
        minSize: 1,
        maxSize: 10,
        beginColor: ex.Color.White,
        endColor: ex.Color.fromHex('#96bdf8'),
        fade: true,
      },
    });
    this.addChild(this.snowEmitter);

    this.on('exitviewport', () => {
      this.kill();
    });
  }

  override onPostUpdate(engine: ex.Engine, delta: number): void {
    // 3. If the snowball slows down too much or reverses direction, clamp it to zero
    // Dot product approach: if velocity and acceleration point in *the same* direction,
    // it means we've overshot and started going backward, so we can clamp to zero.
    if (this.vel.dot(this.acc) > 0) {
      // This means velocity is reversing or is about to. Clamp to zero:
      this.vel = ex.Vector.Zero;
      this.acc = ex.Vector.Zero;
    }

    if (this.melting) {
      this.snowEmitter.isEmitting = false;
      this.melt(delta);
    }
  }

  override onCollisionStart(_self: ex.Collider, other: ex.Collider): void {
    if (other.owner instanceof Seal || other.owner instanceof Eskimo) {
      // Turn on the snow explosion emitter for just a moment after collision
      this.snowExplosionEmitter.isEmitting = true;
      this.game.engine.clock.schedule(() => {
        this.snowExplosionEmitter.isEmitting = false;
      }, 60);

      this.stop();
    }
  }

  stop() {
    this.vel = ex.vec(0, 0);
    this.acc = ex.vec(0, 0);
    this.melting = true;
  }

  private melt(delta: number) {
    // Delta is the elapsed time in ms since the last frame
    const deltaSeconds = delta / 1000;

    const shrinkRate = 3; // px per second

    // Decrement the radius by shrinkRate * time
    this.currentRadius -= shrinkRate * deltaSeconds;

    // Update the collider shape radius
    this.collider.useCircleCollider(this.currentRadius);
    this.graphics.use(
      new ex.Circle({
        radius: this.currentRadius,
        color: ex.Color.White,
        opacity: this.currentRadius / Config.Snowball.Radius,
      }),
    );

    // Kill the snowball when it's fully melted
    if (this.currentRadius <= 0) {
      this.kill();
    }
  }
}
