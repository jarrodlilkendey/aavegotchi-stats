import Phaser from 'phaser';

export class M67Grenade extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, 'm67grenade');

    this.damage = config.damage;
    this.gotchi = config.gotchi;

    this.blastRadius = 128;
    this.collided = false;

    config.scene.add.existing(this);
  }
}
