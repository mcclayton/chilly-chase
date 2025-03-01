import { Config } from '@/config';
import { Resources } from '@/resources';
import * as ex from 'excalibur';

export class InstructionsMenu extends ex.ScreenElement {
  constructor(x: number, y: number, z: number) {
    super({ x, y, z });

    const instructionsSprite = Resources.Instructions.toSprite({
      width: 667,
      height: 262,
    });

    this.graphics.use(instructionsSprite);
  }
}
