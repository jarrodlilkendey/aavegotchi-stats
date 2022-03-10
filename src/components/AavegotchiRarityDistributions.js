import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { DataGrid } from '@material-ui/data-grid';

import { retrieveH1Gotchis, retrieveH2Gotchis, retrieveErc721ListingsByTokenIds } from '../util/Graph';
import { formatGhst } from '../util/AavegotchiMath';

import Loading from './Loading';

const _ = require('lodash');
const axios = require('axios');

class AavegotchiRarityDistributions extends Component {
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
    retrieveH1Gotchis()
      .then((gotchis) => {
        console.log(gotchis);

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

    retrieveH2Gotchis()
      .then((gotchis) => {
        console.log(gotchis);

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

  async retrieveGotchis(brsValue, haunt) {
    console.log('retrieveGotchis', 'brsValue', brsValue, haunt);

    let gotchisByBRS = _.filter(this.state.h1Aavegotchis, ['baseRarityScore', brsValue.toString()]);
    if (haunt == 2) {
      gotchisByBRS = _.filter(this.state.h2Aavegotchis, ['baseRarityScore', brsValue.toString()]);
    }

    console.log(gotchisByBRS);
    this.setState({ gotchisByBRS: gotchisByBRS, brsValue: brsValue });

    let tokenIds = [];
    gotchisByBRS.map(function(a, index) {
      tokenIds.push(a.id);
    });

    retrieveErc721ListingsByTokenIds(tokenIds)
      .then((listings) => {
        console.log(listings);
        this.setState({erc721Listings: listings});
      });
  }

  renderGotchis() {
    const _this = this;
    if (this.state.gotchisByBRS.length > 0) {
      const columns = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'hauntId', headerName: 'Haunt', width: 100 },
        { field: 'name', headerName: 'Name', width: 220 },
        { field: 'brs', headerName: 'BRS', width: 80 },
        { field: 'mrs', headerName: 'MRS', width: 85 },
        {
          field: 'listing',
          headerName: 'Listing',
          width: 110,
          renderCell: (params: GridCellParams) => (
            params.value.link && params.value.text && (
              <a href={(params.value.link)} target="_blank">
                {(params.value.text)}
              </a>
            )
          )
        },
        { field: 'nrg', headerName: 'Energy', width: 100 },
        { field: 'agg', headerName: 'Aggression', width: 130 },
        { field: 'spk', headerName: 'Spookiness', width: 130 },
        { field: 'brn', headerName: 'Brain Size', width: 120 },
        { field: 'eyeShape', headerName: 'Eye Shape', width: 120 },
        { field: 'eyeColor', headerName: 'Eye Color', width: 120 },
      ];

      let rows = [];
      _this.state.gotchisByBRS.map(function(a, index) {
        let row = {
          id: a.id,
          hauntId: a.hauntId,
          name: a.name,
          nrg: a.numericTraits[0],
          agg: a.numericTraits[1],
          spk: a.numericTraits[2],
          brn: a.numericTraits[3],
          eyeShape: a.numericTraits[4],
          eyeColor: a.numericTraits[5],
          brs: a.baseRarityScore,
          mrs: a.modifiedRarityScore,
        };

        const listing = _.filter(_this.state.erc721Listings, ['tokenId', a.id]);
        console.log('filtered', listing);
        if (listing.length > 0) {
          row.listing = {
            link: `https://app.aavegotchi.com/baazaar/erc721/${listing[0].id}`,
            text: `${formatGhst(listing[0].priceInWei)}`,
          };
        } else {
          row.listing = {
            link: 'https://app.aavegotchi.com/baazaar/aavegotchis',
            text: 'None',
          };
        }

        rows.push(row);
      });

      return (
        <div>
          <h2>Aavegotchis with a Base Rarity Score of {this.state.brsValue}</h2>
          <p>Count: {rows.length}</p>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
          </div>
        </div>
      );
    }
  }

  renderRarityDistribution() {
    const _this = this;

    let h1Claimed = Object.keys(this.state.h1Aavegotchis).length;
    let h2Claimed = Object.keys(this.state.h2Aavegotchis).length;
    let totalClaimed = h1Claimed + h2Claimed;

    if (Object.keys(this.state.h1Aavegotchis).length > 0 && Object.keys(this.state.h2Aavegotchis).length > 0) {
      const options = {
        title: {
          text: 'Claimed Aavegotchis Base Rarity Score Distribution',
        },
        subtitle: {
          text: `Claimed Aavegotchis: ${h1Claimed} (H1), ${h2Claimed} (H2), ${totalClaimed} (TOTAL)`
        },
        series: [
          { data: this.calculateData(1), name: 'Claimed Haunt 1 Aavegotchis' },
          { data: this.calculateData(2), name: 'Claimed Haunt 2 Aavegotchis' },
        ],
        plotOptions: {
          series: {
            allowPointSelect: true,
            point: {
              events: {
                click: function () {
                  _this.retrieveGotchis(this.x, this.colorIndex + 1);
                }
              }
            }
          }
        },
        xAxis: {
          title: {
            text: 'Base Rarity Score Value'
          }
        },
        yAxis: {
          title: {
            text: 'Gotchi Count'
          }
        },
        tooltip: {
          pointFormat: 'BRS of {point.x}: <b>{point.y}</b><br/>',
          valueSuffix: ' Gotchis',
          shared: false
        },
        credits: {
          enabled: true,
          href: 'https://aavegotchistats.com/rarity',
          text: 'aavegotchistats.com/rarity'
        }
      }

      return (
        <div>
          <p>Note: this chart only contains Aavegotchis that have been claimed from portals and excludes Aavegotchis that have been sacrificed.</p>
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
        <h1>Aavegotchi Rarity Distribution</h1>
        {this.state.loading &&
          <Loading message="Loading Aavegotchis from TheGraph..." />
        }
        {this.renderRarityDistribution()}
        {this.renderGotchis()}
      </div>
    );
  }
}

export default AavegotchiRarityDistributions;
