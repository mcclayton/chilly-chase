import { Alignment, Seal } from './seal';
import { Config } from '@/config';
import { Game } from '@/scenes/game';
import * as ex from 'excalibur';

export class SealFactory {
  private timer: ex.Timer;
  private totalElapsed = 0;

  constructor(private game: Game, private random: ex.Random) {
    this.timer = new ex.Timer({
      interval: Config.SealFactory.MaxCreationInterval,
      repeats: true,
      action: () => this.spawnSeals(),
    });
    this.game.add(this.timer);
  }

  public update(delta: number) {
    this.totalElapsed += delta;

    // Ramp from max to min in 5 minutes
    const rampDurationMs = 300000;
    const fraction = Math.min(this.totalElapsed / rampDurationMs, 1);

    const maxInterval = Config.SealFactory.MaxCreationInterval;
    const minInterval = Config.SealFactory.MinCreationInterval;

    // Linear interpolation from maxInterval to minInterval
    const newInterval = maxInterval - fraction * (maxInterval - minInterval);

    // Update the timer’s interval
    this.timer.interval = newInterval;
  }

  spawnSeals() {
    const drawWidth = this.game.engine.screen.drawWidth; // screen width
    const drawHeight = this.game.engine.screen.drawHeight; // screen height

    const side = this.random.integer(0, 3);

    let x = 0;
    let y = 0;
    let alignment: Alignment = 'top';

    switch (side) {
      case 0:
        alignment = 'top';
        x = this.random.floating(0, drawWidth);
        y = 0;
        break;
      case 1:
        alignment = 'right';
        x = drawWidth;
        y = this.random.floating(0, drawHeight);
        break;
      case 2:
        alignment = 'bottom';
        x = this.random.floating(0, drawWidth);
        y = drawHeight;
        break;
      case 3:
        alignment = 'left';
        x = 0;
        y = this.random.floating(0, drawHeight);
        break;
    }

    // Compute seal velocity based on the current timer interval.
    // The fraction (0 to 1) of how far we've progressed:
    const fraction =
      (Config.SealFactory.MaxCreationInterval - this.timer.interval) /
      (Config.SealFactory.MaxCreationInterval -
        Config.SealFactory.MinCreationInterval);

    const sealVelocity =
      Config.SealFactory.MinSealCreatedVelocity +
      fraction *
        (Config.SealFactory.MaxSealCreatedVelocity -
          Config.SealFactory.MinSealCreatedVelocity);

    // Create a single Seal at the random perimeter position
    const spawnPos = ex.vec(x, y);
    const seal = new Seal(this.game, spawnPos, alignment, sealVelocity);
    this.game.add(seal);
  }

  start() {
    this.timer.start();
  }

  reset() {
    for (const actor of this.game.actors) {
      if (actor instanceof Seal) {
        actor.kill();
      }
    }
    this.totalElapsed = 0;
    this.timer.reset(Config.SealFactory.MaxCreationInterval);
  }

  stop() {
    this.timer.stop();
    for (const actor of this.game.actors) {
      if (actor instanceof Seal) {
        // Remove all the seals on stop
        actor.kill();
      }
    }
  }
}
