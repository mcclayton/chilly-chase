import * as ex from 'excalibur';

export class IceMeter extends ex.ScreenElement {
  private barWidth: number; // Full width of the meter
  private barHeight: number;
  private currentValue: number = 1; // 1.0 means 100% filled

  // The "fill" graphic that shrinks/grows
  private fillRect: ex.Rectangle;

  constructor(x: number, y: number, width: number, height: number) {
    super({ x, y, z: 1 });

    this.barWidth = width;
    this.barHeight = height;

    // 1) Optional: a background rectangle with rounded corners, border, etc.
    const backgroundRect = new ex.Rectangle({
      width: this.barWidth,
      height: this.barHeight,
      color: ex.Color.Black, // Fill color
      strokeColor: ex.Color.White, // Border color
      lineWidth: 2, // Border thickness
    });

    // 2) Foreground fill rectangle, same corner radius
    //    We’ll update its width in setValue().
    this.fillRect = new ex.Rectangle({
      width: this.barWidth - 4, // starts full
      height: this.barHeight - 4,
      color: ex.Color.fromHex('#96bdf8'),
      opacity: 1,
    });

    // 3) Label text
    const textGraphic = new ex.Text({
      text: 'Ice:',
      color: ex.Color.White,
      font: new ex.Font({
        size: 20,
        color: ex.Color.White,
        textAlign: ex.TextAlign.Left,
      }),
    });

    // 4) Group them:
    //    - text at (0,0)
    //    - backgroundRect at (50,0)
    //    - fillRect also at (50,0), drawn above the background
    const group = new ex.GraphicsGroup({
      members: [
        {
          graphic: textGraphic,
          offset: ex.vec(0, 0),
        },
        {
          graphic: backgroundRect,
          offset: ex.vec(52, 0),
        },
        {
          graphic: this.fillRect,
          offset: ex.vec(52 + 2, 0 + 2),
        },
      ],
    });

    this.graphics.use(group);
  }

  /** Set the current fraction of the bar between 0..1 */
  public setValue(value: number) {
    this.currentValue = ex.clamp(value, 0, 1);

    // Update fill rectangle width
    this.fillRect.width = this.barWidth * this.currentValue;
  }
}
