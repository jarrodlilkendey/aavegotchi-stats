import Phaser from 'phaser';

import { Constants } from '../Constants';

import { writeScore, writeGotchiKills, readScores, writeXPEventResult } from '../leaderboard/LeaderboardUtil';

const _ = require('lodash');

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
    var gameOver = this.add.text(screenCenterX, 75, 'Game Over', { font: '128px m5x7', fill: '#ffffff' }).setOrigin(0.5);
    var score = this.add.text(screenCenterX, 160, `Score: ${this.score}`, { font: '80px m5x7', fill: '#ffffff' }).setOrigin(0.5);
    var timeElapsed = this.add.text(screenCenterX, 215, `Time: ${this.timeElapsed}`, { font: '80px m5x7', fill: '#ffffff' }).setOrigin(0.5);
    var gotchisPlaced = this.add.text(screenCenterX, 270, `Gotchis Placed: ${this.gotchisPlaced}`, { font: '80px m5x7', fill: '#ffffff' }).setOrigin(0.5);

    if (Constants.events.xpEventLive) {
      this.rank = this.add.text(screenCenterX, 325, 'View Leaderboard', { font: '80px m5x7', fill: '#ffffff' }).setOrigin(0.5).setInteractive();
    } else {
      this.rank = this.add.text(screenCenterX, 325, 'Leaderboard Rank: loading...', { font: '80px m5x7', fill: '#ffffff' }).setOrigin(0.5).setInteractive();
    }
    this.rank.on('pointerdown', this.openLeaderboard, this);

    var button = this.add.sprite(screenCenterX, 500, 'playagain').setOrigin(0.5).setInteractive();
    button.on('pointerdown', function (pointer) {
      console.log('pointerdown', pointer);
      // _this.musicSettings.music.stop();
      // window.location.reload(true);
      _this.scene.start(Constants.SCENES.LEVELSELECT, { musicSettings: _this.musicSettings });
    });

    if (!Constants.events.xpEventLive) {
      writeScore(
        { leaderboard: `leaderboard-level1-${this.gotchiCount}`, score: this.score, user: window.ethereum.selectedAddress, gotchisPlaced: this.gotchisPlaced, timeElapsed: this.timeElapsed }
      ).then(() => {
        readScores({ leaderboard: `leaderboard-level1-${_this.gotchiCount}` })
          .then((results) => {
            console.log('results', results);
            let leaders = _.orderBy(results, ['score', 'timeElapsed', 'gotchisPlaced'], ['desc', 'asc', 'asc']);
            let userRank = _.findIndex(leaders, ['user', window.ethereum.selectedAddress]) + 1;
            _this.rank.text = `Leaderboard Rank: ${userRank}`;
          });
      });

      writeGotchiKills({ gotchiKills: this.gotchiKills });
    } else {
      writeXPEventResult({
        course: `course-${this.gotchiCount}`,
        score: this.score,
        user: window.ethereum.selectedAddress,
        gotchisPlaced: this.gotchisPlaced,
        timeElapsed: this.timeElapsed,
        gotchiKills: this.gotchiKills
      }).then((res) => {
        console.log('writeXPEventResult', res);
      });
    }
  }

  openLeaderboard() {
    var url = 'https://aavegotchistats.com/tdleaderboard';

    if (Constants.events.xpEventLive) {
      url = 'https://aavegotchistats.com/tdxpleaderboard';
    }

    var s = window.open(url, '_blank');
    if (s && s.focus) {
      s.focus();
    } else if (!s) {
      window.location.href = url;
    }
  }
}
