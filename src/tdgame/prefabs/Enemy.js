import Phaser from 'phaser';

import { Constants } from '../Constants';

import { HealthBar } from './HealthBar';

export class Enemy extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.key);
    this.scene = config.scene;
    this.gotchi = config.gotchi;

    this.scene.add.existing(this);

    this.scene.physics.world.enableBody(this);
    this.body.setImmovable();

    this.energy = this.gotchi.withSetsNumericTraits[0];
    this.aggression = this.gotchi.withSetsNumericTraits[1];
    this.spookiness = this.gotchi.withSetsNumericTraits[2];
    this.brainSize = this.gotchi.withSetsNumericTraits[3];

    this.withSetsRarityScore = parseInt(this.gotchi.withSetsRarityScore);
    this.damageResistance = Math.abs(50 - this.aggression) * Constants.scalars.damageResistance;
    this.speed = Math.abs(50 - this.energy);

    this.healthBar = new HealthBar(this.scene, this, this.withSetsRarityScore * Constants.scalars.enemyHealthPoints);

    console.log('Enemy', this);
  }

  preUpdate (time, delta) {
    super.preUpdate(time, delta);
    this.healthBar.move(this.x, this.y);
  }

  destroy() {
    if (this.scene && this.scene.tweens) {
      let tweens = this.scene.tweens.getTweensOf(this);
      tweens.map(function(tween, index) {
        tween.stop();
      });
    }

    super.destroy();

    this.healthBar.destroy();
  }

  damage(bullet) {
    // let damage = 1;
    // if (bullet.damage > this.damageResistance) {
    //   damage = bullet.damage - this.damageResistance;
    // }

    this.healthBar.decrease(bullet.damage);
    if (this.healthBar.value <=  0) {
      if (this.scene) {
        this.scene.events.emit('addScore');
        bullet.gotchi.increaseKills();
        bullet.gotchi.increasePoints();
        this.destroy();
      }
    }
  }
}
