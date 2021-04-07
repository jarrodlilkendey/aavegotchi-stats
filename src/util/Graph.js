const axios = require('axios');
const _ = require('lodash');

const aavegotchiGraphQuery = (skip, order) => {
  let query = `{
    aavegotchis(
      first: 1000,
      skip: ${skip},
      orderBy: id,
      orderDirection: ${order},
      where:{ status: 3 }
    ) {
      id
      hauntId
      name
      numericTraits
      baseRarityScore
      modifiedRarityScore
      kinship
      experience
      owner {
        id
      }
    }
  }`;

  return query;
}

export const retrieveAllGotchis = async () => {
  let aavegotchis = [];
  let gotchiIds = [];
  let stop = false;

  for (let i = 0; i < 5; i++) {
    const g = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: aavegotchiGraphQuery(i * 1000, 'asc')
      }
    );

    g.data.data.aavegotchis.map(function(gotchi, index) {
      aavegotchis.push(gotchi);
      gotchiIds.push(gotchi.id);
    });
  }

  for (let i = 0; i < 5 && !stop; i++) {
    const g = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: aavegotchiGraphQuery(i * 1000, 'desc')
      }
    );

    g.data.data.aavegotchis.map(function(gotchi, index) {
      if (!stop) {
        if (!_.includes(gotchiIds, gotchi.id)) {
          aavegotchis.push(gotchi);
          gotchiIds.push(gotchi.id);
        } else {
          stop = true;
        }
      }
    });
  }

  return aavegotchis;
};

const portalGraphQuery = (skip, order) => {
  let query = `{
    portals(
      first: 1000,
      skip: ${skip},
      orderBy: id,
      orderDirection:${order},
    ) {
      id
      hauntId
      boughtAt,
      openedAt,
      claimedAt,
      gotchi {
        name
      }
    }
  }`;

  return query;
}

export const retrieveAllPortals = async () => {
  let portals = [];

  for (let i = 0; i < 5; i++) {
    const p = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: portalGraphQuery(i * 1000, 'asc')
      }
    );
    portals.push(...p.data.data.portals);
  }

  for (let i = 0; i < 5; i++) {
    const p = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: portalGraphQuery(i * 1000, 'desc')
      }
    );
    portals.push(...p.data.data.portals);
  }

  return portals;
};

const openPortalGraphQuery = (skip) => {
  let query = `{
    portals(
      first: 1000,
      skip: ${skip},
      where: { status: Opened }
    ) {
      id
      hauntId
      status,
      options {
        id
        baseRarityScore
        numericTraits
        minimumStake
        collateralType
      }
    }
  }`;

  return query;
}

export const retrieveOpenPortals = async () => {
  let portals = [];
  let morePortals = true;

  for (let i = 0; i < 5 && morePortals; i++) {
    const p = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: openPortalGraphQuery(i * 1000)
      }
    );

    if (p.data.data.portals.length > 0) {
      portals.push(...p.data.data.portals);
    } else {
      morePortals = false;
    }
  }

  return portals;
};

const wearablesListingsGraphQuery = (skip) => {
  let query = `{
    erc1155Listings(
      first: 1000,
      skip: ${skip},
      where: {
       category: 0,
       sold: false,
       cancelled: false
      },
      orderBy:timeCreated,
      orderDirection:desc
    ) {
      id
      priceInWei
      erc1155TypeId
      timeCreated
    }
  }`;

  return query;
}

export const retrieveGraphWearableListings = async () => {
  let listings = [];
  let moreListings = true;

  for (let i = 0; i < 5 && moreListings; i++) {
    const w = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: wearablesListingsGraphQuery(i * 1000)
      }
    );

    if (w.data.data.erc1155Listings.length > 0) {
      listings.push(...w.data.data.erc1155Listings);
    } else {
      moreListings = false;
    }
  }

  return listings;
};
