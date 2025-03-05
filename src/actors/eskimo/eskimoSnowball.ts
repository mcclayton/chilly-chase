import { Ice } from '../ice/ice';
import { Penguin } from '../penguin/penguin';
import { Config } from '@/config';
import { Game } from '@/scenes/game';
import * as ex from 'excalibur';

export class EskimoSnowball extends ex.Actor {
  private melting = false;
  private currentRadius;
  private trajectory: ex.Vector;
  private snowEmitter!: ex.ParticleEmitter;
  private snowExplosionEmitter!: ex.ParticleEmitter;

  constructor(private game: Game, private position: ex.Vector) {
    super({
      pos: position,
      radius: Config.EskimoSnowball.Radius,
      color: ex.Color.White,
      z: 3,
    });
    this.trajectory = game.player.pos.sub(position);
    this.currentRadius = Config.EskimoSnowball.Radius;
  }

  override onInitialize(engine: ex.Engine): void {
    // Normalize the trajectory to get a direction
    const direction = this.trajectory.normalize();

    const initialSpeed = Config.EskimoSnowball.InitialSpeed;
    this.vel = direction.scale(initialSpeed);

    // Negate the direction so acceleration is opposite of velocity
    this.acc = direction.negate().scale(Config.EskimoSnowball.Deceleration);

    engine.clock.schedule(() => {
      this.melting = true;
    }, Config.EskimoSnowball.SecondsUntilMelt * 1000);

    this.snowEmitter = new ex.ParticleEmitter({
      x: 0,
      y: 0,
      radius: 0.001,
      emitterType: ex.EmitterType.Circle, // Shape of emitter nozzle
      emitRate: 60,
      particle: {
        opacity: 0.3,
        minSize: 1,
        maxSize: 10,
        beginColor: ex.Color.White,
        endColor: ex.Color.fromHex('#96bdf8'),
        fade: true,
      },
    });
    this.addChild(this.snowEmitter);

    this.snowExplosionEmitter = new ex.ParticleEmitter({
      x: 0,
      y: 0,
      emitterType: ex.EmitterType.Circle,
      emitRate: 30,
      isEmitting: false,
      particle: {
        acc: new ex.Vector(0, 0),
        minAngle: 0,
        maxAngle: 6.2,
        minSpeed: 0.1,
        maxSpeed: 15,
        opacity: 0.8,
        minSize: 1,
        maxSize: 4,
        beginColor: ex.Color.White,
        endColor: ex.Color.fromHex('#96bdf8'),
        fade: true,
      },
    });
    this.addChild(this.snowExplosionEmitter);

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
    if (other.owner instanceof Penguin) {
      if (this.vel.magnitude > 5) {
        // Turn on the snow explosion emitter for just a moment after collision
        // Slow down the explosion for dramatic effect since this cuases the game over
        this.snowExplosionEmitter.emitRate = 30;
        this.snowExplosionEmitter.particle.acc = new ex.Vector(0, 0);
        this.snowExplosionEmitter.particle.maxSpeed = 15;
        this.snowExplosionEmitter.isEmitting = true;
        this.game.engine.clock.schedule(() => {
          this.snowExplosionEmitter.isEmitting = false;
        }, 5000);
      }
      this.stop();
    }

    if (other.owner instanceof Ice) {
      this.stop();
    }
  }

  stop() {
    this.vel = ex.Vector.Zero;
    this.acc = ex.Vector.Zero;
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
        opacity: this.currentRadius / Config.EskimoSnowball.Radius,
      }),
    );

    // Kill the snowball when it's fully melted
    if (this.currentRadius <= 0) {
      this.kill();
    }
  }
}
