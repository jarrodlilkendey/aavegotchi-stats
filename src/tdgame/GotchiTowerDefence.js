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
      width: 32 * 32,
      height: 32 * 20,
      type: Phaser.AUTO,
      scene: [ MenuScene, LevelSelectScene, LoadScene, GameplayScene, GameOverScene, PausedScene ],
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
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
        <h1>Gotchi Tower Defense (Beta)</h1>
        <p><a href="./tdleaderboard">Gotchi Tower Defense Leaderboards</a> [<a href="https://docs.google.com/forms/d/e/1FAIpQLSe8fPhWSv2c8kUNFqG-3owMI3KK33X7_OM6CxU_dNEIHt8d_w/viewform?usp=sf_link">Feedback</a>]</p>
        {this.state.loading &&
          <Loading message="Loading Gotchi Tower Defense..." />
        }
        <div style={{ "fontFamily": "m5x7" }}>
          <IonPhaser game={game} initialize={initialize} />
        </div>
        <h2>How to Play Gotchi Tower Defense</h2>
        <p>Gotchi TD is a tower defense minigame for Aavegotchi built by the community, it is currently in beta phase and there are no XP drops right now for playing.</p>
        <p>Connect your account in Metamask holding your Gotchis to retrieve your Gotchis to strategically place them on the map to attack spawned enemy ghosts from the Aavegotchi game</p>
        <p>The traits of your Gotchi to will influence gameplay.</p>
        <ul>
          <li>The further your Gotchi's Energy is from 50, the quicker your attack speed will be</li>
          <li>The further your Gotchi's Aggression is from 50, the higher your attack damage will be</li>
          <li>The further your Gotchi's Spookiness is from 50, the larger your attack range will be</li>
          <li>The further your Gotchi's Brain Size is from 50, the more XP points are gained per kill which are redeemable for in game trait upgrade points</li>
        </ul>
        <p>If your Gotchi has equipped a fireball it can be used as an in game item to deal attack damage and burn damage to enemies.</p>
        <p>Enemies health points are based on their rarity score and they are easier to kill if you have fewer Gotchis on your account. If you have more than 21 Gotchis on your account, a maximum of 21 Gotchis will be randomly selected from your account that can be used in-game.</p>
        <p><a href="./tdleaderboard">Leaderboards</a> have been created for three different modes 100 Gotchis, 250 Gotchis and 1000 Gotchis. The quicker you complete the map with the fewest Gotchis, the better your rank will be. There is also a leaderboard ranking individual Gotchis with the most enemy kills.</p>
        <p>The game is currently in beta, you may experience bugs or performance issues when playing, please use the <a href="https://docs.google.com/forms/d/e/1FAIpQLSe8fPhWSv2c8kUNFqG-3owMI3KK33X7_OM6CxU_dNEIHt8d_w/viewform?usp=sf_link">google form</a> to provide your feedback on the game. Please report anything around bugs, performance, game balance, things you like or dislike or any other feedback you think would make the game better for a full launch. Include hardware specs and browser information to help with resolution of reported issues. Note: if you are using the Brave browser, please disable shields for AavegotchiStats.com to prevent text alignment issues.</p>
      </div>
    )
  }
}

export default GotchiTowerDefence;
