import * as ex from 'excalibur';

export const Resources = {
  // Relative to /public in vite
  PipeImage: new ex.ImageSource('./images/pipe.png'),
  PenguinWalk: new ex.ImageSource('./images/penguin_walk.png'),
} as const;
