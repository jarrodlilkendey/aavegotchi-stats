import Phaser from 'phaser';

import { Constants } from '../Constants';

export class PausedScene extends Phaser.Scene {
  constructor() {
    super({
      key: Constants.SCENES.PAUSED
    })
  }

  init(data) {
    this.placedGotchis = data;
    console.log('PausedScene', this.placedGotchis);
  }

  resumeGame() {
    this.pausedText.visible = false;
    this.pausedSprite.visible = false;
    this.spaceBar.off('up');
    this.scene.resume(Constants.SCENES.GAMEPLAY);
  }

  create() {
    const _this = this;
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
    this.pausedText = this.add.text(screenCenterX, screenCenterY, 'PAUSED (CLICK BUTTON TO RESUME)', { font: '48px m5x7', fill: '#ffffff' }).setOrigin(0.5);
    this.pausedText.visible = true;

    this.pausedSprite = this.add.sprite(88, 600, 'paused');
    this.pausedSprite.setScale(0.8);
    this.pausedSprite.setInteractive();

    this.input.on('pointerdown', function (pointer) {
      console.log('clicked', pointer);
      for (var i = 0; i < _this.placedGotchis.length; i++) {
        let g = _this.placedGotchis[i];
        var pointerRect = new Phaser.Geom.Rectangle(pointer.x, pointer.y, 1, 1);
        var gotchiRect = new Phaser.Geom.Rectangle(g.x - (g.width / 2), g.y - (g.width / 2), g.width, g.height);
        let overlaps = Phaser.Geom.Intersects.RectangleToRectangle(pointerRect, gotchiRect);
        if (overlaps) {
          let ourUi = _this.scene.get(Constants.SCENES.UI);
          ourUi.setGotchiPlacementVisibility(false);
          _this.placedGotchis.map(function(g, i) {
            g.hideRange();
          });
          ourUi.setGotchiUpgradeVisibility(true, g);
        }
      }
    });

    this.pausedSprite.on('pointerdown', function (pointer) {
      _this.input.off('pointerdown');
      _this.resumeGame();
    });

    this.spaceBar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.spaceBar.on('up', function() {
      _this.input.off('pointerdown');
      _this.resumeGame();
    });
  }
}
