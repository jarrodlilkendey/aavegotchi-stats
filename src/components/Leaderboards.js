import React, { Component } from 'react';

import { DataGrid } from '@material-ui/data-grid';

import { retrieveH1Gotchis, retrieveH2Gotchis, retrieveAllGotchisAtBlock } from '../util/Graph';
import { calculateSeason1Reward } from '../util/AavegotchiMath';

import Loading from './Loading';

const axios = require('axios');
const _ = require('lodash');

class Leaderboards extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    this.state = {
      modes: ['Rarity', 'Kinship', 'Experience' ], selectedMode: 0,
      rarityLeaders: [], kinshipLeaders: [], xpLeaders: [],
      loading: true,
      filter: '',
      round: 1, roundTraits: ['nrg', 'agg', 'spk', 'brn'],
    };

    this.handleLeaderboardSelect = this.handleLeaderboardSelect.bind(this);
    this.handleRoundToggle = this.handleRoundToggle.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);

    this.renderLeaderboard = this.renderLeaderboard.bind(this);
  }

  async componentDidMount() {
    retrieveH1Gotchis()
    // retrieveAllGotchisAtBlock(14645055)
    // retrieveAllGotchisAtBlock(14082019)
      .then((gotchis) => {
        for (var g = 0; g < gotchis.length; g++) {
          gotchis[g].brs = parseInt(gotchis[g].baseRarityScore);
          gotchis[g].mrs = parseInt(gotchis[g].modifiedRarityScore);
          gotchis[g].srs = parseInt(gotchis[g].withSetsRarityScore);
          gotchis[g].kins = parseInt(gotchis[g].kinship);
          gotchis[g].xp = parseInt(gotchis[g].experience);
          gotchis[g].nrg = parseInt(gotchis[g].numericTraits[0]);
          gotchis[g].agg = parseInt(gotchis[g].numericTraits[1]);
          gotchis[g].spk = parseInt(gotchis[g].numericTraits[2]);
          gotchis[g].brn = parseInt(gotchis[g].numericTraits[3]);
        }

        this.setState({ gotchis, loading: false });
        this.calculateLeaders();
        this.calculateTopGotchisAndOwners();
      });
  }

  handleLeaderboardSelect(mode) {
    this.setState({ selectedMode: mode });
  }

  handleRoundToggle() {
    let newRound = this.state.round + 1;
    if (newRound == 5) {
      newRound = 1;
    }
    this.setState({ round: newRound });

    this.calculateLeaders();
  }

  onFilterChange(event) {
    event.preventDefault();
    this.setState({ filter: event.target.value });
  }

  calculateLeaders() {
    let rarityLeaders = _.orderBy(this.state.gotchis, ['srs', 'kins', 'xp'], ['desc', 'desc', 'desc']);
    let kinshipLeaders = _.orderBy(this.state.gotchis, ['kins', 'xp'], ['desc', 'desc']);
    let roundTrait = Math.abs(50 - this.state.roundTraits[this.state.round - 1]); // roundTrait is difference from 50
    let experienceLeaders = _.orderBy(this.state.gotchis, ['xp', roundTrait], ['desc', 'desc']);

    console.log('rarity', rarityLeaders);
    console.log('kinship', kinshipLeaders);
    console.log('experience', experienceLeaders);

    this.setState({ rarityLeaders, kinshipLeaders, experienceLeaders });
  }

  filterGotchi(aavegotchi) {
    let filter = this.state.filter.toLowerCase();

    // ignore blank filter
    if (filter.length == 0) {
      return true;
    }

    // owner address filter
    if (filter.startsWith('0x')) {
      if (aavegotchi.owner.id.toLowerCase().startsWith(filter)) {
        return true;
      } else {
        return false;
      }
    }

    // id filter
    if (!isNaN(filter)) {
      if (aavegotchi.id == filter) {
        return true;
      } else {
        return false;
      }
    }

    // name filter
    if (aavegotchi.name.toLowerCase().startsWith(filter)) {
      return true;
    }

    return false;
  }

  calculateTopGotchisAndOwners() {
    const _this = this;
    let topGotchis = [];

    this.state.gotchis.map(function(gotchi, index){
      let rarityReward = parseFloat(
        calculateSeason1Reward(
          0, _.findIndex(_this.state.rarityLeaders, ['id', gotchi.id]) + 1
        ).toFixed(2)
      );

      let kinshipReward = parseFloat(
        calculateSeason1Reward(
          1, _.findIndex(_this.state.kinshipLeaders, ['id', gotchi.id]) + 1
        ).toFixed(2)
      );

      let experienceReward = parseFloat(
        calculateSeason1Reward(
          2, _.findIndex(_this.state.experienceLeaders, ['id', gotchi.id]) + 1
        ).toFixed(2)
      );

      topGotchis.push({
        id: gotchi.id,
        name: gotchi.name,
        rarityReward: rarityReward,
        kinshipReward: kinshipReward,
        experienceReward: experienceReward,
        totalReward: parseFloat((rarityReward+kinshipReward+experienceReward).toFixed(2)),
        owner: gotchi.owner.id
      });
    });

    topGotchis = _.orderBy(topGotchis, ['totalReward'], ['desc']);
    this.setState({ topGotchis });

    let topOwners = {};
    this.state.topGotchis.map(function(gotchi, index) {
      if (!topOwners.hasOwnProperty(gotchi.owner)) {
        topOwners[gotchi.owner] = {
          gotchiCount: 1,
          totalReward: parseFloat(gotchi.totalReward.toFixed(2)),
          id: gotchi.owner,
        };
      } else {
        topOwners[gotchi.owner].gotchiCount++;
        topOwners[gotchi.owner].totalReward = parseFloat((topOwners[gotchi.owner].totalReward + gotchi.totalReward).toFixed(2));
      }
    });

    let topOwnersList = [];
    Object.keys(topOwners).map(function(key, index) {
      topOwnersList.push(topOwners[key]);
    })
    topOwnersList = _.orderBy(topOwnersList, ['totalReward'], ['desc']);

    console.log(topGotchis);
    console.log(topOwnersList);

    this.setState({ topOwners: topOwnersList });
  }

  renderTopGotchis() {
    if (this.state.topGotchis && this.state.topGotchis.length > 0) {
      let columns = [
        { field: 'rank', headerName: 'Rank', width: 90 },
        {
          field: 'id',
          headerName: 'Gotchi ID',
          width: 120,
          renderCell: (params: GridCellParams) => (
            <a href={`https://aavegotchi.com/gotchi/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'name', headerName: 'Name', width: 240 },
        { field: 'rarityReward', headerName: 'SZN 1 Rarity Reward', width: 220 },
        { field: 'kinshipReward', headerName: 'SZN 1 Kinship Reward', width: 220 },
        { field: 'experienceReward', headerName: 'SZN 1 Experience Reward', width: 220 },
        { field: 'totalReward', headerName: 'SZN 1 Total Rewards', width: 220 },
      ];

      let rows = [];
      this.state.topGotchis.map(function(gotchi, index){
        let row = gotchi;
        row.rank = index + 1;
        rows.push(row);
      });

      return (
        <div>
          <h2>Top Gotchis By Total Projected Rewards</h2>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
          </div>
        </div>
      );
    }
  }

  renderTopOwners() {
    if (this.state.topOwners && this.state.topGotchis.length > 0) {
      let columns = [
        { field: 'rank', headerName: 'Rank', width: 90 },
        { field: 'id', headerName: 'Owner', width: 420 },
        { field: 'gotchiCount', headerName: 'Aavegotchi Count', width: 180 },
        { field: 'totalReward', headerName: 'SZN 1 Total Rewards', width: 220 },
      ];

      let rows = [];
      this.state.topOwners.map(function(owner, index){
        let row = owner;
        row.rank = index + 1;
        rows.push(owner);
      });

      return (
        <div>
          <h2>Top Owners By Total Projected Rewards</h2>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
          </div>
        </div>
      );
    }
  }

  renderLeaderboard() {
    const _this = this;

    let leaders = [];
    let columns = [
      { field: 'rank', headerName: 'Rank', width: 90 },
      { field: 'reward', headerName: 'SZN 1 Reward', width: 150 },
      {
        field: 'id',
        headerName: 'Gotchi ID',
        width: 120,
        renderCell: (params: GridCellParams) => (
          <a href={`https://aavegotchi.com/gotchi/${params.value}`} target="_blank">
            {params.value}
          </a>
        )
      },
      { field: 'name', headerName: 'Name', width: 240 },
      { field: 'brs', headerName: 'Base Rarity Score', width: 200 },
      { field: 'modifiedRarityScore', headerName: 'Modified Rarity Score', width: 200 },
      { field: 'wrs', headerName: 'With Sets Rarity Score', width: 200 },
      { field: 'kinship', headerName: 'Kinship', width: 160 },
      { field: 'experience', headerName: 'Experience', width: 160 },
    ];

    switch (this.state.selectedMode) {
      case 0:
        leaders = this.state.rarityLeaders;
        break;
      case 1:
        leaders = this.state.kinshipLeaders;
        break;
      case 2:
        leaders = this.state.experienceLeaders;
        break;
      default:
        break;
    }

    console.log('renderLeaderboard', leaders, this.state.selectedMode);

    if (leaders.length > 0) {
      let rows = [];
      leaders.map(function(aavegotchi, index){
        if (_this.filterGotchi(aavegotchi)) {
          let row = {
            rank: index + 1,
            id: aavegotchi.id,
            reward: parseFloat(calculateSeason1Reward(_this.state.selectedMode, index + 1).toFixed(2)),
            name: aavegotchi.name,
            nrg: aavegotchi.numericTraits[0],
            agg: aavegotchi.numericTraits[1],
            spk: aavegotchi.numericTraits[2],
            brn: aavegotchi.numericTraits[3],
            eyeShape: aavegotchi.numericTraits[4],
            eyeColor: aavegotchi.numericTraits[5],
            kinship: aavegotchi.kinship,
            experience: aavegotchi.experience,
            brs: aavegotchi.baseRarityScore,
            modifiedRarityScore: aavegotchi.modifiedRarityScore,
            owner: aavegotchi.owner.id,
            wrs: aavegotchi.withSetsRarityScore,
          };

          rows.push(row);
        }
      });

      return (
        <div style={{ height: '1080px', width: '100%' }}>
          <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
        </div>
      );
    }
  }

  render() {
    return(
      <div>
        <h1>Aavegotchi Leaderboards</h1>
        <h2>{this.state.modes[this.state.selectedMode]} Leaderboard</h2>
        <p>NOTE: this page has not been updated for season 2 rewards, it will be updated when rewards structure is confirmed.</p>
        <div style={{margin: "10px"}}>
          <button className="btn btn-primary btn-sm" onClick={() => this.handleLeaderboardSelect(0)}>Rarity Leaderboard</button> <button className="btn btn-primary btn-sm" onClick={() => this.handleLeaderboardSelect(1)}>Kinship Leaderboard</button> <button className="btn btn-primary btn-sm" onClick={() => this.handleLeaderboardSelect(2)}>Experience Leaderboard</button> <button className="btn btn-primary btn-sm" onClick={() => this.handleRoundToggle()}>Tie Breaker Trait: Round {this.state.round} {this.state.roundTraits[this.state.round-1].toUpperCase()}</button>
        </div>
        <div>
          <p><b>Filter Aavegotchis in Leaderboard</b></p>
          <div className="form-group">
            <input type="text" id="filter" className="form-control" value={this.state.filter} onChange={this.onFilterChange} placeholder="Filter by Owner, Name or Gotchi Id" /><br />
          </div>
        </div>
        {/*this.state.loading &&
          <Loading message="Loading Aavegotchis from TheGraph..." />
        */}
        {/*this.renderLeaderboard()*/}
        {/*this.renderTopGotchis()*/}
        {/*this.renderTopOwners()*/}
      </div>
    );
  }
}

export default Leaderboards;

// https://www.lpga.com/tournaments/lpga-drive-on-championship-ocala/results
// select an aavegotchi name and expand to see svg
// button to make an offer
// offer will persist on website, user with address holding aavegotchi can search for offers using their address
// shows offers to all their listings
// erc721/ERC1155 escrow contract for trades

// winner for rarity farming
// winner for Kinship
// show kinship potions for sale
// show high kinship gotchis for sale
// show high rarity gotchies for sale
// show xp potions for sale
// show high xp gotchies for sale
