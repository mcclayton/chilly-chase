import * as ex from 'excalibur';

export class ScoreTracker extends ex.ScreenElement {
  score = 0;
  private scoreLabel: ex.Text;

  constructor(x: number, y: number, z: number) {
    super({ x, y, z });

    this.scoreLabel = new ex.Text({
      text: `Score: ${this.score}`,
      color: ex.Color.White,
      font: new ex.Font({
        size: 20,
        color: ex.Color.White,
        textAlign: ex.TextAlign.Left,
      }),
    });

    this.graphics.use(this.scoreLabel);
  }

  public increment(value: number) {
    this.score = ex.clamp(this.score + value, 0, Number.MAX_SAFE_INTEGER);
    this.refresh();
  }

  public decrement(value: number) {
    this.score = ex.clamp(this.score - value, 0, Number.MAX_SAFE_INTEGER);
    this.refresh();
  }

  public refresh() {
    this.scoreLabel.text = `Score: ${this.score.toLocaleString('en-US')}`;
  }

  public reset() {
    this.score = 0;
    this.refresh();
  }
}
