import { Resources } from './resources';
import { Level } from './scenes/level';
import * as ex from 'excalibur';

const game = new ex.Engine({
  width: 400,
  height: 500,
  backgroundColor: ex.Color.fromHex('#54C0CA'),
  pixelArt: true,
  pixelRatio: 2,
  displayMode: ex.DisplayMode.FitScreen,
  scenes: { Level: Level },
});

const loader = new ex.Loader(Object.values(Resources));
game.start(loader).then(() => {
  game.goToScene('Level');
});
