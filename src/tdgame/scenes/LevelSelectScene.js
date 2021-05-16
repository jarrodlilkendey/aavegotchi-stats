import Phaser from 'phaser';

import { Constants } from '../Constants';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super({
      key: Constants.SCENES.LEVELSELECT
    })
  }

  init(data) {
    this.musicSettings = data.musicSettings;
  }

  preload() {
    this.load.image('level1', '/game/level1.png');
    this.load.image('gotchis100', '/game/button_100gotchis.png');
    this.load.image('gotchis250', '/game/button_250gotchis.png');
    this.load.image('gotchis1000', '/game/button_1000gotchis.png');
  }

  create() {
    const _this = this;

    let title = this.add.text(this.game.config.width / 2, 80, `Select Level`, { font: '128px m5x7', fill: '#ffffff' }).setOrigin(0.5);

    let level1 = this.add.sprite(this.game.config.width / 2, this.game.config.height / 2, 'level1').setScale(0.3);

    let gotchis100 = this.add.sprite(200, 500, 'gotchis100').setInteractive();
    let gotchis250 = this.add.sprite(500, 500, 'gotchis250').setInteractive();
    let gotchis1000 = this.add.sprite(800, 500, 'gotchis1000').setInteractive();

    gotchis100.on('pointerdown', function (pointer) {
      _this.scene.start(Constants.SCENES.LOAD, { gotchiCount: 100, musicSettings: _this.musicSettings });
    });

    gotchis250.on('pointerdown', function (pointer) {
      _this.scene.start(Constants.SCENES.LOAD, { gotchiCount: 250, musicSettings: _this.musicSettings });
    });

    gotchis1000.on('pointerdown', function (pointer) {
      _this.scene.start(Constants.SCENES.LOAD, { gotchiCount: 1000, musicSettings: _this.musicSettings });
    });
  }
}
