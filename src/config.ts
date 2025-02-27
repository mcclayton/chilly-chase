import * as ex from 'excalibur';

export const Config = {
  Screen: {
    Width: 700,
    Height: 500,
  },
  IceMeter: {
    RefillAfterIdleSeconds: 3,
    RefillRate: 0.2,
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
    SecondsUntilMelt: 2,
  },
  Seal: {
    Velocity: 60,
    FreezeTimeSeconds: 3,
  },
  SealFactory: {
    MinCreationInterval: 500,
    MaxCreationInterval: 4000,
  },
  Fish: {
    DurationSeconds: 5,
  },
  FishFactory: {
    CreationInterval: 15000,
  },
} as const;
