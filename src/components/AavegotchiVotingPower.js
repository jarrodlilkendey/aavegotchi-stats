import React, { Component } from 'react';

import { DataGrid } from '@material-ui/data-grid';

import aavegotchiContractAbi from '../abi/diamond.json';

import contract from '../config/aavegotchiContract.json';

import { connectToMatic } from '../util/MaticClient';
import { calculatePortalBRS, wearableTraitModifiers, wearableBRSModifierLabel, wearableBRSModifier } from '../util/AavegotchiMath';

import wearableItemTypes from '../data/wearables/wearables.json';

const _ = require('lodash');
const axios = require('axios');

class AavegotchiVotingPower extends Component {
  constructor(props) {
    super(props);

    this.state = {
      address: ''
    };

    document.title = this.props.title;

    this.onAddressChange = this.onAddressChange.bind(this);

    this.getHoldings = this.getHoldings.bind(this);
    this.calculateVotingPower = this.calculateVotingPower.bind(this);
  }

  componentDidMount() {
    const maticPOSClient = connectToMatic();
    this.setState({ maticPOSClient: maticPOSClient});
  }

  onAddressChange(event) {
    event.preventDefault();
    this.setState({ address: event.target.value });
  }

  async tokenBalances() {
    const tokenAbi = [
      {
        constant: true,
        inputs: [
          {
            internalType: 'address',
            name: 'account',
            type: 'address'
          }
        ],
        name: 'balanceOf',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256'
          }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [],
        name: 'totalSupply',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256'
          }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      },
      {
        constant: true,
        inputs: [
          {
            internalType: 'address',
            name: '_account',
            type: 'address'
          }
        ],
        name: 'staked',
        outputs: [
          {
            internalType: 'uint256',
            name: 'ghst_',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'poolTokens_',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'ghstUsdcPoolToken_',
            type: 'uint256'
          }
        ],
        payable: false,
        stateMutability: 'view',
        type: 'function'
      }
    ];

    const ghstTokenContract = new this.state.maticPOSClient.web3Client.web3.eth.Contract(tokenAbi, '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7');
    const ghstBalance = await ghstTokenContract.methods.balanceOf(this.state.address).call();

    const stkGhstTokenContract = new this.state.maticPOSClient.web3Client.web3.eth.Contract(tokenAbi, '0xA02d547512Bb90002807499F05495Fe9C4C3943f');
    const stkGhstBalance = await stkGhstTokenContract.methods.staked(this.state.address).call();

    let tokenBalances = { };
    tokenBalances = {
      ghst: (ghstBalance / 1000000000000000000).toFixed(8),
      stkGhst: (parseFloat(stkGhstBalance.ghst_) / 1000000000000000000).toFixed(8),
    };

    this.setState({ tokenBalances: tokenBalances });
  }

  renderVotingPower() {
    if (this.state.votingPower) {
      return(
        <div>
          <h3>Voting Power Summary</h3>
          <ul>
            <li>Weighted GHST and Closed Portal Voting Power: {this.state.votingPower.qGHST}</li>
            <li>Unweighted Open Portal Voting Power: {this.state.votingPower.openPortals}</li>
            <li>Unweighted Gotchis Voting Power: {this.state.votingPower.gotchis}</li>
            <li>Unweighted Inventory Wearable Voting Power: {this.state.votingPower.wearables}</li>
            <li>Unweighted Consumable Voting Power: {this.state.votingPower.consumables}</li>
            <li>Total Weighted Voting Power: {this.state.votingPower.total}</li>
          </ul>
        </div>
      );
    }
  }

  totalVotingPower() {
    const _this = this;

    let ghst = parseFloat(this.state.tokenBalances.ghst);
    let stkGhst = parseFloat(this.state.tokenBalances.stkGhst);
    let closedPortalCount = this.state.aavegotchiHoldings.closedPortals.length;

    let qGHST = Math.sqrt((ghst + stkGhst) + (closedPortalCount * 100));

    let openPortals = 0;
    Object.keys(this.state.openPortalTopBRS).map(function(brs, index) {
      openPortals += _this.state.openPortalTopBRS[brs];
    });

    let gotchis = 0;
    this.state.aavegotchiHoldings.aavegotchis.map(function(g, i) {
      let brs = parseInt(g.baseRarityScore);
      let mrs = parseInt(g.modifiedRarityScore);
      let level = parseInt(g.level);
      let vp = mrs * (1 + (Math.floor(level/3) * .03));
      gotchis += vp;
    });

    let wearables = 0;
    Object.keys(this.state.wearables).map(function(itemId, index) {
      let quantity = _this.state.wearables[itemId].quantity;
      let item = wearableItemTypes[itemId];
      let wearableBRS = wearableBRSModifier(item.maxQuantity);
      let wearableTrait = 0;
      item.traitModifiers.map(function(t, i) {
        wearableTrait += Math.abs(parseInt(t)) * quantity;
      });
      wearables += (wearableTrait * wearableBRS);
    });

    let consumables = 0;
    Object.keys(this.state.consumables).map(function(itemId, index) {
      let consumable = _this.state.consumables[itemId];
      consumables += (Math.abs(consumable.consumableStat) * consumable.quantity);
    });

    let votingPower = {};
    votingPower.qGHST = qGHST;
    votingPower.openPortals = openPortals;
    votingPower.gotchis = gotchis;
    votingPower.wearables = wearables;
    votingPower.consumables = consumables;
    votingPower.total = qGHST + Math.sqrt(openPortals + gotchis + wearables + consumables);

    console.log('votingPower', votingPower);

    this.setState({ votingPower });
  }

  async getHoldings(aavegotchiContract) {
    const _this = this;

    // get portal / aavegotchi holdings
    aavegotchiContract.methods.allAavegotchisOfOwner(this.state.address).call().then(function (myAavegotchis) {
      console.log(myAavegotchis);
      _this.setState({ myAavegotchis: myAavegotchis });

      let aavegotchiHoldings = {};

      let closedPortals = _.filter(myAavegotchis, ['status', '0']);
      aavegotchiHoldings.closedPortals = {};
      aavegotchiHoldings.closedPortals = closedPortals;

      const openPortals = _.filter(myAavegotchis, ['status', '2']);
      aavegotchiHoldings.openPortals = openPortals;

      let openPortalTopBRS = {};
      for (var p = 0; p < aavegotchiHoldings.openPortals.length; p++) {
        let portal = aavegotchiHoldings.openPortals[p];
        aavegotchiContract.methods.portalAavegotchiTraits(portal.tokenId).call().then(function (portalAavegotchis) {
          let topBRS = calculatePortalBRS(portalAavegotchis);
          openPortalTopBRS[portal.tokenId] = topBRS;
        }).catch(function (e) {
          console.log(e);
        });
      }
      _this.setState(
        { openPortalTopBRS }
      );

      const aavegotchis = _.filter(myAavegotchis, ['status', '3']);
      aavegotchiHoldings.aavegotchis = aavegotchis;
      aavegotchiHoldings.aavegotchiItems = {..._this.getAavegotchiItems(aavegotchis)};

      console.log(aavegotchiHoldings);

      let wearables = { };
      let consumables = { };

      // get items from inventory (excludes items assigned to an aavegotchi - even if unequipped)
      aavegotchiContract.methods.itemBalancesWithTypes(_this.state.address).call().then(function (myItems) {
        console.log(myItems);

        myItems.map(function(item, index) {
          if (item.itemId == '126' || item.itemId == '127' || item.itemId == '128' || item.itemId == '129') {
            if (consumables.hasOwnProperty(item.itemId)) {
              consumables[item.itemId].quantity += parseInt(item.balance);
            } else {
              let consumableStat = 0;
              let consumableStatText = '';
              if (item.itemId == '126') {
                consumableStat = 2;
                consumableStatText = '+2 to Kinship';
              } else if (item.itemId == '127') {
                consumableStat = 10;
                consumableStatText = '+10 to Kinship';
              } else if (item.itemId == '128') {
                consumableStat = 20;
                consumableStatText = '+20 to XP';
              } else if (item.itemId == '129') {
                consumableStat = 50;
                consumableStatText = '+50 to XP';
              }

              consumables[item.itemId] = {
                quantity: parseInt(item.balance),
                name: item.itemType.name,
                consumableStat: consumableStat,
                consumableStatText: consumableStatText
              } ;
            }
          } else {
            if (wearables.hasOwnProperty(item.itemId)) {
              wearables[item.itemId].quantity += parseInt(item.balance);
            } else {
              wearables[item.itemId] = { quantity: parseInt(item.balance), name: item.itemType.name } ;
            }
          }
        });

        _this.setState(
          { aavegotchiHoldings, wearables, consumables },
          () => {
            _this.totalVotingPower();
          }
        );
      }).catch(function (error) {
        console.log(error);
      });
    }).catch(function (error) {
      console.log(error);
    });
  }

  async calculateVotingPower(event) {
    event.preventDefault();

    const aavegotchiContract = new this.state.maticPOSClient.web3Client.web3.eth.Contract(aavegotchiContractAbi, contract.address);

    await this.tokenBalances();

    this.getHoldings(aavegotchiContract);
  }

  getAavegotchiItems(aavegotchis) {
    let items = { };

    aavegotchis.map(function(a, index) {
      a.items.map(function (item, index) {
        if (items.hasOwnProperty(item.itemId)) {
          items[item.itemId].quantity += parseInt(item.balance);
        } else {
          items[item.itemId] = { quantity: parseInt(item.balance), name: item.itemType.name } ;
        }
      });
    });

    return items;
  }

  renderAssets() {
    console.log('renderAssets', this.state);
    const _this = this;
    if (this.state.tokenBalances && this.state.aavegotchiHoldings && this.state.wearables && this.state.consumables) {
      const columns = [
        { field: 'id', headerName: 'Name', width: 200 },
        { field: 'category', headerName: 'Category', width: 120 },
        { field: 'quantity', headerName: 'QTY', width: 120 },
        { field: 'baseRarityScore', headerName: 'BRS', width: 90 },
        { field: 'modifiedRarityScore', headerName: 'MRS', width: 90 },
        { field: 'level', headerName: 'LVL', width: 90 },
        { field: 'traitModifiers', headerName: 'Trait Modifiers', width: 200 },
        { field: 'rarityModifier', headerName: 'Rarity Modifiers', width: 200 },
        { field: 'consumableStatText', headerName: 'Consumable Stat', width: 200 },
        // { field: 'votingPower', headerName: 'Voting Power', width: 220 },
      ];

      let rows = [];
      rows.push(
        { category: 'ERC20', id: 'GHST', quantity: this.state.tokenBalances.ghst },
        { category: 'ERC20', id: 'STK GHST', quantity: this.state.tokenBalances.stkGhst },
      );

      this.state.aavegotchiHoldings.closedPortals.map(function(closedPortal, index) {
        let row = {
          id: `Closed Portal (${closedPortal.tokenId})`,
          category: 'ERC721',
          // votingPower: 100
        };

        rows.push(row);
      });

      this.state.aavegotchiHoldings.openPortals.map(function(openPortal, index) {
        let row = {
          id: `Open Portal (${openPortal.tokenId})`,
          category: 'ERC721',
          baseRarityScore: _this.state.openPortalTopBRS[openPortal.tokenId],
          // votingPower: _this.state.openPortalTopBRS[openPortal.tokenId]
        };

        rows.push(row);
      });

      this.state.aavegotchiHoldings.aavegotchis.map(function(aavegotchi, index) {
        let brs = parseInt(aavegotchi.baseRarityScore);
        let mrs = parseInt(aavegotchi.modifiedRarityScore);
        let level = parseInt(aavegotchi.level);
        // let vp = mrs * (1 + (Math.floor(level/3) * .03));

        let row = {
          id: `${aavegotchi.name} (${aavegotchi.tokenId})`,
          category: 'ERC721',
          baseRarityScore: brs,
          modifiedRarityScore: mrs,
          level: level,
          // votingPower:vp
        };

        rows.push(row);
      });

      // Object.keys(this.state.aavegotchiHoldings.aavegotchiItems).map(function(itemId, index) {
      //   let item = wearableItemTypes[itemId];
      //   let row = {
      //     id: `Equipped ${item.name}`,
      //     category: 'ERC1155',
      //     quantity: _this.state.aavegotchiHoldings.aavegotchiItems[itemId].quantity,
      //     traitModifiers: wearableTraitModifiers(item.traitModifiers),
      //     rarityModifier: wearableBRSModifierLabel(item.maxQuantity),
      //     votingPower:0
      //   };
      //
      //   rows.push(row);
      // });

      Object.keys(this.state.wearables).map(function(itemId, index) {
        let item = wearableItemTypes[itemId];
        let wearableBRS = wearableBRSModifier(item.maxQuantity);
        // let wearableTrait = 0;
        //
        // item.traitModifiers.map(function(t, i) {
        //   wearableTrait += Math.abs(parseInt(t));
        // });

        let row = {
          id: `Inventory ${item.name}`,
          category: 'ERC1155',
          quantity: _this.state.wearables[itemId].quantity,
          traitModifiers: wearableTraitModifiers(item.traitModifiers),
          rarityModifier: wearableBRSModifierLabel(item.maxQuantity),
          // votingPower: wearableBRS + wearableTrait
        };

        rows.push(row);
      });

      Object.keys(this.state.consumables).map(function(itemId, index) {
        let consumable = _this.state.consumables[itemId];

        let row = {
          id: `Inventory ${consumable.name}`,
          category: 'ERC1155',
          quantity: consumable.quantity,
          consumableStatText: consumable.consumableStatText
        };

        rows.push(row);
      });

      return(
        <div>
          <h3>Assets</h3>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
          </div>
        </div>
      );
    }
  }

  render() {
    return(
      <div>
        <h2>Aavegotchi Voting Power</h2>
        <h3>Enter Aavegotchi Account</h3>
        <form className="row g-3" onSubmit={this.calculateVotingPower}>
          <div className="col-12">
            <label htmlFor="account" className="form-label">Account</label>
            <input type="text" className="form-control" id="account" placeholder="Account" value={this.state.address} onChange={this.onAddressChange} />
          </div>
          <div class="col-12">
            <button type="submit" class="btn btn-primary">Calculate Aavegotchi Voting Power</button>
          </div>
        </form>
        {this.renderVotingPower()}
        {this.renderAssets()}
      </div>
    );
  }
}

export default AavegotchiVotingPower;
