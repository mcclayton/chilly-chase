import { Ice } from '../ice/ice';
import { Penguin } from '../penguin/penguin';
import { Pipe } from '@/actors/pipe/pipe';
import { Config } from '@/config';
import { Resources } from '@/resources';
import { Level } from '@/scenes/level';
import * as ex from 'excalibur';

export class Snowball extends ex.Actor {
  private melting = false;
  private currentRadius;

  constructor(private player: Penguin, private trajectory: ex.Vector) {
    super({
      pos: player.pos.add(new ex.Vector(0, -5)),
      radius: Config.Snowball.Radius,
      color: ex.Color.White,
    });
    this.player = player;
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
    if (other.owner instanceof Ice) {
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
