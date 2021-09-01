import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { DataGrid } from '@material-ui/data-grid';

import { retrieveH1PortalOptions, retrieveH2PortalOptions } from '../util/Graph';
import { formatGhst } from '../util/AavegotchiMath';

import Loading from './Loading';

const _ = require('lodash');
const axios = require('axios');

class AavegotchiPortalRarityDistributions extends Component {
  constructor(props) {
    super(props);

    this.renderRarityDistribution = this.renderRarityDistribution.bind(this);

    document.title = this.props.title;

    this.state = {
      gotchisByBRS: [],
      h1Aavegotchis: {}, h1MinBrs: 0, h1MaxBrs: 0,
      h2Aavegotchis: {}, h2MinBrs: 0, h2MaxBrs: 0,
      loading: true,
    };
  }

  async componentDidMount() {
    retrieveH1PortalOptions()
      .then((gotchis) => {
        console.log('h1 portal options', gotchis);

        let aavegotchis = {};
        let minBrs = 0;
        let maxBrs = 0;

        for (var a = 0; a < gotchis.length; a++) {
          let brs = parseInt(gotchis[a].baseRarityScore)

          aavegotchis[gotchis[a].id] = gotchis[a];
          aavegotchis[gotchis[a].id].brs = brs;
        }

        Object.keys(aavegotchis).map(function(id, index) {
          let aavegotchi = aavegotchis[id];

          if (index == 0) {
            minBrs = aavegotchi.brs;
            maxBrs = aavegotchi.brs;
          } else if (aavegotchi.brs < minBrs) {
            minBrs = aavegotchi.brs;
          } else if (aavegotchi.brs > maxBrs) {
            maxBrs = aavegotchi.brs;
          }
        });

        this.setState({ h1Aavegotchis: aavegotchis, h1MinBrs: minBrs, h1MaxBrs: maxBrs, loading: false });
      });

    retrieveH2PortalOptions()
      .then((gotchis) => {
        console.log('h2 portal options', gotchis);

        let aavegotchis = {};
        let minBrs = 0;
        let maxBrs = 0;

        for (var a = 0; a < gotchis.length; a++) {
          let brs = parseInt(gotchis[a].baseRarityScore)

          aavegotchis[gotchis[a].id] = gotchis[a];
          aavegotchis[gotchis[a].id].brs = brs;
        }

        Object.keys(aavegotchis).map(function(id, index) {
          let aavegotchi = aavegotchis[id];

          if (index == 0) {
            minBrs = aavegotchi.brs;
            maxBrs = aavegotchi.brs;
          } else if (aavegotchi.brs < minBrs) {
            minBrs = aavegotchi.brs;
          } else if (aavegotchi.brs > maxBrs) {
            maxBrs = aavegotchi.brs;
          }
        });

        console.log('setState h2Aavegotchis', aavegotchis, Object.keys(aavegotchis).length);
        this.setState({ h2Aavegotchis: aavegotchis, h2MinBrs: minBrs, h2MaxBrs: maxBrs, loading: false });
      });
  }

  calculateData(haunt) {
    let data = [];

    let minBrs = this.state.h1MinBrs;
    let maxBrs = this.state.h1MaxBrs;

    if (haunt == 2) {
      minBrs = this.state.h2MinBrs;
      maxBrs = this.state.h2MaxBrs;
    }

    for (let brs = minBrs; brs < maxBrs+1; brs++) {
      let filteredAavegotchis = [];
      if (haunt == 1) {
        filteredAavegotchis = _.filter(this.state.h1Aavegotchis, ['brs', brs]);
      } else if (haunt == 2) {
        filteredAavegotchis = _.filter(this.state.h2Aavegotchis, ['brs', brs]);
      }

      let countBrs = filteredAavegotchis.length;
      // console.log(this.state.aavegotchis, brs, filteredAavegotchis, countBrs);
      data.push([brs, countBrs]);
    }

    return data;
  }

  renderRarityDistribution() {
    const _this = this;

    let h1Options = Object.keys(this.state.h1Aavegotchis).length;
    let h2Options = Object.keys(this.state.h2Aavegotchis).length;
    let totalOptions = h1Options + h2Options;

    if (Object.keys(this.state.h1Aavegotchis).length > 0 && Object.keys(this.state.h2Aavegotchis).length > 0) {
      const options = {
        title: {
          text: 'Haunt 1 and 2 Portal Options Base Rarity Score Distribution',
        },
        subtitle: {
          text: `Portal Options: ${h1Options} (H1), ${h2Options} (H2), ${totalOptions} (TOTAL)`
        },
        series: [
          { data: this.calculateData(1), name: 'Haunt 1 Portal Options' },
          { data: this.calculateData(2), name: 'Haunt 2 Portal Options' },
        ],
        xAxis: {
          title: {
            text: 'Base Rarity Score Value'
          }
        },
        yAxis: {
          title: {
            text: 'Portal Option Count'
          }
        },
        tooltip: {
          pointFormat: 'BRS of {point.x}: <b>{point.y}</b><br/>',
          valueSuffix: ' Options',
          shared: false
        },
        credits: {
          enabled: true,
          href: 'https://aavegotchistats.com/portalrarity',
          text: 'aavegotchistats.com/portalrarity'
        },
        chart: {
          zoomType: 'x'
        }
      }

      return (
        <div>
          <p>Note: this chart contains all portal options from haunt 1 and haunt 2 portals.</p>
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
          />
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <h1>Aavegotchi Portal Options Rarity Distribution</h1>
        {this.state.loading &&
          <Loading message="Loading Aavegotchis from TheGraph..." />
        }
        {this.renderRarityDistribution()}
      </div>
    );
  }
}

export default AavegotchiPortalRarityDistributions;
