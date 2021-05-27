import Phaser from 'phaser';

import { Constants } from '../Constants';

import { HealthBar } from './HealthBar';

export class Enemy extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.texture, config.frame);
    this.scene = config.scene;
    this.gotchi = config.gotchi;

    this.scene.add.existing(this);

    this.energy = this.gotchi.withSetsNumericTraits[0];
    this.aggression = this.gotchi.withSetsNumericTraits[1];
    this.spookiness = this.gotchi.withSetsNumericTraits[2];
    this.brainSize = this.gotchi.withSetsNumericTraits[3];

    this.enemyHealthPoints = parseInt(this.gotchi.withSetsRarityScore);

    let gotchiCount = this.scene.registry.customData.myGotchis.length;
    if (gotchiCount == 1) {
      this.enemyHealthPoints *= Constants.scalars.enemyHealthPointsByDifficulty[0];
    } else if (gotchiCount == 2) {
      this.enemyHealthPoints *= Constants.scalars.enemyHealthPointsByDifficulty[1];
    } else if (gotchiCount > 2 && gotchiCount <= 5) {
      this.enemyHealthPoints *= Constants.scalars.enemyHealthPointsByDifficulty[2];
    } else {
      this.enemyHealthPoints *= Constants.scalars.enemyHealthPointsByDifficulty[3];
    }

    this.damageResistance = Math.abs(50 - this.aggression) * Constants.scalars.damageResistance;
    this.speed = Math.abs(50 - this.energy);

    this.healthBar = new HealthBar(this.scene, this, this.enemyHealthPoints);

    console.log('Enemy', this);

    this.fireParticles = this.scene.add.particles('fire');
  }

  preUpdate (time, delta) {
    super.preUpdate(time, delta);
    this.healthBar.move(this.x, this.y);
    // let now = Date.now();
    // // console.log('preUpdate', time, delta, this.healthBar.lastDraw, this.gotchi);
    // if ((now - this.healthBar.lastDraw) > 10) {
    //   this.healthBar.move(this.x, this.y);
    // }
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

  fireballDamage(fireball) {
    console.log('fireballDamage', fireball);

    this.healthBar.decrease(fireball.damage);
    this.setAlight(fireball);
    if (this.healthBar.value <=  0) {
      if (this.scene) {
        this.scene.events.emit('addScore');
        fireball.gotchi.increaseKills();
        fireball.gotchi.increasePoints();
        this.fireEmitter.on = false;
        this.destroy();
      }
    }
  }


  setAlight(fireball) {
    console.log('setAlight', fireball);

    if (this.burningTimer) {
      this.burningTimer.remove();
    }

    this.burningTimer = this.scene.time.addEvent(
      { delay: fireball.delay, callback: this.burnDamage, callbackScope: this, loop: false, repeat: fireball.burnTimes, args: [ fireball ] }
    );

    this.fireEmitter = this.fireParticles.createEmitter({
        alpha: { start: 1, end: 0 },
        scale: { start: 0.5, end: 2.5 },
        tint: { start: 0xff945e, end: 0xff945e },
        speed: 20,
        accelerationY: -80,
        angle: { min: -85, max: -95 },
        rotate: { min: -180, max: 180 },
        lifespan: { min: 1000, max: 1100 },
        blendMode: 'ADD',
        frequency: 80,
        maxParticles: 10,
        follow: this
    });
  }

  burnDamage(fireball) {
    console.log('burnDamage', fireball);
    this.healthBar.decrease(fireball.burnDamage);
    if (this.healthBar.value <=  0) {
      if (this.scene) {
        if (this.burningTimer) {
          this.burningTimer.remove();
        }

        this.scene.events.emit('addScore');
        fireball.gotchi.increaseKills();
        fireball.gotchi.increasePoints();
        this.destroy();

        this.fireEmitter.on = false;
      }
    }
  }
}
