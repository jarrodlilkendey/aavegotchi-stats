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
import mk2grenade from '../assets/weapons/mk2grenade.svg';
import m67grenade from '../assets/weapons/m67grenade.svg';
// import commonwizardstaff from '../assets/weapons/commonwizardstaff.svg';
// import legendarywizardstaff from '../assets/weapons/legendarywizardstaff.svg';
// import aagentpistol from '../assets/weapons/aagentpistol.svg';

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

  init(data) {
    this.gotchiCount = data.gotchiCount;
    this.musicSettings = data.musicSettings;
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
    this.load.svg('mk2grenade', mk2grenade, { width: 48, height: 48 });
    this.load.svg('m67grenade', m67grenade, { width: 48, height: 48 });
    // this.load.svg('commonwizardstaff', commonwizardstaff, { width: 24, height: 24 });
    // this.load.svg('legendarywizardstaff', legendarywizardstaff, { width: 24, height: 24 });
    // this.load.svg('aagentpistol', aagentpistol, { width: 24, height: 24 });

    this.load.spritesheet('uipack', uipack, { frameWidth: 16, frameHeight: 16, spacing: 2 });
    this.load.image('upgrade_enabled', `${Constants.assets.basePath}/purple-button.png`);
    this.load.image('upgrade_disabled', `${Constants.assets.basePath}/grey-button.png`);

    this.load.image('playagain', `${Constants.assets.basePath}/playagain.png`);

    this.load.spritesheet('gotchis', `${Constants.assets.basePath}/gotchis.png`, { frameWidth: 48, frameHeight: 48, spacing: 0 });

    this.load.image('button1', `${Constants.assets.basePath}/button1.png`);
    this.load.image('button2', `${Constants.assets.basePath}/button2.png`);
    this.load.image('button3', `${Constants.assets.basePath}/button3.png`);
    this.load.image('playing', `${Constants.assets.basePath}/forward.png`);
    this.load.image('paused', `${Constants.assets.basePath}/pause.png`);

    this.load.audio('audio_damage', `${Constants.assets.basePath}/damage-sound.wav`);
    this.load.audio('audio_attack', `${Constants.assets.basePath}/throw.wav`);
    this.load.audio('audio_pickup', `${Constants.assets.basePath}/pick-up.wav`);
    this.load.audio('audio_place', `${Constants.assets.basePath}/place-item.wav`);
    this.load.audio('audio_fireball', `${Constants.assets.basePath}/fireball-sound.wav`);
    this.load.audio('audio_explosion', `${Constants.assets.basePath}/explosion.mp3`);
    this.load.audio('audio_purchase', `${Constants.assets.basePath}/purchase.mp3`);

    this.load.image('fire', `${Constants.assets.basePath}/fire.png`);
    this.load.image('spark', `${Constants.assets.basePath}/spark.png`);

    this.load.spritesheet('explosion', `${Constants.assets.basePath}/explode.png`, { frameWidth: 128, frameHeight: 128 });

    this.load.image('terrain', terrain);
    this.load.image('items', items);
    this.load.tilemapTiledJSON('td', td);

    var callback = async function(successCallback, failureCallback) {
        let title = _this.add.text(_this.game.config.width / 2, 80, `Loading Enemies...`, { font: '128px m5x7', fill: '#ffffff' }).setOrigin(0.5);

        let levelEnemies = _.slice(_this.registry.customData.allEnemies, 0, _this.gotchiCount);
        levelEnemies = _.orderBy(levelEnemies, ['modifiedRarityScore', 'asc']);

        let gotchiIds = [];
        for (var i = 0; i < levelEnemies.length; i++) {
          gotchiIds.push(levelEnemies[i].id);
        }

        console.log('loading following enemies', levelEnemies, gotchiIds);
        _this.registry.customData.levelEnemies = levelEnemies;

        // const maticPOSClient = await connectToMatic();
        // const aavegotchiContract = await new maticPOSClient.web3Client.web3.eth.Contract(aavegotchiContractAbi, contract.address);
        // let myGotchiSvgs = await retrieveGotchiSvgs(aavegotchiContract, gotchiIds, 10);
        //
        // Object.keys(myGotchiSvgs).map((tokenId) => {
        //   const url = generateGotchiUrl(myGotchiSvgs[tokenId]);
        //
        //   console.log('load enemy gotchi', tokenId);
        //   _this.load.svg(tokenId, url, {
        //     width: 48, height: 48
        //   });
        // });

        successCallback();
    }
    this.load.rexAwait(callback);
  }

  create() {
    const _this = this;

    console.log("loadscene", this.gotchiCount, Constants.scalars.maxGotchis);

    if (this.registry.customData.myGotchis.length <= Constants.scalars.maxGotchis) {
      this.musicSettings.music.stop();
      this.registry.customData.myGotchis.map(function(g, index) {
        _this.registry.customData.myGotchis[index].selected = true;
      });
      this.scene.start(Constants.SCENES.GAMEPLAY, { musicSettings: this.musicSettings, gotchiCount: this.gotchiCount });
    } else {
      this.registry.customData.myGotchis.map(function(g, index) {
        _this.registry.customData.myGotchis[index].selected = false;
      });
      this.scene.start(Constants.SCENES.GOTCHISELECT, { musicSettings: this.musicSettings, gotchiCount: this.gotchiCount });
    }
  }
}
