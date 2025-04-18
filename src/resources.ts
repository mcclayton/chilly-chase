import * as ex from 'excalibur';

export const Resources = {
  // Relative to /public in vite

  // Images
  PenguinWalk: new ex.ImageSource('./images/penguin_walk.png'),
  PenguinFaint: new ex.ImageSource('./images/penguin_faint.png'),
  Seal: new ex.ImageSource('./images/seal.png'),
  EskimoDownwards: new ex.ImageSource('./images/eskimo_downwards.png'),
  EskimoUpwards: new ex.ImageSource('./images/eskimo_upwards.png'),
  EskimoFrozenUpwards: new ex.ImageSource('./images/eskimo_frozen_upwards.png'),
  EskimoFrozenDownwards: new ex.ImageSource(
    './images/eskimo_frozen_downwards.png',
  ),
  FrozenSeal: new ex.ImageSource('./images/frozen_seal.png'),
  IceBlock: new ex.ImageSource('./images/ice.png'),
  IceBackground: new ex.ImageSource('./images/ice_background.png'),
  Fishes: new ex.ImageSource('./images/fishes.png'),
  InstructionsEntities: new ex.ImageSource(
    './images/instructions_entities.png',
  ),

  // Sounds
  BackgroundMusic: new ex.Sound('./sounds/background_music.mp3'),
  SnowballThrow: new ex.Sound('./sounds/snowball_throw.mp3'),
  IceCrackling: new ex.Sound('./sounds/ice_crackling.mp3'),
  FishCollect: new ex.Sound('./sounds/points.mp3'),
  Thud: new ex.Sound('./sounds/thud.mp3'),
} as const;
