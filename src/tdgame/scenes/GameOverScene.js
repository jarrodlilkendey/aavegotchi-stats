import Phaser from 'phaser';

import { Constants } from '../Constants';

export class GameOverScene extends Phaser.Scene {
  constructor(config) {
    super({
      key: Constants.SCENES.GAMEOVER
    });
  }

  init(data) {
    console.log('GameOverScene init', data);
    this.score = data.score;
  }

  preload() {

  }

  create() {
    const _this = this;
    var gameOver = this.add.text(400, 90, 'Game Over', { font: '56px Arial', fill: '#ffffff' });
    var score = this.add.text(400, 140, `Score: ${this.score}`, { font: '56px Arial', fill: '#ffffff' });
    var button = this.add.sprite(400, 490, 'playagain').setInteractive();
    button.on('pointerdown', function (pointer) {
      console.log('pointerdown', pointer);
      window.location.reload(true);
    });
  }
}
