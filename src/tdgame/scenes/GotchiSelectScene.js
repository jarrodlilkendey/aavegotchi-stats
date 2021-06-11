// scene for picking gotchis to use in a course (max of N gotchis)
import Phaser from 'phaser';

import { Constants } from '../Constants';
import { Bullet } from '../prefabs/Bullet';

import { graphAddressToCollateralSpriteKey } from '../../util/Collateral';

import _ from 'lodash';

export class GotchiSelectScene extends Phaser.Scene {
  constructor() {
    super({
      key: Constants.SCENES.GOTCHISELECT
    });

    Phaser.Scene.call(this, { key: Constants.SCENES.GOTCHISELECT });
  }

  init(data) {
    this.musicSettings = data.musicSettings;
    this.gotchiCount = data.gotchiCount;
    this.selectionCount = 0;
    this.rects = {};
  }

  preload() {
  }

  create() {
    const _this = this;

    let title = this.add.text(this.game.config.width / 2, 80, `GOTCHI SELECTION`, { font: '128px m5x7', fill: '#ffffff' }).setOrigin(0.5);
    this.gotchisSelectedText = this.add.text(this.game.config.width / 2, 160, `SELECTED: ${this.selectionCount} (MAX: ${Constants.scalars.maxGotchis})`, { font: '64px m5x7', fill: '#ffffff' }).setOrigin(0.5);

    this.playGameText = this.add.text(this.game.config.width / 2, this.game.config.height - 80, `PLAY`, { font: '64px m5x7', fill: '#ffffff' }).setOrigin(0.5);
    this.playGameText.setInteractive();
    this.playGameText.on('pointerdown', function (pointer) {
      if (_this.selectionCount > 0 && _this.selectionCount <= Constants.scalars.maxGotchis) {
        _this.input.setHitArea(_this.gotchiSelectionGroup.getChildren()).off('gameobjectdown');
        _this.musicSettings.music.stop();
        _this.scene.start(Constants.SCENES.GAMEPLAY, { musicSettings: _this.musicSettings, gotchiCount: _this.gotchiCount });
      }
    });

    this.gotchiSelectionGroup = this.add.group();

    console.log('myGotchis', this.registry.customData.myGotchis);
    for (var i = 0; i < this.registry.customData.myGotchis.length; i++) {
      this.registry.customData.myGotchis[i].raritySorter = parseInt(this.registry.customData.myGotchis[i].gotchi.baseRarityScore);
    }

    _.orderBy(this.registry.customData.myGotchis, ['raritySorter'], ['desc']).map(function(g, index) {
      console.log('GotchiSelectScene group create', g.tokenId);

      let item = _this.gotchiSelectionGroup.create(0, 0, g.tokenId);
      item.setInteractive();
    });

    this.input.setHitArea(this.gotchiSelectionGroup.getChildren()).on('gameobjectdown', function(pointer, gameObject) {
      if (gameObject.texture.key != null) {
        let i = _.findIndex(_this.registry.customData.myGotchis, ['tokenId', gameObject.texture.key]);
        console.log(gameObject.texture.key, i, gameObject.getBounds());
        _this.registry.customData.myGotchis[i].selected = !_this.registry.customData.myGotchis[i].selected;
        if (_this.registry.customData.myGotchis[i].selected) {
          var rect = gameObject.getBounds();
          var rectGraphic = _this.add.graphics({ lineStyle: { width: 2, color: 0xffffff } });
          rectGraphic.strokeRectShape(rect);
          _this.rects[gameObject.texture.key] = rectGraphic;
        } else {
          _this.rects[gameObject.texture.key].destroy();
          delete _this.rects[gameObject.texture.key];
        }
        _this.selectionCount = _.filter(_this.registry.customData.myGotchis, ['selected', true]).length;
        _this.gotchisSelectedText.text = `SELECTED: ${_this.selectionCount} (MAX: ${Constants.scalars.maxGotchis})`;
      }
    });

    Phaser.Actions.GridAlign(this.gotchiSelectionGroup.getChildren(), {
        width: 20,
        height: 10,
        cellWidth: 48,
        cellHeight: 48,
        x: 64,
        y: 240
    });
  }

  update() {
  }
}
