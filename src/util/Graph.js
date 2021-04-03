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
