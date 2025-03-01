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
  EskimoSnowball: {
    Radius: 4,
    InitialSpeed: 350,
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
    MinSealCreatedVelocity: 35,
    MaxSealCreatedVelocity: 100,
  },
  EskimoFactory: {
    MinCreationInterval: 500,
    MaxCreationInterval: 20000,
    MinEskimoCreatedVelocity: 35,
    MaxEskimoCreatedVelocity: 70,
  },
  Fish: {
    DurationSeconds: 7,
  },
  FishFactory: {
    CreationInterval: 15000,
  },
  BackgroundMusic: {
    DefaultVolume: 0.6,
    InitialPlaybackSpeed: 0.6,
    GameOverVolume: 0.3,
  },
} as const;
