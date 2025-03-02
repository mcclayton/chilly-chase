import { Resources } from '@/resources';
import * as ex from 'excalibur';

export class InstructionsMenu extends ex.ScreenElement {
  constructor(scene: ex.Scene, x: number, y: number, z: number) {
    super({ x, y, z });

    const instructionsSprite = Resources.InstructionsEntities.toSprite({
      width: 43,
      height: 60,
    });

    const instructions = new ex.Label({
      text: `Objective:
    Avoid the penguin's enemies and accumulate as many points as possible without sliding off the screen.

Controls:
    Use W,A,S,D to move the penguin around.

    Use the mouse to aim and click to throw snowballs at enemies.

    Press and hold the Spacebar while moving to leave a trail of ice that can block and freeze enemies.

    Press the Esc key to pause the game.


Enemies:
    Seals: Chase after the player and can be defeated with a snowball.
        - Bonus points awarded if frozen when hit with a snowball.

    Eskimos: Chase after the player and can throw snowballs as well.
        - They can only be defeated with a snowball while frozen.

Fish:
    Collect fish as they appear to collect bonus points. The faster they are collected, the more points
    they are worth.`,
      x: 20,
      y: 60,
      z: 1,
      font: new ex.Font({
        family: `"Pixelify Sans", serif`,
        size: 12,
        color: ex.Color.Black,
        textAlign: ex.TextAlign.Left,
      }),
    });

    scene.add(instructions);

    this.graphics.use(instructionsSprite);
    this.graphics.offset = ex.vec(460, 205);
  }
}
