import { Alignment, Eskimo } from './eskimo';
import { Config } from '@/config';
import { Level } from '@/scenes/level';
import * as ex from 'excalibur';

export class EskimoFactory {
  private timer: ex.Timer;
  private totalElapsed = 0;

  constructor(private level: Level, private random: ex.Random) {
    this.timer = new ex.Timer({
      interval: Config.EskimoFactory.MaxCreationInterval,
      repeats: true,
      action: () => this.spawnSeals(),
    });
    this.level.add(this.timer);
  }

  public update(delta: number) {
    this.totalElapsed += delta;

    // Ramp from max to min in 5 minutes
    const rampDurationMs = 300000;
    const fraction = Math.min(this.totalElapsed / rampDurationMs, 1);

    const maxInterval = Config.EskimoFactory.MaxCreationInterval;
    const minInterval = Config.EskimoFactory.MinCreationInterval;

    // Linear interpolation from maxInterval to minInterval
    const newInterval = maxInterval - fraction * (maxInterval - minInterval);

    // Update the timer’s interval
    this.timer.interval = newInterval;
  }

  spawnSeals() {
    const drawWidth = this.level.engine.screen.drawWidth; // screen width
    const drawHeight = this.level.engine.screen.drawHeight; // screen height

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

    // Compute eskimo velocity based on the current timer interval.
    // The fraction (0 to 1) of how far we've progressed:
    const fraction =
      (Config.EskimoFactory.MaxCreationInterval - this.timer.interval) /
      (Config.EskimoFactory.MaxCreationInterval -
        Config.EskimoFactory.MinCreationInterval);

    const sealVelocity =
      Config.EskimoFactory.MinEskimoCreatedVelocity +
      fraction *
        (Config.EskimoFactory.MaxEskimoCreatedVelocity -
          Config.EskimoFactory.MinEskimoCreatedVelocity);

    // Create a single Eskimo at the random perimeter position
    const spawnPos = ex.vec(x, y);
    const eskimo = new Eskimo(this.level, spawnPos, alignment, sealVelocity);
    this.level.add(eskimo);
  }

  start() {
    this.timer.start();
  }

  reset() {
    for (const actor of this.level.actors) {
      if (actor instanceof Eskimo) {
        actor.kill();
      }
    }
    this.timer.reset(Config.EskimoFactory.MaxCreationInterval);
  }

  stop() {
    this.timer.stop();
    for (const actor of this.level.actors) {
      if (actor instanceof Eskimo) {
        // Remove all the eskimos on stop
        actor.kill();
      }
    }
  }
}
