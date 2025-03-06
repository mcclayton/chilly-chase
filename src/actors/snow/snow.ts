import { Config } from '@/config';
import { Game } from '@/scenes/game';
import * as ex from 'excalibur';

const BASE_EMITTER_CONFIG = {
  x: 0,
  y: 0,
  width: Config.Screen.Width,
  height: Config.Screen.Height - 100,
  emitterType: ex.EmitterType.Rectangle,
  emitRate: 0.2,
  isEmitting: true,
};

const BASE_PARTICLE_CONFIG = {
  opacity: 0.6,
  minSize: 0,
  maxSize: 5,
  maxSpeed: 1,
  beginColor: ex.Color.White,
  endColor: ex.Color.White,
  life: 25000,
  fade: true,
};

export class Snow extends ex.Actor {
  constructor(scene: ex.Scene, pos: ex.Vector) {
    super({
      pos,
      z: 50,
    });
    this.scene = scene;
  }

  override onInitialize(engine: ex.Engine): void {
    const snowLeft = new ex.ParticleEmitter({
      ...BASE_EMITTER_CONFIG,
      particle: {
        ...BASE_PARTICLE_CONFIG,
        vel: new ex.Vector(-1, 1),
        acc: new ex.Vector(-0.5, 1),
      },
    });
    this.addChild(snowLeft);

    const snow = new ex.ParticleEmitter({
      ...BASE_EMITTER_CONFIG,
      particle: {
        ...BASE_PARTICLE_CONFIG,
        vel: new ex.Vector(0, 1),
        acc: new ex.Vector(0, 1),
      },
    });
    this.addChild(snow);

    const snowRight = new ex.ParticleEmitter({
      ...BASE_EMITTER_CONFIG,
      particle: {
        ...BASE_PARTICLE_CONFIG,
        vel: new ex.Vector(1, 1),
        acc: new ex.Vector(0.5, 1),
      },
    });
    this.addChild(snowRight);
  }
}
