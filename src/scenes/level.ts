import { Penguin } from '../actors/penguin/penguin';
import { FishFactory } from '@/actors/fish/fishFactory';
import { SealFactory } from '@/actors/seal/sealFactory';
import { IceMeter } from '@/screenElements/iceMeter/iceMeter';
import { ScoreTracker } from '@/screenElements/scoreTracker/scoreTracker';
import { TiledBackground } from '@/screenElements/tileBackground/tiledBackground';
import * as ex from 'excalibur';

const OVERLAY_Z = 100;

export class Level extends ex.Scene {
  random = new ex.Random();
  sealFactory = new SealFactory(this, this.random);
  fishFactory = new FishFactory(this, this.random);
  player = new Penguin(this);
  best: number = 0;
  iceMeter!: IceMeter;
  scoreTracker!: ScoreTracker;

  gameOverLabel = new ex.Label({
    text: 'Game Over',
    x: 350,
    y: 200,
    z: OVERLAY_Z,
    font: new ex.Font({
      family: 'Impact',
      size: 30,
      color: ex.Color.Red,
      textAlign: ex.TextAlign.Center,
    }),
  });
  gameOverSubLabel = new ex.Label({
    text: 'Click to start a new game',
    x: 348,
    y: 250,
    z: OVERLAY_Z,
    font: new ex.Font({
      family: 'Impact',
      size: 15,
      color: ex.Color.White,
      textAlign: ex.TextAlign.Center,
    }),
  });

  startGameLabel = new ex.Label({
    text: 'Click to Start',
    x: 350,
    y: 200,
    z: OVERLAY_Z,
    font: new ex.Font({
      family: 'Impact',
      size: 30,
      color: ex.Color.White,
      textAlign: ex.TextAlign.Center,
    }),
  });

  bestLabel = new ex.Label({
    text: 'Best: 0',
    x: 325,
    y: 0,
    z: OVERLAY_Z,
    font: new ex.Font({
      size: 20,
      color: ex.Color.White,
      textAlign: ex.TextAlign.End,
    }),
  });

  override onInitialize(engine: ex.Engine): void {
    const background = new TiledBackground(engine);
    this.add(background);

    this.add(this.player);
    this.showStartInstructions();

    this.scoreTracker = new ScoreTracker(25, 0, OVERLAY_Z);

    const iceMeter = new IceMeter(425, 0, OVERLAY_Z);
    this.iceMeter = iceMeter;
    this.add(iceMeter);

    this.add(this.scoreTracker);
    this.add(this.bestLabel);
    this.add(this.startGameLabel);
    this.add(this.gameOverLabel);
    this.add(this.gameOverSubLabel);
    this.gameOverLabel.graphics.isVisible = false;
    this.gameOverSubLabel.graphics.isVisible = false;

    const bestScore = localStorage.getItem('bestScore');
    if (bestScore) {
      this.best = +bestScore;
      this.setBestScore(this.best);
    } else {
      this.setBestScore(0);
    }
  }

  override onPostUpdate(engine: ex.Engine, delta: number): void {
    this.sealFactory.update(delta);
  }

  showStartInstructions() {
    this.startGameLabel.graphics.isVisible = true;
    this.engine.input.pointers.once('down', () => {
      this.reset();
      this.startGameLabel.graphics.isVisible = false;
      this.sealFactory.start();
      this.fishFactory.start();
      this.player.start();
    });
  }

  showGameOver() {
    this.gameOverLabel.graphics.isVisible = true;
    this.gameOverSubLabel.graphics.isVisible = true;
    this.engine.input.pointers.once('down', () => {
      this.reset();
      this.gameOverLabel.graphics.isVisible = false;
      this.gameOverSubLabel.graphics.isVisible = false;
      this.sealFactory.start();
      this.fishFactory.start();
      this.player.start();
    });
  }

  reset() {
    this.player.reset();
    this.sealFactory.reset();
    this.iceMeter.reset();
    this.scoreTracker.reset();
  }

  triggerGameOver() {
    this.sealFactory.stop();
    this.fishFactory.stop();
    this.player.stop();
    this.showGameOver();
  }

  getIceMeter() {
    return this.iceMeter;
  }

  setBestScore(score: number) {
    if (score > this.best) {
      localStorage.setItem('bestScore', this.scoreTracker.score.toString());
      this.best = score;
    }
    this.bestLabel.text = `Best: ${this.best}`;
  }
}
