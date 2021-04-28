import Phaser from 'phaser';

import _ from 'lodash';

export class Gotchi extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.key);
    this.scene = config.scene;

    this.gotchi = this.scene.add.sprite(config.x, config.y, config.key);

    this.scene.physics.world.enableBody(this);

    this.info = _.find(this.scene.registry.customData.myGotchis, { 'tokenId': config.key}).gotchi;

    this.xp = 1;

    // this.gotchiRange = this.scene.add.graphics();
    //
    // this.gotchiRange.lineStyle(0.5, 0xffffff);
    //
    // let range = 150;
    // this.gotchiRange.beginPath();
    // this.gotchiRange.arc(this.gotchi.x, this.gotchi.y, range, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), false, 0.01);
    // this.gotchiRange.strokePath();
    // this.gotchiRange.closePath();
    //
    // this.gotchiRange.beginPath();
    // this.gotchiRange.lineStyle(0.4, 0xff00ff);
    // this.gotchiRange.arc(this.gotchi.x, this.gotchi.y, range, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360), true, 0.01);
    // this.gotchiRange.strokePath();
    // this.gotchiRange.closePath();
  }

  increaseXP() {
    this.xp += 1;
  }
}
