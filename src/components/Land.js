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
import { retrieveParcels } from '../util/LandUtil';
import { retrieveParcelListings } from '../util/LandBaazaarUtil';

import Loading from './Loading';

const _ = require('lodash');
const axios = require('axios');

class Land extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    this.state = {
      h1Portals: [],
      h1SacrificedGotchis: [],

      h2Portals: [],
      h2SacrificedGotchis: [],

      owners: [],

      districtListings: [],

      loading: true,
    };
  }

  async componentDidMount() {
    retrieveParcels().then((parcels) => {
      console.log('parcels', parcels);
      let metrics = {};

      metrics.uniqueOwners = Object.keys(parcels.all).length;

      metrics.totalParcels = 0;
      metrics.totalHumble = 0;
      metrics.totalReasonable = 0;
      metrics.totalSpacious = 0;

      Object.keys(parcels.humble).map((owner) => {
        metrics.totalHumble += parcels.humble[owner].length;
      })

      Object.keys(parcels.reasonable).map((owner) => {
        metrics.totalReasonable += parcels.reasonable[owner].length;
      })

      Object.keys(parcels.spacious).map((owner) => {
        metrics.totalSpacious += parcels.spacious[owner].length;
      })

      metrics.totalParcels = metrics.totalHumble + metrics.totalReasonable + metrics.totalSpacious;

      retrieveParcelListings().then((districtListings) => {
        console.log('districtListings', districtListings);

        let districtsSummary = [];

        Object.keys(districtListings).map((district) => {
          let d = { id: parseInt(district) };

          d.humbleCount = districtListings[district].humbleListings.length;
          d.reasonableCount = districtListings[district].reasonableListings.length;
          d.spaciousCount = districtListings[district].spaciousListings.length;
          d.listingCount = d.humbleCount + d.reasonableCount + d.spaciousCount;

          if (districtListings[district].humbleListings.length > 0) {
            d.humbleFloor = { link: `https://aavegotchi.com/baazaar/erc721/${districtListings[district].humbleListings[0].id}` , label: `${districtListings[district].humbleListings[0].ghst}`};
          } else {
            d.humbleFloor = { link: 'https://aavegotchi.com/baazaar', label: 'None' };
          }

          if (districtListings[district].reasonableListings.length > 0) {
            d.reasonableFloor = { link: `https://aavegotchi.com/baazaar/erc721/${districtListings[district].reasonableListings[0].id}` , label: `${districtListings[district].reasonableListings[0].ghst}`};
          } else {
            d.reasonableFloor = { link: 'https://aavegotchi.com/baazaar', label: 'None' };
          }

          if (districtListings[district].spaciousListings.length > 0) {
            d.spaciousFloor = { link: `https://aavegotchi.com/baazaar/erc721/${districtListings[district].spaciousListings[0].id}` , label: `${districtListings[district].spaciousListings[0].ghst}`};
          } else {
            d.spaciousFloor = { link: 'https://aavegotchi.com/baazaar', label: 'None' };
          }

          districtsSummary.push(d)
        });

        this.setState({ parcels, metrics, districtListings, districtsSummary, loading: false });
      });
    });
  }

  renderStats() {
    if (this.state.metrics) {
      return(
        <div>
          <h2>Supply</h2>
          <p>Total Parcels: {this.state.metrics.totalParcels.toLocaleString()}</p>
          <p>Humble Parcels: {this.state.metrics.totalHumble.toLocaleString()}</p>
          <p>Reasonable Parcels: {this.state.metrics.totalReasonable.toLocaleString()}</p>
          <p>Spacious Parcels: {this.state.metrics.totalSpacious.toLocaleString()}</p>
          <h2>Ownership</h2>
          <p>Unique Owners: {this.state.metrics.uniqueOwners.toLocaleString()}</p>
          {/*<p>Addresses by Parcels owned; frequency barchart</p>*/}
          <p>See detailled ownership stats of portals, Aavegotchis and parcels at <a href="/owners">/owners</a></p>
          <h2>Listing Floors by District and Size</h2>
          {this.renderListingsByDistrict()}
          {/*<p>Floors by corners/road touching</p>*/}
          {/*<p>0 gotchi, land holder count</p>*/}
        </div>
      );
    }
  }

  renderListingsByDistrict() {
    if (Object.keys(this.state.districtListings).length > 0 && this.state.districtsSummary) {
      const columns = [
        { field: 'id', headerName: 'District', width: 130 },
        { field: 'listingCount', headerName: 'Total Listings', width: 160 },
        { field: 'humbleCount', headerName: 'Humble #', width: 160 },
        {
          field: 'humbleFloor',
          headerName: 'Humble Floor',
          width: 160,
          renderCell: (params: GridCellParams) => (
            <a href={`${params.value.link}`} target="_blank">
              {params.value.label}
            </a>
          )
        },
        { field: 'reasonableCount', headerName: 'Reasonable #', width: 160 },
        {
          field: 'reasonableFloor',
          headerName: 'Reasonable Floor',
          width: 160,
          renderCell: (params: GridCellParams) => (
            <a href={`${params.value.link}`} target="_blank">
              {params.value.label}
            </a>
          )
        },
        { field: 'spaciousCount', headerName: 'Spacious #', width: 160 },
        {
          field: 'spaciousFloor',
          headerName: 'Spacious Floor',
          width: 160,
          renderCell: (params: GridCellParams) => (
            <a href={`${params.value.link}`} target="_blank">
              {params.value.label}
            </a>
          )
        },
      ];

      return(
        <div style={{ height: '1080px', width: '100%' }}>
          <DataGrid rows={this.state.districtsSummary} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
        </div>
      );
    }
  }

  renderOwners() {
    if (this.state.owners.length > 0) {
      const columns = [
        {
          field: 'id',
          headerName: 'Owner',
          width: 360,
          renderCell: (params: GridCellParams) => (
            <a href={`https://aavegotchi.com/aavegotchis/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'portalCount', headerName: 'All Portals', width: 130 },
        { field: 'h1PortalCount', headerName: 'H1 Portals', width: 130 },
        { field: 'h2PortalCount', headerName: 'H2 Portals', width: 130 },
        { field: 'humbleCount', headerName: 'Humble', width: 130 },
        { field: 'reasonableCount', headerName: 'Reasonable', width: 130 },
        { field: 'spaciousCount', headerName: 'Spacious', width: 130 },
        { field: 'parcelCount', headerName: 'Parcels', width: 130 },
        { field: 'kinship', headerName: 'Total KIN', width: 130 },
        { field: 'experience', headerName: 'Total XP', width: 130 },
      ];

      return (
        <div>
          <h2>Top Owners</h2>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid rows={this.state.owners} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
          </div>
        </div>
      );
    }
  }

  render() {
    return(
      <div>
        <h1>Aavegotchi Land Statistics</h1>
        {this.state.loading &&
          <Loading message="Loading Parcels from TheGraph..." />
        }
        {this.renderOwners()}
        {this.renderStats()}
      </div>
    )
  }
}

export default Land;
