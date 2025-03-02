import { Penguin } from '../actors/penguin/penguin';
import { EskimoFactory } from '@/actors/eskimo/eskimoFactory';
import { FishFactory } from '@/actors/fish/fishFactory';
import { SealFactory } from '@/actors/seal/sealFactory';
import { Config } from '@/config';
import { Resources } from '@/resources';
import { IceMeter } from '@/screenElements/iceMeter/iceMeter';
import { ScoreTracker } from '@/screenElements/scoreTracker/scoreTracker';
import { TiledBackground } from '@/screenElements/tileBackground/tiledBackground';
import * as ex from 'excalibur';

const OVERLAY_Z = 100;

export class Game extends ex.Scene {
  random = new ex.Random();
  sealFactory = new SealFactory(this, this.random);
  eskimoFactory = new EskimoFactory(this, this.random);
  fishFactory = new FishFactory(this, this.random);
  player = new Penguin(this);
  best: number = 0;
  iceMeter!: IceMeter;
  scoreTracker!: ScoreTracker;
  gameState: 'paused' | 'playing' | 'stopped' = 'playing';

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

  newHighScore = new ex.Label({
    text: 'New High Score',
    x: 348,
    y: 270,
    z: OVERLAY_Z,
    font: new ex.Font({
      family: 'Impact',
      size: 16,
      color: ex.Color.White,
      textAlign: ex.TextAlign.Center,
    }),
  });

  override onInitialize(engine: ex.Engine): void {
    const background = new TiledBackground(engine);
    this.add(background);

    this.add(this.player);

    // Start the game:

    this.scoreTracker = new ScoreTracker(25, 0, OVERLAY_Z);

    const iceMeter = new IceMeter(425, 0, OVERLAY_Z);
    this.iceMeter = iceMeter;
    this.add(iceMeter);

    this.add(this.scoreTracker);
    this.add(this.bestLabel);
    this.add(this.gameOverLabel);
    this.add(this.gameOverSubLabel);
    this.add(this.newHighScore);
    this.gameOverLabel.graphics.isVisible = false;
    this.gameOverSubLabel.graphics.isVisible = false;
    this.newHighScore.graphics.isVisible = false;

    const bestScore = localStorage.getItem('bestScore');
    if (bestScore) {
      this.best = +bestScore;
      this.setBestScore(this.best);
    } else {
      this.setBestScore(0);
    }

    // Start the game
    this.reset();
    this.start();
  }

  override onActivate(): void {
    Resources.BackgroundMusic.loop = true;
    Resources.BackgroundMusic.playbackRate =
      Config.BackgroundMusic.InitialPlaybackSpeed;
    Resources.BackgroundMusic.play(Config.BackgroundMusic.DefaultVolume);
  }

  override onDeactivate(): void {
    Resources.BackgroundMusic.stop();
  }

  override onPostUpdate(engine: ex.Engine, delta: number): void {
    this.sealFactory.update(delta);
    this.eskimoFactory.update(delta);

    // Gradually increase playback rate of background music
    if (this.gameState === 'playing') {
      const totalTime = 100000;
      const rateIncrement = 0.4 / totalTime;
      if (Resources.BackgroundMusic.playbackRate < 1) {
        Resources.BackgroundMusic.playbackRate = Math.min(
          1,
          Resources.BackgroundMusic.playbackRate + rateIncrement * delta,
        );
      }
    }

    if (engine.input.keyboard.isHeld(ex.Keys.Esc)) {
      this.gameState = 'paused';
      Resources.BackgroundMusic.pause();
      alert('The game has been paused.');
      Resources.BackgroundMusic.play();
    }
  }

  showGameOver() {
    Resources.BackgroundMusic.volume = Config.BackgroundMusic.GameOverVolume;
    Resources.BackgroundMusic.playbackRate =
      Config.BackgroundMusic.InitialPlaybackSpeed;

    this.gameOverLabel.graphics.isVisible = true;
    this.gameOverSubLabel.graphics.isVisible = true;

    // Update best score on game over
    if (this.best < this.scoreTracker.score) {
      this.setBestScore(this.scoreTracker.score);
      this.newHighScore.text = `——————————————————————\nNew High Score\n⭐️ ${this.scoreTracker.score} ⭐️`;
      this.newHighScore.graphics.isVisible = true;
    }

    this.engine.input.pointers.once('down', () => {
      this.reset();
      this.newHighScore.graphics.isVisible = false;
      this.gameOverLabel.graphics.isVisible = false;
      this.gameOverSubLabel.graphics.isVisible = false;
      this.start();
    });
  }

  reset() {
    Resources.BackgroundMusic.volume = Config.BackgroundMusic.DefaultVolume;
    Resources.BackgroundMusic.playbackRate =
      Config.BackgroundMusic.InitialPlaybackSpeed;
    this.player.reset();
    this.sealFactory.reset();
    this.eskimoFactory.reset();
    this.iceMeter.reset();
    this.scoreTracker.reset();
  }

  start() {
    this.sealFactory.start();
    this.eskimoFactory.start();
    this.fishFactory.start();
    this.player.start();
    this.gameState = 'playing';
  }

  stop() {
    this.sealFactory.stop();
    this.eskimoFactory.stop();
    this.fishFactory.stop();
    this.player.stop();
    this.gameState = 'stopped';
  }

  triggerGameOver() {
    this.stop();
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
    this.bestLabel.text = `Best: ${this.best.toLocaleString('en-US')}`;
  }
}
