import Phaser from 'phaser';

export class MK2Grenade extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, 'mk2grenade');

    this.damage = config.damage;
    this.gotchi = config.gotchi;

    this.blastRadius = 64;
    this.collided = false;

    config.scene.add.existing(this);
  }
}
