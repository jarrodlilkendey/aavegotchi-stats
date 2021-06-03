import React, { Component } from 'react';
import Phaser from 'phaser';
import { IonPhaser } from '@ion-phaser/react';

import { LoadScene } from './scenes/LoadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameplayScene } from './scenes/GameplayScene';
import { GameOverScene } from './scenes/GameOverScene';
import { UIScene } from './scenes/UIScene';
import { PausedScene } from './scenes/PausedScene';
import { LevelSelectScene } from './scenes/LevelSelectScene';

import { Constants } from './Constants';

import Loading from '../components/Loading';

import aavegotchiContractAbi from '../abi/diamond.json';
import contract from '../config/aavegotchiContract.json';
import { connectToMatic } from '../util/MaticClient';

import { retrieveUserAssets, retrieveAllGotchis } from '../util/Graph';

import _ from 'lodash';
import { RateLimit } from 'async-sema';

import AwaitLoaderPlugin from 'phaser3-rex-plugins/plugins/awaitloader-plugin.js';

class GotchiTowerDefence extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    this.state = {
      address: '',

      myGotchis: [],
      allEnemies: [],

      initialize: true,

      loading: true
    }
  }

  async componentDidMount() {
    const _this = this;

    const maticPOSClient = await connectToMatic();

    const aavegotchiContract = await new maticPOSClient.web3Client.web3.eth.Contract(aavegotchiContractAbi, contract.address);
    console.log(aavegotchiContract);

    await window.ethereum.enable();
    console.log('selectedAddress', window.ethereum.selectedAddress);
    this.setState({ address: window.ethereum.selectedAddress })

    if (window.ethereum.selectedAddress != '') {
      retrieveAllGotchis()
        .then((allGotchis) => {
          retrieveUserAssets(window.ethereum.selectedAddress)
            .then((user) => {
              let allEnemies = _.reject(allGotchis, function(g) { return g.owner.id == _this.state.address.toLowerCase() });
              allEnemies.map(function(e, i) {
                allEnemies[i].modifiedRarityScore = parseInt(e.modifiedRarityScore);
                allEnemies[i].withSetsRarityScore = parseInt(e.withSetsRarityScore);
                if (allEnemies[i].withSetsRarityScore == 0) {
                  allEnemies[i].withSetsRarityScore = allEnemies[i].modifiedRarityScore;
                }
              })

              allEnemies = _.shuffle(allEnemies);

              _this.setState({ allEnemies, loading: false });

              console.log('gotchis owned', user.gotchisOwned);
              if (user.gotchisOwned.length > Constants.scalars.maxGotchis) {
                user.gotchisOwned = _.slice(_.shuffle(user.gotchisOwned), 0, Constants.scalars.maxGotchis);
              }
              console.log('gotchis owned', user.gotchisOwned);

              _this.retrieveGotchiSvgs(user, aavegotchiContract);
            });
        });

    } else {
      alert('Select the connect button and reload the page');
    }
  }

  async retrieveGotchiSvgs(user, aavegotchiContract) {
    const _this = this;

    const limit = RateLimit(15);

    for (let i = 0; i < user.gotchisOwned.length; i++) {
      let gotchi = user.gotchisOwned[i];
      let tokenId = gotchi.id;
      await limit();
      _this.fetchFromRPC(aavegotchiContract, tokenId, gotchi, user);
    }
  }

  fetchFromRPC(aavegotchiContract, tokenId, gotchi, user) {
    const _this = this;

    const response = aavegotchiContract.methods.getAavegotchiSvg(tokenId).call()
      .then((svg) => {
        console.log('GotchiTowerDefence svg for', tokenId);
        _this.setState(
          { myGotchis: [..._this.state.myGotchis, { tokenId: tokenId, svg: svg, gotchi: gotchi }]},
          () => {
            if (_this.state.myGotchis.length == user.gotchisOwned.length) {
              _this.loadGame();
            }
          }
        );
      })
      .catch((error) => console.log(error));

    return response;
  }

  loadGame() {
    console.log('GotchiTowerDefence loadGame', this.state);
    const _this = this;

    let game = {
      type: Phaser.AUTO,
      scene: [ MenuScene, LevelSelectScene, LoadScene, GameplayScene, GameOverScene, PausedScene ],
      scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 32 * 32,
        height: 32 * 20
    },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false, //true,
          fps: 60
        },
      },
      callbacks: {
        preBoot: function (game) {
          game.registry.customData = { };
          game.registry.customData.myGotchis = _this.state.myGotchis;
          game.registry.customData.allEnemies = _this.state.allEnemies;

          game.registry.merge(_this.state);
          console.log('preBoot', game.registry);
        }
      },
      fps: {
        target: 60,
        forceSetTimeOut: true
      },
      plugins: {
        global: [
          {
            key: 'rexawaitloaderplugin',
            plugin: AwaitLoaderPlugin,
            start: true
          },
        ]
      }
    };

    this.setState({ game });
  }

  render() {
    let { initialize, game } = this.state

    return (
      <div>
        <h1>Gotchi Tower Defense</h1>
        <p>Gotchi Tower Defense was built by jarrod featuring the track "I Wanna Be The Ape" by <a href='https://soundcloud.com/jowijames/sets/aavegotchicom-minigame-chiptunes'>jo0wz</a></p>
        <p><a href="./tdleaderboard">Leaderboards</a> <a href="tdhelp">How to Play</a> <a href="https://docs.google.com/forms/d/e/1FAIpQLSe8fPhWSv2c8kUNFqG-3owMI3KK33X7_OM6CxU_dNEIHt8d_w/viewform?usp=sf_link">Feedback</a></p>
        {this.state.loading &&
          <Loading message="Loading Gotchi Tower Defense..." />
        }
        <div style={{ "fontFamily": "m5x7", "marginBottom": "20px" }}>
          <IonPhaser game={game} initialize={initialize} />
        </div>
      </div>
    )
  }
}

export default GotchiTowerDefence;
