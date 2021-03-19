import React, { Component } from 'react';

import { DataGrid } from '@material-ui/data-grid';

import aavegotchiContractAbi from '../abi/diamond.json';
import contract from '../config/aavegotchiContract.json';

import { connectToMatic } from '../util/MaticClient';

const axios = require('axios');

class Leaderboards extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modes: ['Rarity', 'Kinship', 'Experience' ], selectedMode: 0,
      rarityLeaders: [], kinshipLeaders: [], xpLeaders: []
    };

    this.handleLeaderboardSelect = this.handleLeaderboardSelect.bind(this);

    this.retrieveLeaders = this.retrieveLeaders.bind(this);

    this.retrieveRarityLeaders = this.retrieveRarityLeaders.bind(this);
    this.retrieveKinshipLeaders = this.retrieveKinshipLeaders.bind(this);
    this.retrieveXPLeaders = this.retrieveXPLeaders.bind(this);

    this.renderLeaderboard = this.renderLeaderboard.bind(this);
  }

  async componentDidMount() {
    const maticPOSClient = await connectToMatic();
    this.setState({ maticPOSClient: maticPOSClient});
    this.retrieveLeaders();
  }

  handleLeaderboardSelect(mode) {
    this.setState({ selectedMode: mode });
  }

  retrieveLeaders() {
    this.retrieveRarityLeaders();
    this.retrieveKinshipLeaders();
    this.retrieveXPLeaders();
  }

  async retrieveRarityLeaders() {
    const rarityLeaders = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: `
        {
          aavegotchis(first: 100, orderBy: modifiedRarityScore, orderDirection: desc) {
            id
            owner {
              id
            }
            portal {
              id
            }
            hauntId
            kinship
            name
            baseRarityScore
            modifiedRarityScore
            numericTraits
            experience
          }
        }`
      }
    );

    this.setState({ rarityLeaders: rarityLeaders.data.data.aavegotchis });
  }

  async retrieveKinshipLeaders() {
    const kinshipLeaders = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: `
        {
          aavegotchis(first: 100, orderBy: kinship, orderDirection: desc) {
            id
            owner {
              id
            }
            portal {
              id
            }
            hauntId
            kinship
            name
            baseRarityScore
            modifiedRarityScore
            numericTraits
            experience
          }
        }`
      }
    );

    this.setState({ kinshipLeaders: kinshipLeaders.data.data.aavegotchis });
  }

  async retrieveXPLeaders() {
    const xpLeaders = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: `
        {
          aavegotchis(first: 100, orderBy: experience, orderDirection: desc) {
            id
            owner {
              id
            }
            portal {
              id
            }
            hauntId
            kinship
            name
            baseRarityScore
            modifiedRarityScore
            numericTraits
            experience
          }
        }`
      }
    );

    this.setState({ xpLeaders: xpLeaders.data.data.aavegotchis });
  }

  renderLeaderboard() {
    let leaders = [];
    let columns = [];

    switch (this.state.selectedMode) {
      case 0:
        leaders = this.state.rarityLeaders;
        columns = [
          { field: 'rank', headerName: 'Rank', width: 90 },
          { field: 'id', headerName: 'Gotchi ID', width: 120 },
          { field: 'name', headerName: 'Name', width: 220 },
          { field: 'nrg', headerName: 'NRG', width: 90 },
          { field: 'agg', headerName: 'AGG', width: 90 },
          { field: 'spk', headerName: 'SPK', width: 90 },
          { field: 'brn', headerName: 'BRN', width: 90 },
          { field: 'eyeShape', headerName: 'ES', width: 90 },
          { field: 'eyeColor', headerName: 'EC', width: 90 },
          { field: 'kinship', headerName: 'Kinship', width: 100 },
          { field: 'experience', headerName: 'EXP', width: 90 },
          { field: 'brs', headerName: 'BRS', width: 90 },
          { field: 'modifiedRarityScore', headerName: 'MRS', width: 90 },
        ];
        break;
      case 1:
        leaders = this.state.kinshipLeaders;
        columns = [
          { field: 'rank', headerName: 'Rank', width: 90 },
          { field: 'id', headerName: 'Gotchi ID', width: 120 },
          { field: 'name', headerName: 'Name', width: 220 },
          { field: 'nrg', headerName: 'NRG', width: 90 },
          { field: 'agg', headerName: 'AGG', width: 90 },
          { field: 'spk', headerName: 'SPK', width: 90 },
          { field: 'brn', headerName: 'BRN', width: 90 },
          { field: 'eyeShape', headerName: 'ES', width: 90 },
          { field: 'eyeColor', headerName: 'EC', width: 90 },
          { field: 'experience', headerName: 'EXP', width: 90 },
          { field: 'brs', headerName: 'BRS', width: 90 },
          { field: 'modifiedRarityScore', headerName: 'MRS', width: 90 },
          { field: 'kinship', headerName: 'Kinship', width: 170 },
        ];
        break;
      case 2:
        leaders = this.state.xpLeaders;
        columns = [
          { field: 'rank', headerName: 'Rank', width: 90 },
          { field: 'id', headerName: 'Gotchi ID', width: 120 },
          { field: 'name', headerName: 'Name', width: 220 },
          { field: 'nrg', headerName: 'NRG', width: 90 },
          { field: 'agg', headerName: 'AGG', width: 90 },
          { field: 'spk', headerName: 'SPK', width: 90 },
          { field: 'brn', headerName: 'BRN', width: 90 },
          { field: 'eyeShape', headerName: 'ES', width: 90 },
          { field: 'eyeColor', headerName: 'EC', width: 90 },
          { field: 'kinship', headerName: 'Kinship', width: 100 },
          { field: 'brs', headerName: 'BRS', width: 90 },
          { field: 'modifiedRarityScore', headerName: 'MRS', width: 90 },
          { field: 'experience', headerName: 'Experience', width: 170 },
        ];
        break;
      default:
        break;
    }

    console.log('renderLeaderboard', leaders, this.state.selectedMode);

    if (leaders.length > 0) {
      let rows = [];
      leaders.map(function(aavegotchi, index){
        rows.push({
          rank: index + 1,
          id: aavegotchi.id,
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
        });
      });

      return (
        <div style={{ height: '1080px', width: '100%' }}>
          <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" />
        </div>
      );
    }
  }

  render() {
    return(
      <div>
        <h1>Aavegotchi {this.state.modes[this.state.selectedMode]} Leaderboard</h1>
        <div style={{margin: "10px"}}>
          <button className="btn btn-primary btn-sm" onClick={() => this.handleLeaderboardSelect(0)}>Rarity Leaderboard</button> <button className="btn btn-primary btn-sm" onClick={() => this.handleLeaderboardSelect(1)}>Kinship Leaderboard</button> <button className="btn btn-primary btn-sm" onClick={() => this.handleLeaderboardSelect(2)}>Experience Leaderboard</button>
        </div>
        {this.renderLeaderboard()}
      </div>
    );
  }
}

export default Leaderboards;
