import Phaser from 'phaser';

import { Constants } from '../Constants';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({
      key: Constants.SCENES.MENU
    })
  }

  preload() {
    console.log('MenuScene selectedAddress', window.ethereum.selectedAddress);

    // this.load.audio('synthwave', '/game/synthwave.wav');
    this.load.audio('apes', '/game/I_wanna_be_the_Ape.wav');
    this.load.image('title', '/game/title.png');
    this.load.image('play', '/game/button_play.png');
    this.load.image('audio_off', '/game/audioOff.png');
    this.load.image('audio_on', '/game/audioOn.png');
    this.load.image('fullscreen', '/game/larger.png');
  }

  create() {
    const _this = this;

    let title = this.add.sprite(this.game.config.width / 2, this.game.config.height / 2, 'title');
    title.displayWidth = this.game.config.width;
    title.displayHeight = this.game.config.height;

    // this.music = this.sound.add('synthwave');
    this.music = this.sound.add('apes');
    this.music.play();
    this.music.setLoop(true);

    this.musicOn = true;
    this.musicSprite = this.add.sprite(50, 600, 'audio_on');
    this.musicSprite.setScale(0.8);
    this.musicSprite.setInteractive();

    this.musicSprite.on('pointerdown', function (pointer) {
        _this.toggleMusic();
    });

    this.fullscreenButton = this.add.sprite(this.game.config.width - 26, 26, 'fullscreen');
    this.fullscreenButton.setInteractive();
    this.fullscreenButton.on('pointerdown', function (pointer) {
      _this.toggleFullscreen();
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
        _this.scene.start(Constants.SCENES.LEVELSELECT, { musicSettings: { music: _this.music, musicOn: _this.musicOn } });
      });
    }
  }

  toggleMusic() {
    this.musicOn = !this.musicOn;

    if (this.musicOn) {
      this.musicSprite.setTexture('audio_on');
      this.music.play();
    } else {
      this.musicSprite.setTexture('audio_off');
      this.music.stop();
    }
  }

  toggleFullscreen() {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
    }
  }
}
