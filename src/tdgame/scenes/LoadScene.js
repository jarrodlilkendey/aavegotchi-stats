import Phaser from 'phaser';

import { Constants } from '../Constants';

import terrain from '../assets/terrain_atlas.png';
import items from '../assets/items.png';

import aave from '../assets/collaterals/aave-aave-logo.svg';
import link from '../assets/collaterals/chainlink-link-logo.svg';
import weth from '../assets/collaterals/ethereum-eth-logo.svg';
import dai from '../assets/collaterals/multi-collateral-dai-dai-logo.svg';
import usdt from '../assets/collaterals/tether-usdt-logo.svg';
import tusd from '../assets/collaterals/trueusd-tusd-logo.svg';
import uni from '../assets/collaterals/uniswap-uni-logo.svg';
import usdc from '../assets/collaterals/usd-coin-usdc-logo.svg';
import wbtc from '../assets/collaterals/wrapped-bitcoin-wbtc-logo.svg';
import yfi from '../assets/collaterals/yearn-finance-yfi-logo.svg';

import td from '../assets/td.json';

export class LoadScene extends Phaser.Scene {
  constructor() {
    super({
      key: Constants.SCENES.LOAD
    })
  }

  init() {
  }

  filterSvgBackground(gotchiSvg) {
    let from = gotchiSvg.search('<g class="gotchi-bg">');
    let fromString = gotchiSvg.substring(from, gotchiSvg.length);
    let to = fromString.search('</g>');
    let newSvg = gotchiSvg.substring(0, from) + fromString.substring(to + 4, gotchiSvg.length);
    return newSvg;
  }

  preload() {
    console.log('preload', this);
    const _this = this;

    this.registry.customData.myGotchis.map(function(gotchi, index) {
      console.log('keys', gotchi.tokenId);
      let gotchiSvg = gotchi.svg;
      let newSvg = _this.filterSvgBackground(gotchiSvg);
      let blob = new Blob([newSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      _this.load.svg(gotchi.tokenId, url, {
        width: 48, height: 48
      });
    });

    this.registry.customData.myEnemies.map(function(enemy, index) {
      console.log('keys', enemy.tokenId);
      let gotchiSvg = enemy.svg;
      let newSvg = _this.filterSvgBackground(gotchiSvg);
      let blob = new Blob([newSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      _this.load.svg(enemy.tokenId, url, {
        width: 48, height: 48
      });
    });

    this.load.svg('aave', aave, { width: 24, height: 24 });
    this.load.svg('link', link, { width: 24, height: 24 });
    this.load.svg('weth', weth, { width: 24, height: 24 });
    this.load.svg('dai', dai, { width: 24, height: 24 });
    this.load.svg('usdt', usdt, { width: 24, height: 24 });
    this.load.svg('tusd', tusd, { width: 24, height: 24 });
    this.load.svg('uni', uni, { width: 24, height: 24 });
    this.load.svg('usdc', usdc, { width: 24, height: 24 });
    this.load.svg('wbtc', wbtc, { width: 24, height: 24 });
    this.load.svg('yfi', yfi, { width: 24, height: 24 });


    this.load.image('terrain', terrain);
    this.load.image('items', items);
    this.load.image('playagain', '/game/playagain.png');

    this.load.image('title', '/game/title.png');
    this.load.image('play', '/game/button_play.png');

    this.load.image('music_on', '/game/music_on.png');
    this.load.image('music_off', '/game/music_off.png');

    this.load.audio('synthwave', '/game/synthwave.wav');
    this.load.audio('audio_damage', '/game/damage-sound.wav');
    this.load.audio('audio_attack', '/game/throw.wav');
    this.load.audio('audio_pickup', '/game/pick-up.wav');
    this.load.audio('audio_place', '/game/place-item.wav');

    this.load.tilemapTiledJSON('td', td);
  }

  create() {
    this.scene.start(Constants.SCENES.MENU, "Loaded");
    // this.scene.start(Constants.SCENES.GAMEPLAY, "Loaded");
  }
}
