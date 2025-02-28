import * as ex from 'excalibur';

export const Resources = {
  // Relative to /public in vite
  PenguinWalk: new ex.ImageSource('./images/penguin_walk.png'),
  PenguinFaint: new ex.ImageSource('./images/penguin_faint.png'),
  Seal: new ex.ImageSource('./images/seal.png'),
  Eskimo: new ex.ImageSource('./images/eskimo.png'),
  FrozenSeal: new ex.ImageSource('./images/frozen_seal.png'),
  IceBlock: new ex.ImageSource('./images/ice.png'),
  IceBackground: new ex.ImageSource('./images/ice_background.png'),
  Fishes: new ex.ImageSource('./images/fishes.png'),
} as const;
