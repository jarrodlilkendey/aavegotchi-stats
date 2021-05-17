import Phaser from 'phaser';

import { Constants } from '../Constants';

import { writeScore, writeGotchiKills } from '../leaderboard/LeaderboardUtil';

export class GameOverScene extends Phaser.Scene {
  constructor(config) {
    super({
      key: Constants.SCENES.GAMEOVER
    });
  }

  init(data) {
    console.log('GameOverScene init', data);
    this.score = data.score;
    this.musicSettings = data.musicSettings;
    this.gotchiCount = data.gotchiCount;
    this.gotchisPlaced = data.gotchisPlaced;
    this.timeElapsed = data.timeElapsed;
    this.gotchiKills = data.gotchiKills;
  }

  preload() {
  }

  create() {
    const _this = this;
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    var gameOver = this.add.text(screenCenterX, 150, 'Game Over', { font: '128px m5x7', fill: '#ffffff' }).setOrigin(0.5);
    var score = this.add.text(screenCenterX, 300, `Score: ${this.score}`, { font: '128px m5x7', fill: '#ffffff' }).setOrigin(0.5);
    var button = this.add.sprite(400, 490, 'playagain').setInteractive();
    button.on('pointerdown', function (pointer) {
      console.log('pointerdown', pointer);
      // _this.musicSettings.music.stop();
      // window.location.reload(true);
      _this.scene.start(Constants.SCENES.LEVELSELECT, { musicSettings: _this.musicSettings });
    });

    writeScore({ leaderboard: `leaderboard-level1-${this.gotchiCount}`, score: this.score, user: window.ethereum.selectedAddress, gotchisPlaced: this.gotchisPlaced, timeElapsed: this.timeElapsed });
    writeGotchiKills({ gotchiKills: this.gotchiKills });
  }
}
