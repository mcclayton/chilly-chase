import * as ex from 'excalibur';

export class ScorePopup extends ex.Actor {
  constructor(pos: ex.Vector, points: number) {
    super({ pos, z: 5 });

    // Create a text graphic for the popup
    const label = new ex.Text({
      text: `+${points}`,
      color: ex.Color.Red,
      font: new ex.Font({
        family: `"Jacquarda Bastarda 9", serif`,
        size: 20,
        color: ex.Color.Red,
        textAlign: ex.TextAlign.Center,
      }),
    });

    // Use the label graphic
    this.graphics.use(label);
  }

  override onInitialize(engine: ex.Engine): void {
    // Animate: move upward 30 pixels and fade out to 0 opacity over 1 second,
    // then remove this actor.
    this.actions
      .moveBy(ex.vec(0, -30), 100)
      .fade(0, 200)
      .callMethod(() => this.kill());
  }
}
