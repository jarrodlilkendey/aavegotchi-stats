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

    this.damage = Math.max(Constants.scalars.minimumDamage, Math.abs(50 - this.aggression) + Constants.scalars.minimumDamage) * Constants.scalars.attackDamage;
    this.range = Math.max(Constants.scalars.minimumRange, Math.abs(50 - this.spookiness) + Constants.scalars.minimumRange) * Constants.scalars.attackRange;
    this.speed = Math.max(Constants.scalars.minimumSpeed, Math.abs(50 - this.energy) + Constants.scalars.minimumSpeed);
    this.xpPerKill = Math.max(Constants.scalars.minimumXpPerKill, Math.abs(50 - this.brainSize) + Constants.scalars.minimumXpPerKill);

    this.xp = 0;
    this.upgradePoints = 0;
    this.spentXp = 0;
    this.levelXp = 0;
    this.level = 0;
    this.xpPerPoint = Constants.scalars.baseXpPerPoint;
    this.xpProgress = '0%';

    this.weaponEquipped = 'collateral';
    this.weaponsOwned = ['collateral'];

    if (this.hasFireball()) {
      this.weaponsOwned.push('fireball');
      this.equipWeapon('fireball');
    }

    if (this.hasMK2Grenade()) {
      this.weaponsOwned.push('mk2grenade');
      this.equipWeapon('mk2grenade');
    }

    if (this.hasM67Grenade()) {
      this.weaponsOwned.push('m67grenade');
      this.equipWeapon('m67grenade');
    }

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
  }

  increaseEnergy(amount) {
    if (this.upgradePoints > 0) {
      this.energy += amount;
      this.speed = Math.max(Constants.scalars.minimumSpeed, Math.abs(50 - this.energy) + Constants.scalars.minimumSpeed);

      this.spendPoint();

      this.shootingTimer.remove();
      this.shootingTimer = this.scene.time.addEvent({ delay: this.calculateAttackDelay(), callback: this.scene.gotchiShoot, callbackScope: this.scene, loop: true, args: [ this ] });
    }
  }

  increaseAggression(amount) {
    if (this.upgradePoints > 0) {
      this.aggression += amount;
      this.damage = Math.max(Constants.scalars.minimumDamage, Math.abs(50 - this.aggression) + Constants.scalars.minimumDamage) * Constants.scalars.attackDamage;

      this.spendPoint();
    }
  }

  increaseSpookiness(amount) {
    if (this.upgradePoints > 0) {
      this.spookiness += amount;
      this.range = Math.max(Constants.scalars.minimumRange, Math.abs(50 - this.spookiness) + Constants.scalars.minimumRange) * Constants.scalars.attackRange;

      this.spendPoint();
      this.drawRange();
    }
  }

  increaseBrainSize(amount) {
    if (this.upgradePoints > 0) {
      this.brainSize += amount;
      this.xpPerKill = Math.max(Constants.scalars.minimumXpPerKill, Math.abs(50 - this.brainSize) + Constants.scalars.minimumXpPerKill);

      this.spendPoint();
    }
  }

  xpPerPointAtLevel(level) {
    return Constants.scalars.baseXpPerPoint * Math.pow(Constants.scalars.xpDifficultlyIncrease, level);
  }

  spendPoint() {
    console.log('xpPerPointAtLevel 0', this.xpPerPointAtLevel(0));
    console.log('xpPerPointAtLevel 1', this.xpPerPointAtLevel(1));
    console.log('xpPerPointAtLevel 2', this.xpPerPointAtLevel(2));
    this.upgradePoints -= 1;
    this.spentXp += this.xpPerPointAtLevel(this.level) //this.xpPerPoint;
    this.levelXp -= this.xpPerPointAtLevel(this.level)
    this.level += 1;

    let xpBalance = this.xp - this.levelXp - this.spentXp;

    this.xpProgress = ((xpBalance / this.xpPerPoint) * 100).toFixed() + '%';

    console.log('spendPoint', this.xpProgess, 'xp:', this.xp, 'spentXp:', this.spentXp, 'levelXp:', this.levelXp, 'balance:', xpBalance, 'xpPerPoint:', this.xpPerPoint);
  }

  increaseKills() {
    this.kills += 1;
  }

  increasePoints() {
    this.xp += this.xpPerKill;

    let xpBalance = this.xp - this.spentXp - this.levelXp;
    if (xpBalance >= this.xpPerPoint) {
      while (xpBalance >= this.xpPerPoint) {
        this.upgradePoints += 1;
        this.levelXp += this.xpPerPoint;
        xpBalance -= this.xpPerPoint;
        this.xpPerPoint *= Constants.scalars.xpDifficultlyIncrease;
      }
    }

    this.xpProgress = ((xpBalance / this.xpPerPoint) * 100).toFixed() + '%';
    console.log('increasePoints', this.xpProgress, 'xp:', this.xp, 'spentXp:', this.spentXp, 'levelxp:', this.levelXp, 'xpPerPoint:', this.xpPerPoint);
  }

  hasFireball() {
    if (_.includes(this.info.equippedWearables, 130)) {
      return true;
    }
    return false;
  }

  hasMK2Grenade() {
    if (_.includes(this.info.equippedWearables, 3)) {
      return true;
    }
    return false;
  }

  hasM67Grenade() {
    if (_.includes(this.info.equippedWearables, 6)) {
      return true;
    }
    return false;
  }

  hasCommonWizardStaff() {
    if (_.includes(this.info.equippedWearables, 64)) {
      return true;
    }
    return false;
  }

  hasLegendaryWizardStaff() {
    if (_.includes(this.info.equippedWearables, 65)) {
      return true;
    }
    return false;
  }

  hasAagentPistol() {
    if (_.includes(this.info.equippedWearables, 58)) {
      return true;
    }
    return false;
  }

  isWeaponOwned(weaponId) {
    if (_.includes(this.weaponsOwned, weaponId)) {
      return true;
    }
    return false;
  }

  isWeaponEquipped(weaponId) {
    if (this.weaponEquipped == weaponId) {
      return true;
    }
    return false;
  }

  equipWeapon(weaponId) {
    this.weaponEquipped = weaponId;
  }

  purchaseWeapon(weaponId) {
    this.weaponsOwned.push(weaponId);
    this.equipWeapon(weaponId);
  }
}
