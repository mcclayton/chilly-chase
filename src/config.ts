import * as ex from 'excalibur';

export const Config = {
  Screen: {
    Width: 700,
    Height: 500,
  },
  Player: {
    StartPos: ex.vec(200, 300),
    Acceleration: 5,
    Deceleration: 1,
    MinVelocity: -200,
    MaxVelocity: 200,
  },
  Snowball: {
    Radius: 4,
    InitialSpeed: 600,
    Deceleration: 300,
  },
  Enemy: {
    Acceleration: 5,
    Deceleration: 1,
  },
  PipeSpeed: 200,
  PipeInterval: 1500,
  PipeGap: 150,
} as const;
