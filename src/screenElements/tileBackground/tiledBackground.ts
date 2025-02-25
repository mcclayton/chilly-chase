import { Resources } from '@/resources';
import * as ex from 'excalibur';

export class TiledGraphic extends ex.Graphic {
  private tileSprite: ex.Sprite;

  constructor(tileSprite: ex.Sprite, width: number, height: number) {
    super();
    this.tileSprite = tileSprite;
    this.width = width;
    this.height = height;
  }

  protected _drawImage(
    ctx: ex.ExcaliburGraphicsContext,
    xx: number,
    yy: number,
  ): void {
    // Use the sprite's scaled size
    const tileW = this.tileSprite.destSize.width;
    const tileH = this.tileSprite.destSize.height;

    for (let y = 0; y < this.height; y += tileH) {
      for (let x = 0; x < this.width; x += tileW) {
        // Draw the sprite, which is already scaled via destSize
        this.tileSprite.draw(ctx, x, y);
      }
    }
  }

  public clone(): ex.Graphic {
    return new TiledGraphic(this.tileSprite, this.width, this.height);
  }
}

export class TiledBackground extends ex.ScreenElement {
  private tileSprite!: ex.Sprite;

  constructor(engine: ex.Engine) {
    super({
      x: 0,
      y: 0,
      anchor: ex.Vector.Zero,
      width: engine.drawWidth,
      height: engine.drawHeight,
      opacity: 0.4,
    });
  }

  public onInitialize(engine: ex.Engine) {
    this.tileSprite = Resources.IceBackground.toSprite();

    // Shrink the sprite to half-size by adjusting its destSize
    this.tileSprite.destSize = {
      width: this.tileSprite.width / 3,
      height: this.tileSprite.height / 3,
    };

    // Create tiling graphic
    const tiledGraphic = new TiledGraphic(
      this.tileSprite,
      this.width,
      this.height,
    );
    this.graphics.use(tiledGraphic);
  }
}
