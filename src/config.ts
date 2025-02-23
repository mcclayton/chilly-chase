import * as ex from 'excalibur';

export const Config = {
  Player: {
    StartPos: ex.vec(200, 300),
    Acceleration: 5,
    Deceleration: 1,
    MinVelocity: -200,
    MaxVelocity: 200,
  },
  PipeSpeed: 200,
  PipeInterval: 1500,
  PipeGap: 150,
} as const;
