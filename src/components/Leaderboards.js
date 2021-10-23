import React, { Component } from 'react';

import { DataGrid } from '@material-ui/data-grid';

import { retrieveH1Gotchis, retrieveH2Gotchis, retrieveAllGotchisAtBlock } from '../util/Graph';
import { calculateSeason2Reward } from '../util/AavegotchiMath';

import Loading from './Loading';

const axios = require('axios');
const _ = require('lodash');

class Leaderboards extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    this.state = {
      modes: ['Rarity', 'Kinship', 'Experience', 'Rookie Kinship', 'Rookie Experience' ], selectedMode: 0,
      rarityLeaders: [], kinshipLeaders: [], xpLeaders: [], rookieKinshipLeaders: [], rookieXpLeaders: [],
      loading: true,
      filter: '',
      round: 1, roundTraits: ['nrg', 'agg', 'spk', 'brn'],
      gotchis: [], h2Gotchis: [], topGotchis: []
    };

    this.handleLeaderboardSelect = this.handleLeaderboardSelect.bind(this);
    this.handleRoundToggle = this.handleRoundToggle.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);

    this.renderLeaderboard = this.renderLeaderboard.bind(this);
  }

  async componentDidMount() {
    retrieveH1Gotchis()
      .then((h1Gotchis) => {
        retrieveH2Gotchis()
          .then((h2Gotchis) => {
            let gotchis = [...h1Gotchis, ...h2Gotchis];

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

            for (var g = 0; g < h2Gotchis.length; g++) {
              h2Gotchis[g].brs = parseInt(h2Gotchis[g].baseRarityScore);
              h2Gotchis[g].mrs = parseInt(h2Gotchis[g].modifiedRarityScore);
              h2Gotchis[g].srs = parseInt(h2Gotchis[g].withSetsRarityScore);
              h2Gotchis[g].kins = parseInt(h2Gotchis[g].kinship);
              h2Gotchis[g].xp = parseInt(h2Gotchis[g].experience);
              h2Gotchis[g].nrg = parseInt(h2Gotchis[g].numericTraits[0]);
              h2Gotchis[g].agg = parseInt(h2Gotchis[g].numericTraits[1]);
              h2Gotchis[g].spk = parseInt(h2Gotchis[g].numericTraits[2]);
              h2Gotchis[g].brn = parseInt(h2Gotchis[g].numericTraits[3]);
            }

            this.setState({ gotchis, h2Gotchis, loading: false });
            this.calculateLeaders();
            this.calculateTopGotchisAndOwners();
          });
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
    let rookieKinshipLeaders = _.orderBy(this.state.h2Gotchis, ['kins', 'xp'], ['desc', 'desc']);
    let rookieExperienceLeaders = _.orderBy(this.state.h2Gotchis, ['xp', roundTrait], ['desc', 'desc']);

    console.log('rarity', rarityLeaders);
    console.log('kinship', kinshipLeaders);
    console.log('experience', experienceLeaders);
    console.log('rookie kinship', rookieKinshipLeaders);
    console.log('rookie experience', rookieExperienceLeaders);

    this.setState({ rarityLeaders, kinshipLeaders, experienceLeaders, rookieKinshipLeaders, rookieExperienceLeaders });
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
        calculateSeason2Reward(
          0, _.findIndex(_this.state.rarityLeaders, ['id', gotchi.id]) + 1
        ).toFixed(2)
      );

      let kinshipReward = parseFloat(
        calculateSeason2Reward(
          1, _.findIndex(_this.state.kinshipLeaders, ['id', gotchi.id]) + 1
        ).toFixed(2)
      );

      let experienceReward = parseFloat(
        calculateSeason2Reward(
          2, _.findIndex(_this.state.experienceLeaders, ['id', gotchi.id]) + 1
        ).toFixed(2)
      );

      let rookieKinshipReward = 0;
      let rookieExperiencReward = 0;

      if (_.findIndex(_this.state.h2Gotchis, ['id', gotchi.id]) != -1) {
        rookieKinshipReward = parseFloat(
          calculateSeason2Reward(
            3, _.findIndex(_this.state.rookieKinshipLeaders, ['id', gotchi.id]) + 1
          ).toFixed(2)
        );

        rookieExperiencReward = parseFloat(
          calculateSeason2Reward(
            4, _.findIndex(_this.state.rookieExperienceLeaders, ['id', gotchi.id]) + 1
          ).toFixed(2)
        );
      }

      topGotchis.push({
        id: gotchi.id,
        name: gotchi.name,
        rarityReward: rarityReward,
        kinshipReward: kinshipReward,
        experienceReward: experienceReward,
        rookieKinshipReward: rookieKinshipReward,
        rookieExperiencReward: rookieExperiencReward,
        totalReward: parseFloat((rarityReward+kinshipReward+experienceReward+rookieKinshipReward+rookieExperiencReward).toFixed(2)),
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
        { field: 'rarityReward', headerName: 'SZN2 RARITY', width: 140 },
        { field: 'kinshipReward', headerName: 'SZN2 KIN', width: 140 },
        { field: 'experienceReward', headerName: 'SZN2 XP', width: 140 },
        { field: 'rookieKinshipReward', headerName: 'SZN2 H2 KIN', width: 140 },
        { field: 'rookieExperiencReward', headerName: 'SZN2 H2 XP', width: 140 },
        { field: 'totalReward', headerName: 'SZN2 Total', width: 140 },
      ];

      let rows = [];
      this.state.topGotchis.map(function(gotchi, index){
        let row = gotchi;
        row.rank = index + 1;
        rows.push(row);
      });

      return (
        <div>
          <div>
            <h2>Top Gotchis By Total Projected SZN2 Rewards</h2>
          </div>
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
        { field: 'totalReward', headerName: 'SZN 2 Total Rewards', width: 220 },
      ];

      let rows = [];
      this.state.topOwners.map(function(owner, index){
        let row = owner;
        row.rank = index + 1;
        rows.push(owner);
      });

      return (
        <div>
          <h2>Top Owners By Total Projected SZN2 Rewards</h2>
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
      { field: 'reward', headerName: 'SZN 2 Reward', width: 150 },
      { field: 'roundReward', headerName: 'Round Reward', width: 150 },
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
      { field: 'brs', headerName: 'BRS', width: 110 },
      { field: 'modifiedRarityScore', headerName: 'MRS', width: 110 },
      { field: 'wrs', headerName: 'WSRS', width: 110 },
      { field: 'kinship', headerName: 'KIN', width: 110 },
      { field: 'experience', headerName: 'XP', width: 110 },
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
      case 3:
        leaders = this.state.rookieKinshipLeaders;
        break;
      case 4:
        leaders = this.state.rookieExperienceLeaders;
        break;
      default:
        break;
    }

    console.log('renderLeaderboard', leaders, this.state.selectedMode);

    if (leaders.length > 0) {
      let rows = [];
      leaders.map(function(aavegotchi, index){
        if (_this.filterGotchi(aavegotchi)) {
          let reward = parseFloat(calculateSeason2Reward(_this.state.selectedMode, index + 1));
          let row = {
            rank: index + 1,
            id: aavegotchi.id,
            reward: reward.toFixed(2),
            roundReward: (reward/4).toFixed(2),
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
        <p>BRS = Base Rarity, MRS = Rarity Factoring in Wearables, WSRS = Rarity Factoring in Wearables and Wearable Sets</p>
        <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
        </div>
      );
    }
  }

  renderFilter() {
    if (this.state.gotchis.length > 0) {
      return(
        <div>
          <p><b>Filter Aavegotchis in Leaderboard</b></p>
          <div className="form-group">
            <input type="text" id="filter" className="form-control" value={this.state.filter} onChange={this.onFilterChange} placeholder="Filter by Owner, Name or Gotchi Id" /><br />
          </div>
        </div>
      );
    }
  }

  render() {
    return(
      <div>
        <h1>Aavegotchi Leaderboards</h1>
        <p>NOTE: there are some discrepencies between these leaderboards and the <a href='https://aavegotchi.com/leaderboard'>official SZN2 rarity farming leaderboard</a>. Please treat the official leaderboard as the source of truth.</p>
        <h2>{this.state.modes[this.state.selectedMode]} Leaderboard</h2>
        <div>
          <button style={{margin: "2px"}} className="btn btn-primary btn-sm" onClick={() => this.handleLeaderboardSelect(0)}>Rarity</button>
          <button style={{margin: "2px"}} className="btn btn-primary btn-sm" onClick={() => this.handleLeaderboardSelect(1)}>Kinship</button>
          <button style={{margin: "2px"}} className="btn btn-primary btn-sm" onClick={() => this.handleLeaderboardSelect(2)}>Experience</button>
          <button style={{margin: "2px"}} className="btn btn-primary btn-sm" onClick={() => this.handleLeaderboardSelect(3)}>Rookie Kinship</button>
          <button style={{margin: "2px"}} className="btn btn-primary btn-sm" onClick={() => this.handleLeaderboardSelect(4)}>Rookie Experience</button>
          <button style={{margin: "2px"}} className="btn btn-primary btn-sm" onClick={() => this.handleRoundToggle()}>Tie Breaker Trait: Round {this.state.round} {this.state.roundTraits[this.state.round-1].toUpperCase()}</button>
        </div>
        {this.state.loading &&
          <Loading message="Loading Aavegotchis from TheGraph..." />
        }
        {this.renderFilter()}
        {this.renderLeaderboard()}
        {this.renderTopGotchis()}
        {this.renderTopOwners()}
        <p>Important Links: <a href='https://aavegotchi.com/leaderboard'>Official leaderboard</a> <a href='https://aavegotchi.medium.com/rarity-farming-season-2-is-coming-dates-announced-7047896eb3ab'>SZN2 rarity farming rewards structure</a></p>
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
