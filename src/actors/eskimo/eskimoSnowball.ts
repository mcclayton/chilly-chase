import { Ice } from '../ice/ice';
import { Penguin } from '../penguin/penguin';
import { Config } from '@/config';
import * as ex from 'excalibur';

export class EskimoSnowball extends ex.Actor {
  private melting = false;
  private currentRadius;
  private trajectory: ex.Vector;

  constructor(private position: ex.Vector, private player: Penguin) {
    super({
      pos: position,
      radius: Config.Snowball.Radius,
      color: ex.Color.White,
      z: 3,
    });
    this.player = player;
    this.trajectory = player.pos.sub(position);
    this.currentRadius = Config.Snowball.Radius;
  }

  override onInitialize(engine: ex.Engine): void {
    // Normalize the trajectory to get a direction
    const direction = this.trajectory.normalize();

    // TODO: Move this to config
    const initialSpeed = 400;
    this.vel = direction.scale(initialSpeed);

    // Negate the direction so acceleration is opposite of velocity
    this.acc = direction.negate().scale(Config.Snowball.Deceleration);

    engine.clock.schedule(() => {
      this.melting = true;
    }, Config.Snowball.SecondsUntilMelt * 1000);

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
      this.melt(delta);
    }
  }

  override onCollisionStart(_self: ex.Collider, other: ex.Collider): void {
    if (other.owner instanceof Penguin || other.owner instanceof Ice) {
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
        opacity: this.currentRadius / Config.Snowball.Radius,
      }),
    );

    // Kill the snowball when it's fully melted
    if (this.currentRadius <= 0) {
      this.kill();
    }
  }
}
