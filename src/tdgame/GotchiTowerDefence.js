import React, { Component } from 'react';
import Phaser from 'phaser';
import { IonPhaser } from '@ion-phaser/react';

import { LoadScene } from './scenes/LoadScene';
import { MenuScene } from './scenes/MenuScene';
import { GameplayScene } from './scenes/GameplayScene';
import { GameOverScene } from './scenes/GameOverScene';
import { UIScene } from './scenes/UIScene';

import aavegotchiContractAbi from '../abi/diamond.json';
import contract from '../config/aavegotchiContract.json';
import { connectToMatic } from '../util/MaticClient';

import { retrieveUserAssets, retrieveAllGotchis } from '../util/Graph';

import _ from 'lodash';

class GotchiTowerDefence extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    this.state = {
      address: '',

      myGotchis: [],
      myEnemies: [],
      svgsToGet: [],

      initialize: true,
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
              console.log('retrieveAllGotchis', allGotchis);
              let myEnemies = _.reject(allGotchis, function(g) { return g.owner.id == _this.state.address.toLowerCase() });
              myEnemies.map(function(e, i) {
                myEnemies[i].modifiedRarityScore = parseInt(e.modifiedRarityScore);
              })
              myEnemies = _.orderBy(myEnemies, ['modifiedRarityScore', 'asc']);

              console.log('myEnemies', myEnemies);

              console.log('retrieveUserAssets', user);

              _this.setState(
                { user, svgsToGet: myEnemies },
                () => {
                  myEnemies.map(function(enemy, index) {
                    if (index <= 3) { //50) {
                      aavegotchiContract.methods.getAavegotchiSvg(enemy.id).call().then(function (svg) {
                        let svgsToGet = [..._this.state.svgsToGet];
                        svgsToGet = _.remove(svgsToGet, function(g) {
                          return g.id != enemy.id;
                        });
                        _this.setState(
                          {
                            myEnemies: [..._this.state.myEnemies, { tokenId: enemy.id, svg: svg, gotchi: enemy }],
                            svgsToGet: svgsToGet
                          }
                        );
                      }).catch(function (error) {
                        console.log(error);
                      });
                    }
                  });
                }
              );



              user.gotchisOwned.map(function(gotchi, index) {
                let tokenId = gotchi.id;
                aavegotchiContract.methods.getAavegotchiSvg(tokenId).call().then(function (svg) {
                  _this.setState(
                    { myGotchis: [..._this.state.myGotchis, { tokenId: tokenId, svg: svg, gotchi: gotchi }]},
                    () => {
                      if (_this.state.myGotchis.length == user.gotchisOwned.length) {
                        _this.loadGame();
                      }
                    }
                  );
                }).catch(function (error) {
                  console.log(error);
                });
              });
            });
        });

    } else {
      alert('Select the connect button and reload the page');
    }
  }

  loadGame() {
    console.log('loadGame', this.state);
    const _this = this;

    let game = {
      width: 32 * 32,
      height: 32 * 20,
      type: Phaser.AUTO,
      scene: [ LoadScene, MenuScene, GameplayScene, GameOverScene ],
      physics: {
        default: 'arcade',
        arcade: {
          debug: false //true
        },
      },
      callbacks: {
        preBoot: function (game) {
          game.registry.customData = { };
          game.registry.customData.myGotchis = _this.state.myGotchis;
          game.registry.customData.myEnemies = _this.state.myEnemies;
          game.registry.customData.svgsToGet = _this.state.svgsToGet;

          game.registry.merge(_this.state);
          console.log('preBoot', game.registry);
        }
      }
    };

    this.setState({ game });
  }

  render() {
    let { initialize, game } = this.state

    return (
      <div style={{ "font-family": "m5x7" }}>
        <h1>Gotchi Tower Defense (Beta)</h1>
        <IonPhaser game={game} initialize={initialize} />
      </div>
    )
  }
}

export default GotchiTowerDefence;
