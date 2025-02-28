import * as ex from 'excalibur';

const border = 2;

export class IceMeter extends ex.ScreenElement {
  private barWidth: number;
  private barHeight: number;
  private currentValue: number = 1; // Number between 0 and 1 where 1 = 100%

  private fillRect: ex.Rectangle;
  private backgroundRect: ex.Rectangle;

  constructor(x: number, y: number, z: number) {
    super({ x, y, z });

    this.barWidth = 200;
    this.barHeight = 20;

    this.backgroundRect = new ex.Rectangle({
      width: this.barWidth,
      height: this.barHeight,
      color: ex.Color.Black,
      strokeColor: ex.Color.White,
      lineWidth: 2,
    });

    this.fillRect = new ex.Rectangle({
      width: this.barWidth - border,
      height: this.barHeight - border,
      color: ex.Color.fromHex('#96bdf8'),
      strokeColor: ex.Color.Black,
      lineWidth: 2,
      opacity: 1,
    });

    // Label text
    const textGraphic = new ex.Text({
      text: 'Ice:',
      color: ex.Color.White,
      font: new ex.Font({
        size: 20,
        color: ex.Color.White,
        textAlign: ex.TextAlign.Left,
      }),
    });

    const group = new ex.GraphicsGroup({
      members: [
        {
          graphic: textGraphic,
          offset: ex.vec(0, 0),
        },
        {
          graphic: this.backgroundRect,
          offset: ex.vec(42 + 3 - border / 2, 0 + 3 - border / 2),
        },
        {
          graphic: this.fillRect,
          offset: ex.vec(42 + 3, 0 + 3),
        },
      ],
    });

    this.graphics.use(group);
  }

  /** Set the current fraction of the bar between 0..1 */
  public decrement(value: number) {
    this.currentValue = ex.clamp(this.currentValue - value, 0, 1);

    // Update fill rectangle width
    this.fillRect.width = this.barWidth * this.currentValue;
  }

  public increment(value: number) {
    this.currentValue = ex.clamp(this.currentValue + value, 0, 1);
    // Update fill rectangle width
    this.fillRect.width = this.barWidth * this.currentValue;
  }

  public reset() {
    this.currentValue = 1;
    // Update fill rectangle width
    this.fillRect.width = this.barWidth * this.currentValue;
  }

  public value() {
    return this.currentValue;
  }
}
