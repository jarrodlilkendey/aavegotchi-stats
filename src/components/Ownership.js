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

      owners: [],

      loading: true,
    };
  }

  async componentDidMount() {
    retrieveH1Portals()
      .then((h1Portals) => {
        retrieveH2Portals()
          .then((h2Portals) => {
            retrieveParcels().then((parcels) => {
              console.log('parcels', parcels);

              let h1UniqueOwners = {};
              let h2UniqueOwners = {};
              let allUniqueOwners = {};
              let kinshipUniqueOwners = {};
              let experienceUniqueOwners = {};
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

                if (portal.gotchi != null) {
                  if (kinshipUniqueOwners[portal.owner.id]) {
                    kinshipUniqueOwners[portal.owner.id] += parseInt(portal.gotchi.kinship);
                  } else {
                    kinshipUniqueOwners[portal.owner.id] = parseInt(portal.gotchi.kinship);
                  }

                  if (experienceUniqueOwners[portal.owner.id]) {
                    experienceUniqueOwners[portal.owner.id] += parseInt(portal.gotchi.experience);
                  } else {
                    experienceUniqueOwners[portal.owner.id] = parseInt(portal.gotchi.experience);
                  }
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

                if (portal.gotchi != null) {
                  if (kinshipUniqueOwners[portal.owner.id]) {
                    kinshipUniqueOwners[portal.owner.id] += parseInt(portal.gotchi.kinship);
                  } else {
                    kinshipUniqueOwners[portal.owner.id] = parseInt(portal.gotchi.kinship);
                  }

                  if (experienceUniqueOwners[portal.owner.id]) {
                    experienceUniqueOwners[portal.owner.id] += parseInt(portal.gotchi.experience);
                  } else {
                    experienceUniqueOwners[portal.owner.id] = parseInt(portal.gotchi.experience);
                  }
                }
              });

              let owners = Object.keys(allUniqueOwners).map((id) => ({
                id,
                portalCount: allUniqueOwners[id],
                h1PortalCount: h1UniqueOwners[id] ? h1UniqueOwners[id] : 0,
                h2PortalCount: h2UniqueOwners[id] ? h2UniqueOwners[id] : 0,
                kinship: kinshipUniqueOwners[id] ? kinshipUniqueOwners[id] : 0,
                experience: experienceUniqueOwners[id] ? experienceUniqueOwners[id] : 0,
                humbleCount: parcels.humble[id] ? parcels.humble[id].length : 0,
                reasonableCount: parcels.reasonable[id] ? parcels.reasonable[id].length : 0,
                spaciousCount: parcels.spacious[id] ? parcels.spacious[id].length : 0,
                parcelCount: parcels.all[id] ? parcels.all[id].length : 0,
              }));

              owners = _.orderBy(owners, ['portalCount'], ['desc']);

              console.log('owners', owners);


              let h1Owners = Object.keys(h1UniqueOwners).map(id => ({ id, portalCount: h1UniqueOwners[id] }));
              h1Owners = _.orderBy(h1Owners, ['portalCount'], ['desc']);
              console.log('h1Owners', h1Owners);

              let h2Owners = Object.keys(h2UniqueOwners).map(id => ({ id, portalCount: h2UniqueOwners[id] }));
              h2Owners = _.orderBy(h2Owners, ['portalCount'], ['desc']);
              console.log('h2Owners', h2Owners);

              let allOwners = Object.keys(allUniqueOwners).map(id => ({ id, portalCount: allUniqueOwners[id] }));
              allOwners = _.orderBy(allOwners, ['portalCount'], ['desc']);
              console.log('allOwners', allOwners);

              let kinshipOwners = Object.keys(kinshipUniqueOwners).map(id => ({ id, kinship: kinshipUniqueOwners[id] }));
              kinshipOwners = _.orderBy(kinshipOwners, ['kinship'], ['desc']);
              console.log('kinshipOwners', kinshipOwners);

              let experienceOwners = Object.keys(experienceUniqueOwners).map(id => ({ id, experience: experienceUniqueOwners[id] }));
              experienceOwners = _.orderBy(experienceOwners, ['experience'], ['desc']);
              console.log('experienceOwners', experienceOwners);

              console.log('h1Portals', h1Portals, 'h2Portals', h2Portals );
              console.log('allOwners', allOwners);

              this.setState({ h1Portals, h2Portals, owners, parcels, loading: false });
            });
          });
      });
  }

  renderOwners() {
    if (this.state.owners.length > 0) {
      const columns = [
        {
          field: 'id',
          headerName: 'Owner',
          width: 360,
          renderCell: (params: GridCellParams) => (
            <a href={`https://app.aavegotchi.com/aavegotchis/${params.value}`} target="_blank">
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
        <h1>Aavegotchi Ownership Statistics</h1>
        {this.state.loading &&
          <Loading message="Loading Portals from TheGraph..." />
        }
        <p>These numbers need to be be corrected. I will get them updated SOON TM</p>
        {/*this.renderOwners()*/}
      </div>
    )
  }
}

export default Ownership;
