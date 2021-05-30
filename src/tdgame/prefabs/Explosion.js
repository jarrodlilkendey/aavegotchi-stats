import Phaser from 'phaser';

export class Explosion extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, 'explosion', 0);

    this.scene = config.scene;
    this.radius = config.radius;

    this.setScale(this.radius / 128);

    this.scene.add.existing(this);
  }
}
