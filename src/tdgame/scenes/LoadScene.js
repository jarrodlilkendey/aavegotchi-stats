import Phaser from 'phaser';

import { Constants } from '../Constants';

import terrain from '../assets/terrain_atlas.png';
import items from '../assets/items.png';
import uipack from '../assets/UIpackSheet_transparent.png';

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
import fireball from '../assets/weapons/fireball.svg';

import td from '../assets/td.json';

import { generateGotchiUrl, retrieveGotchiSvgs } from '../../util/AavegotchiSvg';

import aavegotchiContractAbi from '../../abi/diamond.json';
import contract from '../../config/aavegotchiContract.json';
import { connectToMatic } from '../../util/MaticClient';

import _ from 'lodash';

export class LoadScene extends Phaser.Scene {
  constructor() {
    super({
      key: Constants.SCENES.LOAD
    })
  }

  init() {
  }

  preload() {
    this.plugins.get('rexawaitloaderplugin').addToScene(this);
    const _this = this;

    this.registry.customData.myGotchis.map(function(gotchi, index) {
      console.log('load my gotchi', gotchi.tokenId);
      const url = generateGotchiUrl(gotchi.svg);

      _this.load.svg(gotchi.tokenId, url, {
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

    this.load.svg('fireball', fireball, { width: 24, height: 24 });

    this.load.image('playagain', '/game/playagain.png');

    this.load.spritesheet('uipack', uipack, { frameWidth: 16, frameHeight: 16, spacing: 2 });

    this.load.image('title', '/game/title.png');
    this.load.image('play', '/game/button_play.png');

    this.load.image('audio_off', '/game/audioOff.png');
    this.load.image('audio_on', '/game/audioOn.png');
    this.load.image('button1', '/game/button1.png');
    this.load.image('button2', '/game/button2.png');
    this.load.image('button3', '/game/button3.png');
    this.load.image('playing', '/game/forward.png');
    this.load.image('paused', '/game/pause.png');

    this.load.audio('synthwave', '/game/synthwave.wav');
    this.load.audio('audio_damage', '/game/damage-sound.wav');
    this.load.audio('audio_attack', '/game/throw.wav');
    this.load.audio('audio_pickup', '/game/pick-up.wav');
    this.load.audio('audio_place', '/game/place-item.wav');
    this.load.audio('audio_fireball', '/game/fireball-sound.wav');

    this.load.image('fire', '/game/fire.png');

    this.load.image('terrain', terrain);
    this.load.image('items', items);
    this.load.tilemapTiledJSON('td', td);

    var callback = async function(successCallback, failureCallback) {

        const gotchiCount = 100; //0;

        let levelEnemies = _.slice(_this.registry.customData.allEnemies, 0, gotchiCount);
        levelEnemies = _.orderBy(levelEnemies, ['modifiedRarityScore', 'asc']);

        let gotchiIds = [];
        for (var i = 0; i < gotchiCount; i++) {
          gotchiIds.push(levelEnemies[i].id);
        }

        console.log('loading following enemies', levelEnemies, gotchiIds);
        _this.registry.customData.levelEnemies = levelEnemies;

        const maticPOSClient = await connectToMatic();
        const aavegotchiContract = await new maticPOSClient.web3Client.web3.eth.Contract(aavegotchiContractAbi, contract.address);
        let myGotchiSvgs = await retrieveGotchiSvgs(aavegotchiContract, gotchiIds, 10);

        Object.keys(myGotchiSvgs).map((tokenId) => {
          const url = generateGotchiUrl(myGotchiSvgs[tokenId]);

          console.log('load enemy gotchi', tokenId);
          _this.load.svg(tokenId, url, {
            width: 48, height: 48
          });
        });
        successCallback();
    }
    this.load.rexAwait(callback);
  }

  create() {
    this.scene.start(Constants.SCENES.MENU, "Loaded");
  }
}
