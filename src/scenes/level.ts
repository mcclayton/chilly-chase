import { Penguin } from '../actors/penguin/penguin';
import { Pipe } from '../actors/pipe/pipe';
import { PipeFactory } from '../actors/pipe/pipe-factory';
import { Config } from '../config';
import { IceMeter } from '@/screenElements/iceMeter/iceMeter';
import * as ex from 'excalibur';

export class Level extends ex.Scene {
  random = new ex.Random();
  pipeFactory = new PipeFactory(this, this.random, Config.PipeInterval);
  penguin = new Penguin(this);
  score: number = 0;
  best: number = 0;
  iceMeter!: IceMeter;

  startGameLabel = new ex.Label({
    text: 'Click to Start',
    x: 200,
    y: 200,
    z: 3,
    font: new ex.Font({
      size: 30,
      color: ex.Color.White,
      textAlign: ex.TextAlign.Center,
    }),
  });

  scoreLabel = new ex.Label({
    text: 'Score: 0',
    x: 0,
    y: 0,
    z: 1,
    font: new ex.Font({
      size: 20,
      color: ex.Color.White,
    }),
  });

  bestLabel = new ex.Label({
    text: 'Best: 0',
    x: 200,
    y: 0,
    z: 1,
    font: new ex.Font({
      size: 20,
      color: ex.Color.White,
      textAlign: ex.TextAlign.End,
    }),
  });

  override onInitialize(engine: ex.Engine): void {
    this.add(this.penguin);
    this.showStartInstructions();

    const iceMeter = new IceMeter(300, 0);
    this.iceMeter = iceMeter;
    this.add(iceMeter);

    this.add(this.scoreLabel);
    this.add(this.bestLabel);
    this.add(this.startGameLabel);
    const bestScore = localStorage.getItem('bestScore');
    if (bestScore) {
      this.best = +bestScore;
      this.setBestScore(this.best);
    } else {
      this.setBestScore(0);
    }
  }

  showStartInstructions() {
    this.startGameLabel.graphics.isVisible = true;
    this.engine.input.pointers.once('down', () => {
      this.reset();
      this.startGameLabel.graphics.isVisible = false;
      this.penguin.start();
    });
  }

  reset() {
    this.penguin.reset();
    this.pipeFactory.reset();
    this.score = 0;
    this.scoreLabel.text = `Score: ${this.score}`;
  }

  triggerGameOver() {
    this.pipeFactory.stop();
    this.penguin.stop();
    this.showStartInstructions();
  }

  incrementScore() {
    this.scoreLabel.text = `Score: ${++this.score}`;
    this.setBestScore(this.score);
  }

  getIceMeter() {
    return this.iceMeter;
  }

  setBestScore(score: number) {
    if (score > this.best) {
      localStorage.setItem('bestScore', this.score.toString());
      this.best = score;
    }
    this.bestLabel.text = `Best: ${this.best}`;
  }
}
