// portal ownership by account
// aavegotchi ownership by account
// myth eye ownership by account
// wearable ownership by account
// ticket ownership by account
// warning on ownership, the same person may have multiple accounts

// total portal owners vs h1 and h2 portal owners
// top 10 total portal owners vs h1 portal owners
// cumulative kinship by account
// cumulative xp by account

import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { DataGrid } from '@material-ui/data-grid';

import { retrieveH1Portals, retrieveH2Portals, retrieveH1OpenPortals, retrieveH2OpenPortals, retrieveSacrificedGotchis, retrieveErc721ListingsByTokenIds } from '../util/Graph';
import { graphAddressToCollateral } from '../util/Collateral';
import { formatGhst } from '../util/AavegotchiMath';

import Loading from './Loading';

const _ = require('lodash');
const axios = require('axios');

class Ownership extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    this.state = {
      h1Portals: [],
      h1SacrificedGotchis: [],

      h2Portals: [],
      h2SacrificedGotchis: [],

      loading: true,
    };
  }

  async componentDidMount() {
    retrieveH1Portals()
      .then((h1Portals) => {
        retrieveH2Portals()
          .then((h2Portals) => {
            let h1UniqueOwners = {};
            let h2UniqueOwners = {};
            let allUniqueOwners = {};
            _.reject(h1Portals, ['owner.id', '0x0000000000000000000000000000000000000000']).map((portal) => {
              if (h1UniqueOwners[portal.owner.id]) {
                h1UniqueOwners[portal.owner.id]++;
              } else {
                h1UniqueOwners[portal.owner.id] = 1;
              }

              if (allUniqueOwners[portal.owner.id]) {
                allUniqueOwners[portal.owner.id]++;
              } else {
                allUniqueOwners[portal.owner.id] = 1;
              }
            });

            _.reject(h2Portals, ['owner.id', '0x0000000000000000000000000000000000000000']).map((portal) => {
              if (h2UniqueOwners[portal.owner.id]) {
                h2UniqueOwners[portal.owner.id]++;
              } else {
                h2UniqueOwners[portal.owner.id] = 1;
              }

              if (allUniqueOwners[portal.owner.id]) {
                allUniqueOwners[portal.owner.id]++;
              } else {
                allUniqueOwners[portal.owner.id] = 1;
              }
            });

            let h1Owners = Object.keys(h1UniqueOwners).map(key => ({ key, portalCount: h1UniqueOwners[key] }));
            h1Owners = _.orderBy(h1Owners, ['portalCount'], ['desc']);
            console.log('h1Owners', h1Owners);

            let h2Owners = Object.keys(h2UniqueOwners).map(key => ({ key, portalCount: h2UniqueOwners[key] }));
            h2Owners = _.orderBy(h2Owners, ['portalCount'], ['desc']);
            console.log('h2Owners', h2Owners);

            let allOwners = Object.keys(allUniqueOwners).map(key => ({ key, portalCount: allUniqueOwners[key] }));
            allOwners = _.orderBy(allOwners, ['portalCount'], ['desc']);
            console.log('allOwners', allOwners);

            this.setState({ h1Portals, h2Portals, loading: false });
          });
      });
  }

  renderSummary() {
    if (this.state.h1SummaryStats && this.state.h2SummaryStats) {
      let totalPortals = this.state.h1SummaryStats.portalsCount + this.state.h2SummaryStats.portalsCount;
      let totalPortalsOpened = this.state.h1SummaryStats.openedCount + this.state.h2SummaryStats.openedCount;
      let totalPortalsClaimed = this.state.h1SummaryStats.claimedCount + this.state.h2SummaryStats.claimedCount;
      let totalSacrificedGotchis = this.state.h1SacrificedGotchis.length + this.state.h2SacrificedGotchis.length;
      let totalLiveGotchis = totalPortalsClaimed - totalSacrificedGotchis;

      let allPortals = [...this.state.h1Portals, ...this.state.h2Portals];
      let totalUniqueOwners =  _.uniqBy(_.reject(allPortals, ['owner.id', '0x0000000000000000000000000000000000000000']), 'owner.id').length;

      return (
        <div>
          <h2>Summary</h2>
          <h3>Haunt 1 Summary</h3>
          <p>Total H1 Portals: {this.state.h1SummaryStats.portalsCount}</p>
          <p>Total H1 Portals Opened: {this.state.h1SummaryStats.openedCount}</p>
          <p>Total H1 Portals Claimed: {this.state.h1SummaryStats.claimedCount}</p>
          <p>Total H1 Aavegotchis Sacrificed: <a href='https://polygonscan.com/token/0x86935f11c86623dec8a25696e1c19a8659cbf95d?a=0x0000000000000000000000000000000000000000#inventory'>{this.state.h1SacrificedGotchis.length}</a></p>
          <p>Total H1 Unique Owners: {this.state.h1SummaryStats.uniqueOwners}</p>
          <h3>Haunt 2 Summary</h3>
          <p>Total H2 Portals: {this.state.h2SummaryStats.portalsCount}</p>
          <p>Total H2 Portals Opened: {this.state.h2SummaryStats.openedCount}</p>
          <p>Total H2 Portals Claimed: {this.state.h2SummaryStats.claimedCount}</p>
          <p>Total H2 Aavegotchis Sacrificed: <a href='https://polygonscan.com/token/0x86935f11c86623dec8a25696e1c19a8659cbf95d?a=0x0000000000000000000000000000000000000000#inventory'>{this.state.h2SacrificedGotchis.length}</a></p>
          <p>Total H2 Unique Owners: {this.state.h2SummaryStats.uniqueOwners}</p>
          <h3>Overall Summary</h3>
          <p>Total Portals: {totalPortals}</p>
          <p>Total Portals Opened: {totalPortalsOpened}</p>
          <p>Total Portals Claimed: {totalPortalsClaimed}</p>
          <p>Total Aavegotchis Sacrificed: {totalSacrificedGotchis}</p>
          <p>Total Live Aavegotchis: {totalLiveGotchis}</p>
          <p>Total Unique Owners: {totalUniqueOwners}</p>
        </div>
      )
    }
  }

  render() {
    return(
      <div>
        <h1>Aavegotchi Ownership Statistics</h1>
        {this.state.loading &&
          <Loading message="Loading Portals from TheGraph..." />
        }
        {this.renderSummary()}
      </div>
    )
  }
}

export default Ownership;
