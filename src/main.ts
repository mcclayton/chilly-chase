import { Config } from './config';
import { Resources } from './resources';
import { Game } from './scenes/game';
import { Instructions } from './scenes/instructions';
import * as ex from 'excalibur';

async function waitForFontLoad(font: string, timeout = 2000, interval = 100) {
  return new Promise((resolve, reject) => {
    // repeatedly poll check
    const poller = setInterval(async () => {
      try {
        await document.fonts.load(font);
      } catch (err) {
        reject(err);
      }
      if (document.fonts.check(font)) {
        clearInterval(poller);
        resolve(true);
      }
    }, interval);
    setTimeout(() => clearInterval(poller), timeout);
  });
}

(async () => {
  // Load font before game start
  await waitForFontLoad('40px "Jacquarda Bastarda 9"');
  await waitForFontLoad('24px "Jacquarda Bastarda 9"');
  await waitForFontLoad('30px "Pixelify Sans"');

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

  await game.start(loader);
  game.goToScene('Instructions');
})();
