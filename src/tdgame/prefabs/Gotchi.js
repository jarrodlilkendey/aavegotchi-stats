import Phaser from 'phaser';

import { Constants } from '../Constants';

import _ from 'lodash';

export class Gotchi extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.key);
    this.scene = config.scene;

    this.gotchi = this.scene.add.sprite(config.x, config.y, config.key);
    this.setInteractive();

    this.scene.physics.world.enableBody(this);

    this.info = _.find(this.scene.registry.customData.myGotchis, { 'tokenId': config.key}).gotchi;

    this.hits = 0;
    this.kills = 0;

    this.energy = this.info.withSetsNumericTraits[0];
    this.aggression = this.info.withSetsNumericTraits[1];
    this.spookiness = this.info.withSetsNumericTraits[2];
    this.brainSize = this.info.withSetsNumericTraits[3];

    this.damage = Math.abs(50 - this.aggression) * Constants.scalars.attackDamage;
    this.range = Math.abs(50 - this.spookiness) * Constants.scalars.attackRange;
    this.speed = Math.abs(50 - this.energy);
    this.xpPerKill = Math.abs(50 - this.brainSize);

    this.xp = 0;
    this.upgradePoints = 0;
    this.spentXp = 0;
    this.xpPerPoint = Constants.scalars.baseXpPerPoint;

    this.gotchiRange = this.scene.add.graphics();
  }

  hideRange() {
    this.gotchiRange.clear();
  }

  drawRange() {
    this.hideRange();

    this.gotchiRange.lineStyle(0.5, 0xffffff);

    this.gotchiRange.beginPath();
    this.gotchiRange.arc(this.gotchi.x, this.gotchi.y, this.range - 24, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), false, 0.01);
    this.gotchiRange.strokePath();
    this.gotchiRange.closePath();

    this.gotchiRange.beginPath();
    this.gotchiRange.lineStyle(0.4, 0xff00ff);
    this.gotchiRange.arc(this.gotchi.x, this.gotchi.y, this.range - 24, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), true, 0.01);
    this.gotchiRange.strokePath();
    this.gotchiRange.closePath();
  }

  calculateAttackDelay() {
    let delay = (1 / this.speed) * Constants.scalars.attackSpeed;
    return delay;
  }

  increaseHits() {
    this.hits += 1;
    // this.damage = parseInt(this.info.withSetsRarityScore) * Math.pow(1.003, this.hits);
  }

  increaseEnergy(amount) {
    if (this.upgradePoints > 0) {
      this.energy += amount;
      this.speed = Math.abs(50 - this.energy);
      this.upgradePoints -= 1;
      this.spentXp += this.xpPerPoint;
      this.shootingTimer.remove();
      this.shootingTimer = this.scene.time.addEvent({ delay: this.calculateAttackDelay(), callback: this.scene.gotchiShoot, callbackScope: this.scene, loop: true, args: [ this ] });
    }
  }

  increaseAggression(amount) {
    if (this.upgradePoints > 0) {
      this.aggression += amount;
      this.damage = Math.abs(50 - this.aggression) * Constants.scalars.attackDamage;
      this.upgradePoints -= 1;
      this.spentXp += this.xpPerPoint;
    }
  }

  increaseSpookiness(amount) {
    if (this.upgradePoints > 0) {
      this.spookiness += amount;
      this.range = Math.abs(50 - this.spookiness) * Constants.scalars.attackRange;
      this.upgradePoints -= 1;
      this.spentXp += this.xpPerPoint;
      this.drawRange();
    }
  }

  increaseBrainSize(amount) {
    if (this.upgradePoints > 0) {
      this.brainSize += amount;
      this.xpPerKill = Math.abs(50 - this.brainSize);
      this.upgradePoints -= 1;
      this.spentXp += this.xpPerPoint;
    }
  }

  increaseKills() {
    this.kills += 1;
  }

  increasePoints() {
    this.xp += this.xpPerKill;

    let xpBalance = this.xp - this.spentXp;
    if (xpBalance >= this.xpPerPoint) {
      let pointsGained = parseInt(xpBalance / this.xpPerPoint);
      this.upgradePoints += pointsGained;
      this.spentXp += (pointsGained * this.xpPerPoint);
    }
  }
}
