import { Penguin } from '../penguin/penguin';
import { Resources } from '@/resources';
import { Level } from '@/scenes/level';
import * as ex from 'excalibur';

export class Ice extends ex.Actor {
  private melting = false;
  private currentHeight = 12;
  private iceBlockSprite!: ex.Sprite;

  constructor(private level: Level) {
    super({
      pos: level.player.pos,
      width: 12,
      height: 12,
      z: 1,
    });
    this.currentHeight = 12;
  }

  override onInitialize(engine: ex.Engine): void {
    const iceBlock = Resources.IceBlock.toSprite();
    iceBlock.height = 16;
    iceBlock.width = 16;
    iceBlock.opacity = 0.2;
    this.iceBlockSprite = iceBlock;
    this.graphics.use(this.iceBlockSprite);

    engine.clock.schedule(() => {
      this.melting = true;
    }, 5000);

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

  private melt(delta: number) {
    // Delta is the elapsed time in ms since the last frame
    const deltaSeconds = delta / 1000;

    const shrinkRate = 5; // px per second

    // Decrement the radius by shrinkRate * time
    this.currentHeight -= ex.clamp(shrinkRate * deltaSeconds, 0, 16);

    // Update the collider shape
    this.collider.useBoxCollider(12, this.currentHeight);
    this.iceBlockSprite.height = this.currentHeight;
    this.graphics.use(this.iceBlockSprite);

    // Kill the snowball when it's fully melted
    if (this.currentHeight <= 0) {
      this.kill();
    }
  }
}
