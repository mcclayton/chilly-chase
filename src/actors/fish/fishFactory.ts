import { Fish } from './fish';
import { Config } from '@/config';
import { Game } from '@/scenes/game';
import * as ex from 'excalibur';

export class FishFactory {
  private timer: ex.Timer;

  constructor(private game: Game, private random: ex.Random) {
    this.timer = new ex.Timer({
      interval: Config.FishFactory.CreationInterval,
      repeats: true,
      action: () => this.spawnFish(),
    });
    this.game.add(this.timer);
  }

  spawnFish() {
    const drawWidth = this.game.engine.screen.drawWidth; // screen width
    const drawHeight = this.game.engine.screen.drawHeight; // screen height
    // Ensure we don't create fish too close to the edges of the screen
    const borderBuffer = 80;

    const x = this.random.floating(0, drawWidth - borderBuffer);
    const y = this.random.floating(0, drawHeight - borderBuffer);

    // Create a single Fish at the random position
    // TODO: space away from player
    const spawnPos = ex.vec(x + borderBuffer / 2, y + borderBuffer / 2);
    const fish = new Fish(this.game, spawnPos);
    this.game.add(fish);
  }

  start() {
    this.timer.start();
  }

  reset() {
    for (const actor of this.game.actors) {
      if (actor instanceof Fish) {
        actor.kill();
      }
    }
    this.timer.reset(Config.FishFactory.CreationInterval);
  }

  stop() {
    this.timer.stop();
    for (const actor of this.game.actors) {
      if (actor instanceof Fish) {
        // Remove all the fish on stop
        actor.kill();
      }
    }
  }
}
