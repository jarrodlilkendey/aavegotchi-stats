import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { DataGrid } from '@material-ui/data-grid';

import { retrieveAllPortals, retrieveOpenPortals, retrieveErc721ListingsByTokenIds, retrieveSacrificedGotchis } from '../util/Graph';
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
      portals: [],
      loading: true,
      openPortals: [],
      gotchisByBRS: [],
      sacrificedGotchis: []
    };
  }

  async componentDidMount() {
    retrieveAllPortals()
      .then((portals) => {
        console.log(portals);

        this.calculateSummaryStats(portals);
        retrieveOpenPortals()
          .then((openPortals) => {
            console.log('openPortals', openPortals);

            let minBrs = 0;
            let maxBrs = 0;

            let openPortalGotchis = [];
            openPortals.map(function(portal, index) {
              portal.options.map(function(gotchi, i) {
                openPortalGotchis.push(gotchi);

                if (index == 0 && i == 0) {
                  minBrs = gotchi.baseRarityScore;
                  maxBrs = gotchi.baseRarityScore;
                } else if (gotchi.baseRarityScore < minBrs) {
                  minBrs = gotchi.baseRarityScore;
                } else if (gotchi.baseRarityScore > maxBrs) {
                  maxBrs = gotchi.baseRarityScore;
                }
              });
            });

            this.calculateData();

            this.setState({ openPortals, openPortalGotchis, minBrs, maxBrs });
          });

        this.setState({ portals: portals, loading: false });
      });

    retrieveSacrificedGotchis()
      .then((sacrificedGotchis) => {
        console.log(sacrificedGotchis);
        this.setState({ sacrificedGotchis });
      });
  }

  calculateData() {
    let data = [];
    for (let brs = this.state.minBrs; brs < this.state.maxBrs+1; brs++) {
      let filteredAavegotchis = _.filter(this.state.openPortalGotchis, ['baseRarityScore', brs]);
      let countBrs = filteredAavegotchis.length;
      data.push([brs, countBrs]);
    }
    return data;
  }

  async retrieveGotchis(brsValue) {
    console.log('retrieveGotchis', 'brsValue', brsValue);
    const gotchisByBRS = _.filter(this.state.openPortalGotchis, ['baseRarityScore', brsValue]);
    console.log(gotchisByBRS);
    this.setState({ gotchisByBRS: gotchisByBRS, brsValue: brsValue });

    let tokenIds = [];
    gotchisByBRS.map(function(a, index) {
      let erc721Id = a.id.split('-')[0];
      if (!_.includes(tokenIds, erc721Id)) {
        tokenIds.push(erc721Id);
      }
    });

    console.log(tokenIds);

    retrieveErc721ListingsByTokenIds(tokenIds)
      .then((listings) => {
        console.log('listings', listings);
        this.setState({erc721Listings: listings});
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
    if (this.state.portals.length > 0 && this.state.sacrificedGotchis.length > 0) {
      return (
        <div>
          <h2>Summary</h2>
          <p>Total Portals: {this.state.summaryStats.portalsCount}</p>
          <p>Total Portals Opened: {this.state.summaryStats.openedCount}, Total Unopened Portals: {this.state.summaryStats.unopenedCount}</p>
          <p>Total Portals Claimed: {this.state.summaryStats.claimedCount}, Total Portals Unclaimed: {this.state.summaryStats.unclaimedCount}</p>
          <p>Total Gotchis Sacrificed: {this.state.sacrificedGotchis.length}</p>
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
        <div>
          <h2>Portal Activity Over Time</h2>
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
          />
        </div>
      );
    }
  }

  renderOpenPortalGotchisRarityDistribution() {
    const _this = this;

    if (Object.keys(this.state.openPortalGotchis).length > 0) {
      const options = {
        title: {
          text: 'Unclaimed Aavegotchis Base Rarity Score Distribution',
        },
        subtitle: {
          text: `${this.state.openPortalGotchis.length} Gotchis Inside ${this.state.openPortals.length} Open Portals`
        },
        series: [
          { data: this.calculateData(), name: 'BRS' },
        ],
        plotOptions: {
          series: {
            allowPointSelect: true,
            point: {
              events: {
                click: function () {
                  _this.retrieveGotchis(this.x);
                }
              }
            }
          }
        },
        xAxis: {
          title: {
            text: 'Base Rarity Score'
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

  renderOpenPortals() {
    if (this.state.openPortals.length > 0) {
      return(
        <div>
          <h2>Gotchis in Open Portals by Rarity</h2>
          {this.renderOpenPortalGotchisRarityDistribution()}

          {this.renderGotchis()}
        </div>
      );
    }
  }

  renderGotchis() {
    const _this = this;
    if (this.state.gotchisByBRS.length > 0) {
      const columns = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'portalId', headerName: 'Portal', width: 100 },
        {
          field: 'listing',
          headerName: 'Portal Listing',
          width: 140,
          renderCell: (params: GridCellParams) => (
            params.value.link && params.value.text && (
              <a href={(params.value.link)} target="_blank">
                {(params.value.text)}
              </a>
            )
          )
        },
        { field: 'brs', headerName: 'BRS', width: 80 },
        { field: 'collateral', headerName: 'Collateral', width: 140 },
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
          portalId: a.id.split('-')[0],
          nrg: a.numericTraits[0],
          agg: a.numericTraits[1],
          spk: a.numericTraits[2],
          brn: a.numericTraits[3],
          eyeShape: a.numericTraits[4],
          eyeColor: a.numericTraits[5],
          brs: a.baseRarityScore,
          collateral: graphAddressToCollateral(a.collateralType)
        };

        const listing = _.filter(_this.state.erc721Listings, ['tokenId', a.id.split('-')[0]]);
        console.log('filtered', listing);
        if (listing.length > 0) {
          row.listing = {
            link: `https://aavegotchi.com/baazaar/erc721/${listing[0].id}`,
            text: `${formatGhst(listing[0].priceInWei)}`,
          };
        } else {
          row.listing = {
            link: 'https://aavegotchi.com/baazaar/aavegotchis',
            text: 'None',
          };
        }

        rows.push(row);
      });

      return (
        <div>
          <h2>Gotchis in Open Portals with a Base Rarity Score of {this.state.brsValue}</h2>
          <p>Count: {rows.length}</p>
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
        <h1>Portal Statistics</h1>
        {this.state.loading &&
          <Loading message="Loading Portals from TheGraph..." />
        }
        {this.renderSummary()}
        {this.renderOpenedPortalsChart()}
        {this.renderOpenPortals()}
      </div>
    )
  }
}

export default PortalStats;
