import { Config } from './config';
import { Resources } from './resources';
import { Game } from './scenes/game';
import { Instructions } from './scenes/instructions';
import * as ex from 'excalibur';

const game = new ex.Engine({
  width: Config.Screen.Width,
  height: Config.Screen.Height,
  backgroundColor: ex.Color.fromHex('#bad4f0'),
  pixelArt: true,
  pixelRatio: 2,
  displayMode: ex.DisplayMode.FitScreen,
  scenes: { Game, Instructions },
});

const loader = new ex.DefaultLoader({
  loadables: Object.values(Resources),
});

game.start(loader).then(() => {
  game.goToScene('Instructions');
});
