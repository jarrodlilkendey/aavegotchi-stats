import Phaser from 'phaser';

import { Constants } from '../Constants';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({
      key: Constants.SCENES.MENU
    })
  }

  preload() {
    window.ethereum.enable();
    console.log('MenuScene selectedAddress', window.ethereum.selectedAddress);
  }

  create() {
    const _this = this;

    let title = this.add.sprite(this.game.config.width / 2, this.game.config.height / 2, 'title');
    title.displayWidth = this.game.config.width;
    title.displayHeight = this.game.config.height;

    this.music = this.sound.add('synthwave');
    this.music.play();
    this.music.setLoop(true);

    this.musicOn = true;
    this.musicSprite = this.add.sprite(50, 600, 'music_on');
    this.musicSprite.setScale(0.3);
    this.musicSprite.setInteractive();

    this.musicSprite.on('pointerdown', function (pointer) {
        _this.toggleMusic();
    });

    if (window.ethereum.selectedAddress != '') {
      var selectedAddress = this.add.text(
        (this.game.config.width / 2) - 220,
        490,
        `${window.ethereum.selectedAddress}`,
        { font: '24px Arial', fill: '#ffffff' }
      );

      let playButton = this.add.sprite(
        (this.game.config.width / 2), 575, 'play'
      ).setInteractive();

      playButton.on('pointerdown', function (pointer) {
        console.log('pointerdown', pointer);
        _this.music.stop();
        _this.scene.start(Constants.SCENES.GAMEPLAY, { music: this.music, musicSprite: this.musicSprite, musicOn: _this.musicOn });
      });
    }
  }

  toggleMusic() {
    this.musicOn = !this.musicOn;

    if (this.musicOn) {
      this.musicSprite.setTexture('music_on');
      this.music.play();
    } else {
      this.musicSprite.setTexture('music_off');
      this.music.stop();
    }
  }
}
