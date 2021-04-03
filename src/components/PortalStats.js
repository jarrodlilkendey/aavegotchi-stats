import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { retrieveAllPortals } from '../util/Graph';

import Loading from './Loading';

const _ = require('lodash');
const axios = require('axios');

class PortalStats extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    this.state = {
      portals: [],
      loading: true,
    };
  }

  async componentDidMount() {
    retrieveAllPortals()
      .then((portals) => {
        console.log(portals);

        this.calculateSummaryStats(portals);

        this.setState({ portals: portals, loading: false });
      });
  }

  calculateSummaryStats(portals) {
    let summaryStats = {};
    summaryStats.portalsCount = portals.length;
    summaryStats.openedCount =  _.reject(portals, ['openedAt', null]).length;
    summaryStats.unopenedCount =  _.filter(portals, ['openedAt', null]).length;
    summaryStats.claimedCount =  _.reject(portals, ['claimedAt', null]).length;
    summaryStats.unclaimedCount =  _.filter(portals, ['claimedAt', null]).length;
    this.setState({ summaryStats });
  }

  calculateOpenedPortalData() {
    let opened = [..._.reject(this.state.portals, ['openedAt', null])];

    opened.map(function(p, index) {
      opened[index].openedBlock = parseInt(p.openedAt);
    });

    opened = _.sortBy(opened, ['openedBlock', 'asc']);

    let blockOpened = {};

    opened.map(function(p, index) {
      if (blockOpened.hasOwnProperty(p.openedAt)) {
        blockOpened[p.openedAt] += 1;
      } else {
        blockOpened[p.openedAt] = 1;
      }
    });

    let blockData = []
    let runningTotal = 0;

    Object.keys(blockOpened).map(function(block, index) {
      let portalsOpened = blockOpened[block];
      runningTotal += portalsOpened;
      blockData.push([parseInt(block), runningTotal]);
    });

    return blockData;
  }

  calculateClaimedPortalData() {
    let claimed = [..._.reject(this.state.portals, ['claimedAt', null])];

    claimed.map(function(p, index) {
      claimed[index].claimedBlock = parseInt(p.claimedAt);
    });

    claimed = _.sortBy(claimed, ['claimedBlock', 'asc']);

    let blockClaimed = {};

    claimed.map(function(p, index) {
      if (blockClaimed.hasOwnProperty(p.claimedAt)) {
        blockClaimed[p.claimedAt] += 1;
      } else {
        blockClaimed[p.claimedAt] = 1;
      }
    });

    let blockData = []
    let runningTotal = 0;

    Object.keys(blockClaimed).map(function(block, index) {
      let portalsClaimed = blockClaimed[block];
      runningTotal += portalsClaimed;
      blockData.push([parseInt(block), runningTotal]);
    });

    return blockData;
  }

  renderSummary() {
    if (this.state.portals.length > 0) {
      return (
        <div>
          <p>Total Portals: {this.state.summaryStats.portalsCount}</p>
          <p>Total Portals Opened: {this.state.summaryStats.openedCount}, Total Unopened Portals: {this.state.summaryStats.unopenedCount}</p>
          <p>Total Portals Claimed: {this.state.summaryStats.claimedCount}, Total Portals Unclaimed: {this.state.summaryStats.unclaimedCount}</p>
        </div>
      )
    }
  }

  renderOpenedPortalsChart() {
    if (this.state.portals.length > 0) {
      const options = {
        chart: {
          zoomType: 'x'
        },
        title: {
          text: 'Total portals that have been opened and claimed over time',
        },
        subtitle: {
          text: 'Time measured in blocks'
        },
        series: [
          { data: this.calculateOpenedPortalData(), name: 'Total Opened Portals' },
          { data: this.calculateClaimedPortalData(), name: 'Total Claimed Portals' },
        ],
        xAxis: {
          title: {
            text: 'Polygon Block Number'
          },
          labels: {
            formatter: function () {
              return this.value;
            }
          }
        },
        yAxis: {
          title: {
            text: 'Portals'
          }
        },
        tooltip: {
          pointFormat: '{series.name} at Block {point.x}: <b>{point.y}</b><br/>',
          valueSuffix: ' Portals',
          shared: false
        },
        credits: {
          enabled: true,
          href: 'https://aavegotchistats.com/portals',
          text: 'aavegotchistats.com/portals'
        }
      }

      return (
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
        />
      );
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
        {this.renderOpenedPortalsChart()}
      </div>
    )
  }
}

export default PortalStats;
