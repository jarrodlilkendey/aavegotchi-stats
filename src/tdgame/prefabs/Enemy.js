import Phaser from 'phaser';

import { HealthBar } from './HealthBar';

export class Enemy extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.key);
    this.scene = config.scene;
    this.gotchi = config.gotchi;

    this.scene.add.existing(this);

    this.scene.physics.world.enableBody(this);
    this.body.setImmovable();

    let modifiedRarityScore = parseInt(this.gotchi.modifiedRarityScore);
    this.healthBar = new HealthBar(this.scene, this, modifiedRarityScore);
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

  damage(amount) {
    this.healthBar.decrease(amount);
    if (this.healthBar.value <=  0) {
      this.scene.events.emit('addScore');
      this.destroy();
    }
  }
}
