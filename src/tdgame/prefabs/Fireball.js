import Phaser from 'phaser';

export class Fireball extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, 'fireball');

    this.damage = config.damage;
    this.gotchi = config.gotchi;
    this.delay = 250;
    this.burnTimes = 4;
    this.burnDamage = 10;

    config.scene.add.existing(this);
  }
}
