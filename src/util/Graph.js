const axios = require('axios');
const _ = require('lodash');

const h1AavegotchiGraphQuery = (skip, order) => {
  let query = `{
    aavegotchis(
      first: 1000,
      skip: ${skip},
      orderBy: id,
      orderDirection: ${order},
      where:{ status: 3, owner_not: "0x0000000000000000000000000000000000000000", hauntId: "1" }
    ) {
      id
      hauntId
      name
      numericTraits
      modifiedNumericTraits
      withSetsNumericTraits
      baseRarityScore
      modifiedRarityScore
      withSetsRarityScore
      kinship
      experience
      equippedWearables
      owner {
        id
      }
    }
  }`;

  return query;
}

const h2AavegotchiGraphQuery = (skip, order, id_gte) => {
  let query = `{
    aavegotchis(
      first: 1000,
      skip: ${skip},
      orderBy: id,
      orderDirection: ${order},
      where:{ status: 3, owner_not: "0x0000000000000000000000000000000000000000", hauntId: "2", id_gte: ${id_gte} }
    ) {
      id
      hauntId
      name
      numericTraits
      modifiedNumericTraits
      withSetsNumericTraits
      baseRarityScore
      modifiedRarityScore
      withSetsRarityScore
      kinship
      experience
      equippedWearables
      owner {
        id
      }
    }
  }`;

  return query;
}


const aavegotchiGraphQueryAtBlock = (skip, order, block) => {
  let query = `{
    aavegotchis(
      block: { number: ${block} },
      first: 1000,
      skip: ${skip},
      orderBy: id,
      orderDirection: ${order},
      where:{ status: 3, owner_not: "0x0000000000000000000000000000000000000000" }
    ) {
      id
      hauntId
      name
      numericTraits
      modifiedNumericTraits
      withSetsNumericTraits
      baseRarityScore
      modifiedRarityScore
      withSetsRarityScore
      kinship
      experience
      equippedWearables
      owner {
        id
      }
    }
  }`;

  return query;
}

export const retrieveH1Gotchis = async () => {
  let aavegotchis = [];
  let gotchiIds = [];
  let stop = false;

  for (let i = 0; i < 5; i++) {
    const g = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: h1AavegotchiGraphQuery(i * 1000, 'asc')
      }
    );

    if (g.data.data.aavegotchis.length > 0) {
      g.data.data.aavegotchis.map(function(gotchi, index) {
        aavegotchis.push(gotchi);
        gotchiIds.push(gotchi.id);
      });
    }
  }

  for (let i = 0; i < 5 && !stop; i++) {
    const g = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: h1AavegotchiGraphQuery(i * 1000, 'desc')
      }
    );

    if (g.data.data.aavegotchis.length > 0) {
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
  }

  return _.uniqBy(aavegotchis, 'id');
};

export const retrieveH2Gotchis = async () => {
  let aavegotchis = [];
  let gotchiIds = [];
  let stop = false;

  let id_gtes = [10000, 15000, 20000];

  for (let a = 0; a < 3; a++) {
    for (let i = 0; i < 5; i++) {
      const g = await axios.post(
        'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
        {
          query: h2AavegotchiGraphQuery(i * 1000, 'asc', id_gtes[a])
        }
      );

      if (g.data.data.aavegotchis.length > 0) {
        g.data.data.aavegotchis.map(function(gotchi, index) {
          aavegotchis.push(gotchi);
          gotchiIds.push(gotchi.id);
        });
      }
    }
  }

  return _.uniqBy(aavegotchis, 'id');
};

export const retrieveAllGotchis = async () => {
  let h1Gotchis = await retrieveH1Gotchis();
  let h2Gotchis = await retrieveH2Gotchis();

  return [...h1Gotchis, ...h2Gotchis];
};

export const retrieveAllGotchisAtBlock = async (block) => {
  let aavegotchis = [];
  let gotchiIds = [];
  let stop = false;

  for (let i = 0; i < 5; i++) {
    const g = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: aavegotchiGraphQueryAtBlock(i * 1000, 'asc', block)
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
        query: aavegotchiGraphQueryAtBlock(i * 1000, 'desc', block)
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
}

const h1PortalGraphQuery = (skip, order) => {
  let query = `{
    portals(
      first: 1000,
      skip: ${skip},
      orderBy: id,
      orderDirection:${order},
      where: {
        hauntId: "1"
      }
    ) {
      id
      hauntId
      boughtAt,
      openedAt,
      claimedAt,
      gotchi {
        name
        kinship
        experience
      }
      owner {
        id
      }
    }
  }`;

  return query;
}

export const retrieveH1Portals = async () => {
  let portals = [];

  for (let i = 0; i < 5; i++) {
    const p = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: h1PortalGraphQuery(i * 1000, 'asc')
      }
    );
    portals.push(...p.data.data.portals);
  }

  for (let i = 0; i < 5; i++) {
    const p = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: h1PortalGraphQuery(i * 1000, 'desc')
      }
    );
    portals.push(...p.data.data.portals);
  }

  return portals;
};

const h1PortalOptionsGraphQuery = (skip, order) => {
  let query= `{
    portals(
      first: 1000,
      skip: ${skip},
      orderBy: id,
      orderDirection:${order},
      where: {
        hauntId: "1",
      }
    ) {
      id
      hauntId
      boughtAt,
      openedAt,
      claimedAt,
    	options {
        id
        randomNumber
        numericTraits
        baseRarityScore
      }
    }
  }`;

  return query;
}

export const retrieveH1PortalOptions = async () => {
  let portalOptions = [];

  for (let i = 0; i < 5; i++) {
    const portals = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: h1PortalOptionsGraphQuery(i * 1000, 'asc')
      }
    );

    for (let p = 0; p < portals.data.data.portals.length; p++) {
      let portal = portals.data.data.portals[p];
      if (portal.openedAt != null) {
        for (let o = 0; o < portal.options.length; o++) {
          portalOptions.push(portal.options[o]);
        }
      }
    }
  }

  for (let i = 0; i < 5; i++) {
    const portals = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: h1PortalOptionsGraphQuery(i * 1000, 'desc')
      }
    );

    for (let p = 0; p < portals.data.data.portals.length; p++) {
      let portal = portals.data.data.portals[p];
      if (portal.openedAt != null) {
        for (let o = 0; o < portal.options.length; o++) {
          portalOptions.push(portal.options[o]);
        }
      }
    }
  }

  return portalOptions;
};

const h2PortalGraphQuery = (skip, order, id_lte) => {
  let query = `{
    portals(
      first: 1000,
      skip: ${skip},
      orderBy: id,
      orderDirection:${order},
      where: {
        hauntId: "2"
        id_gte: ${id_lte}
      }
    ) {
      id
      hauntId
      boughtAt,
      openedAt,
      claimedAt,
      gotchi {
        name
        kinship
        experience
      }
      owner {
        id
      }
    }
  }`;

  return query;
}

export const retrieveH2Portals = async () => {
  let portals = [];
  let id_ltes = [10000, 15000, 20000];

  for (let a = 0; a < 3; a++) {
    for (let i = 0; i < 5; i++) {
      const p = await axios.post(
        'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
        {
          query: h2PortalGraphQuery(i * 1000, 'asc', id_ltes[a])
        }
      );
      portals.push(...p.data.data.portals);
    }
  }

  return portals;
};

const h2PortalOptionsGraphQuery = (skip, order, id_lte) => {
  let query = `{
    portals(
      first: 1000,
      skip: ${skip},
      orderBy: id,
      orderDirection:${order},
      where: {
        hauntId: "2"
        id_gte: ${id_lte}
      }
    ) {
      id
      hauntId
      boughtAt,
      openedAt,
      claimedAt,
      options {
        id
        randomNumber
        numericTraits
        baseRarityScore
      }
    }
  }`;

  return query;
}

export const retrieveH2PortalOptions = async () => {
  let portalOptions = [];
  let id_ltes = [10000, 15000, 20000];

  for (let a = 0; a < 3; a++) {
    for (let i = 0; i < 5; i++) {
      const portals = await axios.post(
        'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
        {
          query: h2PortalOptionsGraphQuery(i * 1000, 'asc', id_ltes[a])
        }
      );

      for (let p = 0; p < portals.data.data.portals.length; p++) {
        let portal = portals.data.data.portals[p];
        if (portal.openedAt != null) {
          for (let o = 0; o < portal.options.length; o++) {
            portalOptions.push(portal.options[o]);
          }
        }
      }
    }
  }

  return portalOptions;
};

const h1OpenPortalGraphQuery = (skip) => {
  let query = `{
    portals(
      first: 1000,
      skip: ${skip},
      where: { status: Opened, hauntId: "1" }
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

export const retrieveH1OpenPortals = async () => {
  let portals = [];
  let morePortals = true;

  for (let i = 0; i < 5 && morePortals; i++) {
    const p = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: h1OpenPortalGraphQuery(i * 1000)
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

const h2OpenPortalGraphQuery = (skip) => {
  let query = `{
    portals(
      first: 1000,
      skip: ${skip},
      where: { status: Opened, hauntId: "2" }
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

export const retrieveH2OpenPortals = async () => {
  let portals = [];
  let morePortals = true;

  for (let i = 0; i < 5 && morePortals; i++) {
    const p = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: h2OpenPortalGraphQuery(i * 1000)
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

const erc721ListingsByTokenIdsGraphQuery = (tokenIds) => {
  let tokenIdString = "";
  tokenIds.map(function(value, index) {
    tokenIdString += "\"" + value + "\","
  });

  let query = `{
    erc721Listings(first: 1000, where: { tokenId_in: [${tokenIdString}], cancelled: false, timePurchased: "0" }) {
      id
      tokenId
      priceInWei
    }
  }`;

  return query;
}

export const retrieveErc721ListingsByTokenIds = async (tokenIds) => {
  const listings = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: erc721ListingsByTokenIdsGraphQuery(tokenIds)
    }
  );

  return listings.data.data.erc721Listings;
};

export const retrieveSacrificedGotchis = async (hauntId) => {
  let query = `{
    aavegotchis(
      first: 1000,
      where: {
        owner: "0x0000000000000000000000000000000000000000",
        hauntId: ${hauntId}
      }
    ) {
      id
      hauntId
    }
  }`;

  const gotchis = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: query
    }
  );

  return gotchis.data.data.aavegotchis;
};

const soldGotchisListingsGraphQuery = (skip) => {
  let query = `{
    erc721Listings(
      first: 1000,
      skip: ${skip},
      where: {
        category:3,
        buyer_not: null
      },
      orderBy: timePurchased,
      orderDirection: desc
    ) {
      id
      priceInWei
      timePurchased
      seller
      buyer
      gotchi {
        id
        name
        baseRarityScore
        modifiedRarityScore
        kinship
        experience
        collateral
        stakedAmount
        equippedWearables
        numericTraits
      }
    }
  }`;

  return query;
}

export const retrieveSoldGotchisListings = async () => {
  let listings = [];
  let moreListings = true;

  for (let i = 0; i < 5 && moreListings; i++) {
    const gotchis = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: soldGotchisListingsGraphQuery(i * 1000)
      }
    );

    if (gotchis.data.data.erc721Listings.length > 0) {
      listings.push(...gotchis.data.data.erc721Listings);
    } else {
      moreListings = false;
    }
  }

  listings = _.remove(listings, function(g) {
    if (g.gotchi.baseRarityScore == 0) {
      return false;
    }
    return true;
  });

  return listings;
};


const soldWearablesListingsGraphQuery = (skip) => {
  let query = `{
    erc1155Purchases(
      first: 1000,
      skip: ${skip},
      where: {
       category: 0,
       quantity_gt: 0
      },
      orderBy:timeLastPurchased,
      orderDirection:desc
    ) {
      id
      priceInWei
      erc1155TypeId
      timeLastPurchased
      quantity
      seller
      buyer
      listingID
    }
  }`;

  return query;
}

export const retrieveSoldWearableListings = async () => {
  let listings = [];
  let moreListings = true;

  for (let i = 0; i < 5 && moreListings; i++) {
    const wearables = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: soldWearablesListingsGraphQuery(i * 1000)
      }
    );

    if (wearables.data.data.erc1155Purchases.length > 0) {
      listings.push(...wearables.data.data.erc1155Purchases);
    } else {
      moreListings = false;
    }
  }

  return listings;
};

export const retrieveWearableSets = async () => {
  const wearableSets = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: `{
        wearableSets(first: 1000) {
          id
          name
          allowedCollaterals
          wearableIds
          traitBonuses
        }
      }`
    }
  );

  return wearableSets.data.data.wearableSets;
};

export const retrieveUserAssets = async (address) => {
  const user = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: `{
        users(where: { id: "${address.toLowerCase()}" }) {
          id
          gotchisOwned(first: 1000) {
            id
            name
            numericTraits
            modifiedNumericTraits
            withSetsNumericTraits
            equippedWearables
            kinship
            experience
            collateral
            baseRarityScore
            modifiedRarityScore
            withSetsRarityScore
          }
        }
      }`
    }
  );

  return user.data.data.users[0];
};

export const retrieveTicketListings = async () => {
  const ticketListings = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: `{
        erc1155Listings(
          first: 1000,
          where: {
            sold: false,
            cancelled: false
      	    category: 3,
          },
          orderBy: priceInWei,
          orderDirection:asc
        ) {
          id
          timeCreated
          sold
          priceInWei
          rarityLevel
          seller
          erc1155TypeId
          erc1155TokenAddress
          category
          quantity
        }
      }`
    }
  );

  return ticketListings.data.data.erc1155Listings;
};

const soldTicketListingsGraphQuery = (skip) => {
  let query = `{
    erc1155Purchases(
      first: 1000,
      skip: ${skip},
      where: {
       category: 3,
       quantity_gt: 0
      },
      orderBy:timeLastPurchased,
      orderDirection:desc
    ) {
      id
      priceInWei
      erc1155TypeId
      timeLastPurchased
      quantity
      seller
      buyer
      listingID
    }
  }`;

  return query;
}

export const retrieveSoldTicketListings = async () => {
  let listings = [];
  let moreListings = true;

  for (let i = 0; i < 5 && moreListings; i++) {
    const tickets = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: soldTicketListingsGraphQuery(i * 1000)
      }
    );

    if (tickets.data.data.erc1155Purchases.length > 0) {
      listings.push(...tickets.data.data.erc1155Purchases);
    } else {
      moreListings = false;
    }
  }

  return listings;
};
