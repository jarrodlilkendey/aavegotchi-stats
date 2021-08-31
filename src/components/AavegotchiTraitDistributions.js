import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { DataGrid } from '@material-ui/data-grid';

import { retrieveAllGotchis, retrieveH1Gotchis, retrieveH2Gotchis } from '../util/Graph';

import Loading from './Loading';

const _ = require('lodash');
const axios = require('axios');

class AavegotchiTraitDistributions extends Component {
  constructor(props) {
    super(props);

    this.renderTraitsDistribution = this.renderTraitsDistribution.bind(this);

    document.title = this.props.title;

    this.state = {
      gotchisByTraitValue: [],
      traits: ['Energy', 'Aggression', 'Spookiness', 'Brain Size', 'Eye Shape', 'Eye Color'],
      aavegotchis: {},
      h1Count: 0,
      h2Count: 0,
      loading: true,
    };
  }

  async componentDidMount() {
    retrieveAllGotchis()
      .then((gotchis) => {
        console.log('all gotchis', gotchis, _.uniqBy(gotchis, 'id').length);

        let aavegotchis = {};
        for (var a = 0; a < gotchis.length; a++) {
          aavegotchis[gotchis[a].id] = gotchis[a];
        }

        this.setState({
          aavegotchis,
          h1Count: _.filter(gotchis, ['hauntId', '1']).length,
          h2Count: _.filter(gotchis, ['hauntId', '2']).length,
          loading: false
        });
      });
  }

  calculateData(trait) {
    let data = [];
    for (let tv = -1; tv < 102; tv++) {
      let filteredAavegotchis = _.filter(this.state.aavegotchis, [`numericTraits[${trait}]`, tv]);
      let countTv = filteredAavegotchis.length;
      // console.log(tv, filteredAavegotchis, countTv);
      data.push([tv, countTv]);
    }
    return data;
  }

  async retrieveListings(tokenIds) {
    console.log('retrieveListings', tokenIds);

    let tokenIdString = "";
    tokenIds.map(function(value, index) {
      tokenIdString += "\"" + value + "\","
    });

    const query = `{
      erc721Listings(first: 1000, where: { tokenId_in: [${tokenIdString}], cancelled: false, timePurchased: "0" }) {
        id
        tokenId
        priceInWei
      }
    }`;

    console.log('query', query);

    const listings = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: query
      }
    );

    this.setState({erc721Listings: listings.data.data.erc721Listings});
    console.log(listings.data.data.erc721Listings);
  }

  async retrieveGotchis(trait, traitValue) {
    console.log('trait', trait, 'value', traitValue);
    const gotchisByTraitValue = _.filter(this.state.aavegotchis, [`numericTraits[${trait}]`, traitValue]);
    console.log(gotchisByTraitValue);
    this.setState({ gotchisByTraitValue: gotchisByTraitValue, trait: trait, traitValue: traitValue });

    let tokenIds = [];
    gotchisByTraitValue.map(function(a, index) {
      tokenIds.push(a.id);
    });
    this.retrieveListings(tokenIds);
  }

  renderGotchis() {
    const _this = this;
    if (this.state.gotchisByTraitValue.length > 0) {
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
      this.state.gotchisByTraitValue.map(function(a, index) {
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
            link: `https://aavegotchi.com/baazaar/erc721/${listing[0].id}`,
            text: `${Math.round(listing[0].priceInWei / 1000000000000000000)}`,
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
          <h2>Aavegotchis with {this.state.traits[this.state.trait]} of {this.state.traitValue}</h2>
          <p>Count: {rows.length}</p>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
          </div>
        </div>
      );
    }
  }

  renderTraitsDistribution() {
    const _this = this;

    if (Object.keys(this.state.aavegotchis).length > 0) {
      let totalClaimed = this.state.h1Count + this.state.h2Count;

      const options = {
        title: {
          text: 'Claimed Aavegotchis Base Traits Distribution',
        },
        subtitle: {
          text: `Claimed Aavegotchis: ${this.state.h1Count} (H1), ${this.state.h2Count} (H2), ${totalClaimed} (TOTAL)`
        },
        series: [
          { data: this.calculateData(0), name: 'Energy' },
          { data: this.calculateData(1), name: 'Aggression' },
          { data: this.calculateData(2), name: 'Spookiness' },
          { data: this.calculateData(3), name: 'Brain Size' },
          { data: this.calculateData(4), name: 'Eye Shape' },
          { data: this.calculateData(5), name: 'Eye Color' },
        ],
        plotOptions: {
          series: {
            allowPointSelect: true,
            point: {
              events: {
                click: function () {
                  _this.retrieveGotchis(this.series.index, this.x);
                }
              }
            }
          }
        },
        xAxis: {
          title: {
            text: 'Base Trait Value'
          }
        },
        yAxis: {
          title: {
            text: 'Gotchi Count'
          }
        },
        tooltip: {
          pointFormat: '{series.name} Trait of {point.x}: <b>{point.y}</b><br/>',
          valueSuffix: ' Gotchis',
          shared: false
        },
        credits: {
          enabled: true,
          href: 'https://aavegotchistats.com/traits',
          text: 'aavegotchistats.com/traits'
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
        <h1>Aavegotchi Traits Distribution</h1>
        {this.state.loading &&
          <Loading message="Loading Aavegotchis from TheGraph..." />
        }
        {this.renderTraitsDistribution()}
        {this.renderGotchis()}
      </div>
    );
  }
}

export default AavegotchiTraitDistributions;
