import { Penguin } from '../penguin/penguin';
import { ScorePopup } from '../scorePopup/scorePopup';
import { Config } from '@/config';
import { Resources } from '@/resources';
import { Level } from '@/scenes/level';
import * as ex from 'excalibur';

export class Fish extends ex.Actor {
  // Start with a full circle (2π radians)
  private arcRemaining: number = 2 * Math.PI;
  // Duration (in seconds) for the arc to vanish completely
  private arcDuration: number = Config.Fish.DurationSeconds;

  private pointsLevel: 'max' | 'middle' | 'min' = 'max';

  constructor(private level: Level, pos: ex.Vector) {
    super({
      pos,
      width: 16,
      height: 16,
      z: 1,
      // Set anchor to center so that (0,0) is the fish's center in its local space
      anchor: ex.vec(0.5, 0.5),
    });

    this.on('exitviewport', () => this.kill());
  }

  override onInitialize(engine: ex.Engine): void {
    this.initSprites();

    // Listen for the postdraw event; the context is already transformed
    this.on('postdraw', (evt: ex.PostDrawEvent) => {
      this.drawArc(evt.ctx);
    });
  }

  override onPostUpdate(engine: ex.Engine, delta: number): void {
    const dt = delta / 1000;
    // Calculate how many radians to subtract per second so that the arc disappears after arcDuration seconds
    const reductionRate = (2 * Math.PI) / this.arcDuration;
    // Decrease the arc's sweep angle, clamping to 0
    this.arcRemaining = Math.max(this.arcRemaining - reductionRate * dt, 0);

    if (this.arcRemaining === 0) {
      this.kill();
    }
  }

  override onCollisionStart(_self: ex.Collider, other: ex.Collider): void {
    if (other.owner instanceof Penguin) {
      if (this.pointsLevel === 'max') {
        const points = 60;
        const popup = new ScorePopup(this.pos.clone(), `+${points}`, 16);
        this.level.add(popup);
        this.level.scoreTracker.increment(points);
      } else if (this.pointsLevel === 'middle') {
        const points = 30;
        const popup = new ScorePopup(this.pos.clone(), `+${points}`, 14);
        this.level.add(popup);
        this.level.scoreTracker.increment(points);
      } else {
        const points = 15;
        const popup = new ScorePopup(this.pos.clone(), `+${points}`, 10);
        this.level.add(popup);
        this.level.scoreTracker.increment(points);
      }
      this.kill();
    }
  }

  private initSprites(): void {
    const spriteSheet = ex.SpriteSheet.fromImageSource({
      image: Resources.Fishes,
      grid: {
        rows: 1,
        columns: 5,
        spriteWidth: 16,
        spriteHeight: 16,
      },
    });

    // Choose a sprite (here, the one at column index 2)
    const fishSprite = spriteSheet.getSprite(2, 0);
    this.graphics.add('fish', fishSprite);
    this.graphics.use('fish');
  }

  /**
   * Draws an arc around the fish by approximating it with line segments.
   * Assumes the context is already transformed so that (0,0) is the actor's center.
   */
  private drawArc(ctx: ex.ExcaliburGraphicsContext): void {
    ctx.save();

    // In the actor's local space, (0,0) is the center because of our anchor.
    const radius = Math.max(this.width + 4, this.height + 4) / 2 + 2;
    const startAngle = -Math.PI / 2; // Start at the top of the circle
    const endAngle = startAngle + this.arcRemaining;

    // Use a fixed number of segments to approximate the arc
    const segments = 30;
    let previousPoint = ex.vec(
      radius * Math.cos(startAngle),
      radius * Math.sin(startAngle),
    );

    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const angle = startAngle + t * (endAngle - startAngle);
      const currentPoint = ex.vec(
        radius * Math.cos(angle),
        radius * Math.sin(angle),
      );

      // Greater than 2/3
      if (this.arcRemaining > (4 * Math.PI) / 3) {
        this.pointsLevel = 'max';
        ctx.drawLine(previousPoint, currentPoint, ex.Color.Blue, 2);
      } else if (this.arcRemaining >= (2 * Math.PI) / 3) {
        // Greater than 1/3
        this.pointsLevel = 'middle';
        ctx.drawLine(previousPoint, currentPoint, ex.Color.Orange, 2);
      } else {
        this.pointsLevel = 'min';
        ctx.drawLine(previousPoint, currentPoint, ex.Color.Red, 2);
      }

      // Draw a line segment from the previous point to the current point
      // ctx.drawLine(previousPoint, currentPoint, ex.Color.Yellow, 2);
      previousPoint = currentPoint;
    }

    ctx.restore();
  }
}
