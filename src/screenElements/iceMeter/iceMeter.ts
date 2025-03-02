import * as ex from 'excalibur';

const border = 2;

export class IceMeter extends ex.ScreenElement {
  private barWidth: number;
  private barHeight: number;
  private currentValue: number = 1; // Number between 0 and 1 where 1 = 100%

  private fillRect: ex.Rectangle;
  private topFillLine: ex.Rectangle;
  private bottomFillLine: ex.Rectangle;
  private backgroundRect: ex.Rectangle;

  constructor(x: number, y: number, z: number) {
    super({ x, y, z });

    this.barWidth = 200;
    this.barHeight = 20;

    this.backgroundRect = new ex.Rectangle({
      width: this.barWidth,
      height: this.barHeight,
      color: ex.Color.fromHex('#082b90'),
      strokeColor: ex.Color.fromHex('#082b90'),
      lineWidth: 3,
    });

    this.fillRect = new ex.Rectangle({
      width: this.barWidth - border,
      height: this.barHeight - border,
      color: ex.Color.fromHex('#96bdf8'),
      opacity: 1,
    });

    this.topFillLine = new ex.Rectangle({
      width: this.barWidth - border,
      height: 12,
      color: ex.Color.White,
      opacity: 0.2,
    });

    this.bottomFillLine = new ex.Rectangle({
      width: this.barWidth - border,
      height: 3,
      color: ex.Color.fromHex('#124cec'),
      opacity: 0.4,
    });

    // Label text
    const textGraphic = new ex.Text({
      text: 'Ice:',
      color: ex.Color.White,
      font: new ex.Font({
        family: `"Jacquarda Bastarda 9", serif`,
        size: 24,
        color: ex.Color.White,
        textAlign: ex.TextAlign.Left,
      }),
    });

    const SPACE_BETWEEN_TEXT_AND_METER = 55;

    const group = new ex.GraphicsGroup({
      members: [
        {
          graphic: textGraphic,
          offset: ex.vec(0, 0),
        },
        {
          graphic: this.backgroundRect,
          offset: ex.vec(
            SPACE_BETWEEN_TEXT_AND_METER + 3 - border / 2,
            0 + 3 - border / 2,
          ),
        },
        {
          graphic: this.fillRect,
          offset: ex.vec(SPACE_BETWEEN_TEXT_AND_METER + 3, 0 + 3),
        },
        {
          graphic: this.topFillLine,
          offset: ex.vec(SPACE_BETWEEN_TEXT_AND_METER + 3, 0 + 3),
        },
        {
          graphic: this.bottomFillLine,
          offset: ex.vec(SPACE_BETWEEN_TEXT_AND_METER + 3, this.barHeight - 2),
        },
      ],
    });

    this.graphics.use(group);
  }

  /** Set the current fraction of the bar between 0..1 */
  public decrement(value: number) {
    this.currentValue = ex.clamp(this.currentValue - value, 0, 1);

    // Update fill rectangle width
    const newVal = (this.barWidth - border) * this.currentValue;
    this.fillRect.width = newVal;
    this.topFillLine.width = newVal;
    this.bottomFillLine.width = newVal;
  }

  public increment(value: number) {
    this.currentValue = ex.clamp(this.currentValue + value, 0, 1);
    // Update fill rectangle width
    const newVal = (this.barWidth - border) * this.currentValue;
    this.fillRect.width = newVal;
    this.topFillLine.width = newVal;
    this.bottomFillLine.width = newVal;
  }

  public reset() {
    this.currentValue = 1;
    // Update fill rectangle width
    const newVal = (this.barWidth - border) * this.currentValue;
    this.fillRect.width = newVal;
    this.topFillLine.width = newVal;
    this.bottomFillLine.width = newVal;
  }

  public value() {
    return this.currentValue;
  }
}
