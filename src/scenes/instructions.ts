import { Snow } from '@/actors/snow/snow';
import { Resources } from '@/resources';
import { InstructionsMenu } from '@/screenElements/instructionsMenu/instructionsMenu';
import { TiledBackground } from '@/screenElements/tileBackground/tiledBackground';
import * as ex from 'excalibur';

const OVERLAY_Z = 100;

export class Instructions extends ex.Scene {
  chillyChaseLabel = new ex.Label({
    text: 'Chilly Chase',
    x: 350,
    y: 10,
    z: OVERLAY_Z,
    font: new ex.Font({
      family: `"Jacquarda Bastarda 9", serif`,
      size: 40,
      bold: true,
      color: ex.Color.White,
      textAlign: ex.TextAlign.Center,
    }),
  });

  startGameLabel = new ex.Label({
    text: 'Click to Start',
    x: 350,
    y: 400,
    z: OVERLAY_Z,
    font: new ex.Font({
      family: `"Jacquarda Bastarda 9", serif`,
      size: 30,
      color: ex.Color.White,
      textAlign: ex.TextAlign.Center,
    }),
  });

  instructionsMenu = new InstructionsMenu(this, 0, 50, 100);

  override onInitialize(engine: ex.Engine): void {
    const background = new TiledBackground(engine);
    this.add(background);
    this.add(this.chillyChaseLabel);
    this.add(this.instructionsMenu);
    this.add(this.startGameLabel);

    const snow = new Snow(this, new ex.Vector(0, 0));
    this.add(snow);

    const spriteSheet = ex.SpriteSheet.fromImageSource({
      image: Resources.PenguinWalk,
      grid: {
        rows: 1,
        columns: 6,
        spriteWidth: 64,
        spriteHeight: 64,
      },
    });

    this.engine.input.pointers.once('down', () => {
      engine.goToScene('Game');
    });
  }
}
