import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { DataGrid } from '@material-ui/data-grid';

import { retrieveH1Portals, retrieveH2Portals, retrieveH1OpenPortals, retrieveH2OpenPortals, retrieveSacrificedGotchis, retrieveErc721ListingsByTokenIds  } from '../util/Graph';
import { retrieveBridgedH1Portals, retrieveBridgedH2Portals } from '../util/Graph';

import { graphAddressToCollateral } from '../util/Collateral';
import { formatGhst } from '../util/AavegotchiMath';

import Loading from './Loading';

const _ = require('lodash');
const axios = require('axios');

class PortalStats extends Component {
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
        console.log('h1 portals', h1Portals, h1Portals.length, _.uniqBy(h1Portals, 'id').length);

        this.calculateH1SummaryStats(h1Portals);
        this.setState({ h1Portals, loading: false });
      });

    retrieveH2Portals()
      .then((h2Portals) => {
        console.log('h2 portals', h2Portals, h2Portals.length, _.uniqBy(h2Portals, 'id').length);

        this.calculateH2SummaryStats(h2Portals);
        this.setState({ h2Portals, loading: false });
      });

    retrieveSacrificedGotchis("0")
      .then((h0) => {
        retrieveSacrificedGotchis("1")
          .then((h1) => {
            let h1SacrificedGotchis = [...h0, ...h1];
            console.log('h1SacrificedGotchis', h1SacrificedGotchis);
            this.setState({ h1SacrificedGotchis });
          });
      });

    retrieveSacrificedGotchis("2")
      .then((h2SacrificedGotchis) => {
        console.log('h2SacrificedGotchis', h2SacrificedGotchis);
        this.setState({ h2SacrificedGotchis });
      });

    retrieveBridgedH1Portals()
      .then((bridgedH1Portals) => {
        retrieveBridgedH2Portals()
          .then((bridgedH2Portals) => {
            console.log('bridgedPortals', bridgedH1Portals, bridgedH2Portals);
            this.setState({ bridgedH1Portals, bridgedH2Portals });
          });
      });
  }

  calculateH1SummaryStats(portals) {
    let h1SummaryStats = {};
    h1SummaryStats.portalsCount = portals.length;
    h1SummaryStats.openedCount =  _.reject(portals, ['openedAt', null]).length;
    h1SummaryStats.claimedCount =  _.reject(portals, ['claimedAt', null]).length;
    h1SummaryStats.uniqueOwners =  _.uniqBy(_.reject(portals, ['owner.id', '0x0000000000000000000000000000000000000000']), 'owner.id').length;
    this.setState({ h1SummaryStats });
  }

  calculateH2SummaryStats(portals) {
    let h2SummaryStats = {};
    h2SummaryStats.portalsCount = portals.length;
    h2SummaryStats.openedCount =  _.reject(portals, ['openedAt', null]).length;
    h2SummaryStats.claimedCount =  _.reject(portals, ['claimedAt', null]).length;
    h2SummaryStats.uniqueOwners =  _.uniqBy(_.reject(portals, ['owner.id', '0x0000000000000000000000000000000000000000']), 'owner.id').length;
    this.setState({ h2SummaryStats });
  }

  renderSummary() {
    if (this.state.h1SummaryStats && this.state.h2SummaryStats && this.state.bridgedH1Portals && this.state.bridgedH2Portals) {
      let totalPortals = this.state.h1SummaryStats.portalsCount + this.state.h2SummaryStats.portalsCount;
      let totalPortalsOpened = this.state.h1SummaryStats.openedCount + this.state.h2SummaryStats.openedCount;
      let totalPortalsClaimed = this.state.h1SummaryStats.claimedCount + this.state.h2SummaryStats.claimedCount;
      let totalSacrificedGotchis = this.state.h1SacrificedGotchis.length + this.state.h2SacrificedGotchis.length;
      let totalLiveGotchis = totalPortalsClaimed - totalSacrificedGotchis;

      let allPortals = [...this.state.h1Portals, ...this.state.h2Portals];
      let totalUniqueOwners =  _.uniqBy(_.reject(allPortals, ['owner.id', '0x0000000000000000000000000000000000000000']), 'owner.id').length;

      let totalBridged = this.state.bridgedH1Portals.length + this.state.bridgedH2Portals.length;

      return (
        <div>
          <h2>Summary</h2>
          <h3>Haunt 1 Summary</h3>
          <p>Total H1 Portals: {this.state.h1SummaryStats.portalsCount}</p>
          <p>Total H1 Portals Opened: {this.state.h1SummaryStats.openedCount} {`(${((this.state.h1SummaryStats.openedCount/this.state.h1SummaryStats.portalsCount) * 100).toFixed(2)}% of Total H1 Portals)`}</p>
          <p>Total H1 Portals Claimed: {this.state.h1SummaryStats.claimedCount} {`(${((this.state.h1SummaryStats.claimedCount/this.state.h1SummaryStats.portalsCount) * 100).toFixed(2)}% of Total H1 Portals)`}</p>
          <p>Total H1 Aavegotchis Sacrificed: <a href='https://polygonscan.com/token/0x86935f11c86623dec8a25696e1c19a8659cbf95d?a=0x0000000000000000000000000000000000000000#inventory'>{this.state.h1SacrificedGotchis.length}</a> {`(${(this.state.h1SacrificedGotchis.length/this.state.h1SummaryStats.portalsCount) * 100}% of Total H1 Portals)`}</p>
          <p>Total H1 Unique Owners: {this.state.h1SummaryStats.uniqueOwners}</p>
          <p>Total H1 Aavegotchis Bridged: {this.state.bridgedH1Portals.length}</p>
          <h3>Haunt 2 Summary</h3>
          <p>Total H2 Portals: {this.state.h2SummaryStats.portalsCount}</p>
          <p>Total H2 Portals Opened: {this.state.h2SummaryStats.openedCount} {`(${((this.state.h2SummaryStats.openedCount/this.state.h2SummaryStats.portalsCount) * 100).toFixed(2)}% of Total H2 Portals)`}</p>
          <p>Total H2 Portals Claimed: {this.state.h2SummaryStats.claimedCount} {`(${((this.state.h2SummaryStats.claimedCount/this.state.h2SummaryStats.portalsCount) * 100).toFixed(2)}% of Total H2 Portals)`}</p>
          <p>Total H2 Aavegotchis Sacrificed: <a href='https://polygonscan.com/token/0x86935f11c86623dec8a25696e1c19a8659cbf95d?a=0x0000000000000000000000000000000000000000#inventory'>{this.state.h2SacrificedGotchis.length}</a> {`(${((this.state.h2SacrificedGotchis.length/this.state.h2SummaryStats.portalsCount) * 100).toFixed(2)}% of Total H2 Portals)`}</p>
          <p>Total H2 Unique Owners: {this.state.h2SummaryStats.uniqueOwners}</p>
          <p>Total H2 Aavegotchis Bridged: {this.state.bridgedH2Portals.length}</p>
          <h3>Overall Summary</h3>
          <p>Total Portals: {totalPortals}</p>
          <p>Total Portals Opened: {totalPortalsOpened} {`(${((totalPortalsOpened/totalPortals) * 100).toFixed(2)}% of Total Portals)`}</p>
          <p>Total Portals Claimed: {totalPortalsClaimed} {`(${((totalPortalsClaimed/totalPortals) * 100).toFixed(2)}% of Total Portals)`}</p>
          <p>Total Aavegotchis Sacrificed: {totalSacrificedGotchis} {`(${((totalSacrificedGotchis/totalPortals) * 100).toFixed(2)}% of Total Portals)`}</p>
          <p>Total Live Aavegotchis: {totalLiveGotchis} {`(${((totalLiveGotchis/totalPortals) * 100).toFixed(2)}% of Total Portals)`}</p>
          <p>Total Unique Owners: <a href='/owners'>{totalUniqueOwners}</a></p>
          <p>Total Bridged Gotchis: <a href='https://aavegotchi.com/aavegotchis/0x86935f11c86623dec8a25696e1c19a8659cbf95d'>{totalBridged}</a></p>
        </div>
      )
    }
  }

  render() {
    return(
      <div>
        <h1>Portal Statistics</h1>
        {this.state.loading &&
          <Loading message="Loading Portals from TheGraph..." />
        }
        {this.renderSummary()}
      </div>
    )
  }
}

export default PortalStats;
