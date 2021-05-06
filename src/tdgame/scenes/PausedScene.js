import Phaser from 'phaser';

import { Constants } from '../Constants';

export class PausedScene extends Phaser.Scene {
  constructor() {
    super({
      key: Constants.SCENES.PAUSED
    })
  }

  create() {
    const _this = this;
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    this.pausedText = this.add.text(screenCenterX, screenCenterY, 'PAUSED (CLICK TO RESUME)', { font: '48px m5x7', fill: '#ffffff' }).setOrigin(0.5);
    this.pausedText.visible = true;
    this.input.on('pointerdown', function (pointer) {
      _this.pausedText.visible = false;
      _this.scene.resume(Constants.SCENES.GAMEPLAY);
    });
  }
}
