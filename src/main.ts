import { Config } from './config';
import { Resources } from './resources';
import { Level } from './scenes/level';
import * as ex from 'excalibur';

const game = new ex.Engine({
  width: Config.Screen.Width,
  height: Config.Screen.Height,
  backgroundColor: ex.Color.fromHex('#bad4f0'),
  pixelArt: true,
  pixelRatio: 2,
  displayMode: ex.DisplayMode.FitScreen,
  scenes: { Level: Level },
});

const loader = new ex.Loader(Object.values(Resources));
game.start(loader).then(() => {
  game.goToScene('Level');
});
