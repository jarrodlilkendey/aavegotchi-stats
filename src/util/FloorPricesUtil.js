import wearableItemTypes from '../data/wearables/wearables.json';

import { ethers } from "ethers";

const axios = require('axios');
const _ = require('lodash');

const erc721FloorPricesQuery = (category, hauntId) => {
  let query = `{
    erc721Listings(
      first: 5,
      orderBy: priceInWei,
      orderDirection: asc,
      where:{
        category: ${category},
        cancelled: false,
        timePurchased: 0,
        hauntId: ${hauntId}
      }) {
      id
      portal {
        id
      }
      gotchi {
        id
      }
      priceInWei
      timePurchased
      hauntId
    }
  }`;

  return query;
}

const erc1155FloorPricesQuery = (category, rarity) => {
  let query = `{
    erc1155Listings(
      first: 5,
      orderBy: priceInWei,
      orderDirection: asc,
      where:{
        category: ${category},
        rarityLevel: ${rarity},
        cancelled: false,
        sold: false,
        id_not_in: [126114, 125427, 131410, 124729, 124657, 123839, 121753]
      }) {
      id
      priceInWei
      rarityLevel
      seller
      erc1155TypeId
      erc1155TokenAddress
      category
      quantity
    }
  }`;

  return query;
}

const erc1155FloorPricesByIdQuery = (category, id) => {
  let query = `{
    erc1155Listings(
      first: 5,
      orderBy: priceInWei,
      orderDirection: asc,
      where:{
        category: ${category},
        erc1155TypeId: ${id},
        cancelled: false,
        sold: false,
      }) {
      id
      priceInWei
      rarityLevel
      seller
      erc1155TypeId
      erc1155TokenAddress
      category
      quantity
    }
  }`;

  return query;
}

export const erc721FloorPrice = async (category, hauntId) => {
  const result = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: erc721FloorPricesQuery(category, hauntId)
    }
  );

  console.log('erc721FloorPrice', category, hauntId, result);

  return result.data.data.erc721Listings;
};

export const erc1155FloorPrice = async (category, rarity) => {
  const result = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: erc1155FloorPricesQuery(category, rarity)
    }
  );
  return result.data.data.erc1155Listings;
};

export const erc1155FloorPriceById = async (category, id) => {
  const result = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: erc1155FloorPricesByIdQuery(category, id)
    }
  );
  return result.data.data.erc1155Listings;
};

export const erc721CheapestMythEyes = async (hauntId) => {
  let query = `{
    erc721Listings(
      first: 1000,
      orderBy: priceInWei,
      orderDirection: asc,
      where:{
        category: 3, cancelled: false, timePurchased: 0, hauntId: ${hauntId}
      }) {
      id
      gotchi {
        id
        numericTraits
      }
      priceInWei
      hauntId
    }
  }`;

  const result = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: query
    }
  );

  let mythEyes = [];
  result.data.data.erc721Listings.map((listing) => {
    let eyeShape = listing.gotchi.numericTraits[4];
    let eyeColor = listing.gotchi.numericTraits[5];
    if ((eyeShape <= 1 || eyeShape >= 98) && (eyeColor <= 1 || eyeColor >= 98)) {
      mythEyes.push(listing);
    }
  });

  return mythEyes;
};

export const erc721CheapestByWearableRarity = async () => {
  let results = [];

  for (var i = 0; i < 3; i++) {
    const result = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: `{
          erc721Listings(
            first: 1000,
            skip: ${i * 1000},
            orderBy: priceInWei,
            orderDirection: asc,
            where:{
              category: 3, cancelled: false, timePurchased: 0
            }) {
            id
            gotchi {
              id
              numericTraits
            }
            priceInWei
            equippedWearables
          }
        }`
      }
    );

    results.push(...result.data.data.erc721Listings);
  }

  let aavegotchiLegendaries = [];
  let aavegotchiMythicals = [];
  let aavegotchiGodlikes = [];

  results.map((listing) => {
    listing.equippedWearables.map((w) => {
      if (w != 0) {
        if (wearableItemTypes[w].rarityScoreModifier == "10") {
          aavegotchiLegendaries.push(listing);
        } else if (wearableItemTypes[w].rarityScoreModifier == "20") {
          aavegotchiMythicals.push(listing);
        } else if (wearableItemTypes[w].rarityScoreModifier == "50") {
          aavegotchiGodlikes.push(listing);
        }
      }
    });
  });

  let listedGotchisWithWearables = {
    aavegotchiLegendaries: aavegotchiLegendaries,
    aavegotchiMythicals: aavegotchiMythicals,
    aavegotchiGodlikes: aavegotchiGodlikes
  };

  return listedGotchisWithWearables;
};

export const portalOptionCheapestMythEyes = async (hauntId) => {
  let query = `{
    erc721Listings(
      first: 1000,
      orderBy: priceInWei,
      orderDirection: asc,
      where:{
        category: 2, cancelled: false, timePurchased: 0, hauntId: ${hauntId}
      }) {
      id
      priceInWei
    	portal {
        options{
          id
          numericTraits
          baseRarityScore
        }
      }
    }
  }`;

  const result = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: query
    }
  );

  console.log(result.data.data.erc721Listings.length);

  let mythEyes = [];
  result.data.data.erc721Listings.map((listing) => {
    listing.portal.options.map((option) => {
      let eyeShape = option.numericTraits[4];
      let eyeColor = option.numericTraits[5];
      if ((eyeShape <= 1 || eyeShape >= 98) && (eyeColor <= 1 || eyeColor >= 98)) {
        mythEyes.push(listing);
        console.log('push', listing);
      }
      // if (option.baseRarityScore > 530) {
      //    mythEyes.push(listing);
      // }
    });
  });

  return mythEyes;
};

const getXPQuery = (skip) => {
  let query = `{
    erc721Listings(
      first: 1000,
      skip: ${skip},
      orderBy: priceInWei,
      orderDirection: asc,
      where:{
        category: 3, cancelled: false, timePurchased: 0, id_not: 94815
      }) {
      id
      gotchi {
        id
        experience
      }
      priceInWei
      equippedWearables
    }
  }`;

  return query;
}

export const cheapestXP = async () => {
  let i = 0;
  let done = false;
  let aavegotchiListings = [];

  while (done != true) {
    let query = getXPQuery(i);

    const result = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: query
      }
    );

    result.data.data.erc721Listings.map((listing) => {
      let xp = parseInt(listing.gotchi.experience);
      if (xp > 0) {
        let ghst = parseInt(ethers.utils.formatEther(listing.priceInWei));
        let ghstPerXp = ghst / xp;
        aavegotchiListings.push({...listing, ghstPerXp, ghst })
      }
    });

    if (result.data.data.erc721Listings.length == 1000 && i < 5000) {
      i += 1000;
    } else {
      done = true;
    }
  }

  aavegotchiListings = _.orderBy(aavegotchiListings, ['ghstPerXp', 'asc']);

  return aavegotchiListings;
};

const getKinshipQuery = (skip) => {
  let query = `{
    erc721Listings(
      first: 1000,
      skip: ${skip},
      orderBy: priceInWei,
      orderDirection: asc,
      where:{
        category: 3, cancelled: false, timePurchased: 0
      }) {
      id
      gotchi {
        id
        kinship
      }
      priceInWei
      equippedWearables
    }
  }`;

  return query;
}

export const cheapestKIN = async () => {
  let i = 0;
  let done = false;
  let aavegotchiListings = [];

  while (done != true) {
    let query = getKinshipQuery(i);

    const result = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: query
      }
    );

    result.data.data.erc721Listings.map((listing) => {
      let kinship = parseInt(listing.gotchi.kinship);
      if (kinship > 0) {
        let ghst = parseInt(ethers.utils.formatEther(listing.priceInWei));
        let ghstPerKinship = ghst / kinship;
        aavegotchiListings.push({...listing, ghstPerKinship, ghst })
      }
    });

    if (result.data.data.erc721Listings.length == 1000 && i < 5000) {
      i += 1000;
    } else {
      done = true;
    }
  }

  aavegotchiListings = _.orderBy(aavegotchiListings, ['ghstPerKinship', 'asc']);

  return aavegotchiListings;
};

const listedAavegotchisQuery = (skip) => {
  let query = `{
    erc721Listings(
      first: 1000,
      skip: ${skip}
      orderBy: priceInWei,
      orderDirection: asc,
      where:{
        category: 3,
        cancelled: false,
        timePurchased: "0",
      }) {
      id
      gotchi {
        id
        baseRarityScore
        numericTraits
        collateral
      }
      priceInWei
      timePurchased
      hauntId
    }
  }`;

  return query;
}

const retrieveListedAavegotchis = async () => {
  const result = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: listedAavegotchisQuery(0)
    }
  );

  const result2 = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: listedAavegotchisQuery(1000)
    }
  );

  const result3 = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: listedAavegotchisQuery(2000)
    }
  );

  return [...result.data.data.erc721Listings, ...result2.data.data.erc721Listings, ...result3.data.data.erc721Listings];
};

export const floorByBRS = async () => {
  let gotchis = await retrieveListedAavegotchis();

  let aavegotchiListings = [];

  gotchis.map((listing) => {
    let baseRarityScoreInteger = parseInt(listing.gotchi.baseRarityScore);
    let priceInEth = parseFloat(ethers.utils.formatEther(listing.priceInWei));
    aavegotchiListings.push({...listing, baseRarityScoreInteger, priceInEth })
  });

  aavegotchiListings = _.orderBy(aavegotchiListings, ['baseRarityScoreInteger', 'asc']);

  let brsFloors = {};
  let brsList = [500, 510, 520, 530, 540, 550, 560, 570, 575];

  brsList.map((brs) => {
    let filtered = _.filter(
      aavegotchiListings,
      function(g) {
        return g.baseRarityScoreInteger >= brs;
      }
    );

    filtered = _.orderBy(filtered, ['priceInEth', 'asc']);

    console.log('list', brs, filtered);

    if (filtered.length > 0) {
      let floor = filtered[0];
      brsFloors[brs.toString()] = {};
      brsFloors[brs.toString()].floor = ethers.utils.formatEther(floor.priceInWei);
      brsFloors[brs.toString()].link = `https://aavegotchi.com/baazaar/erc721/${floor.id}`;
      brsFloors[brs.toString()].tokenId = '#' + floor.gotchi.id;
      brsFloors[brs.toString()].brs = floor.baseRarityScoreInteger;
    } else {
      brsFloors[brs.toString()] = {
        floor: 0,
        link: 'https://aavegotchi.com/baazaar',
        tokenId: 'No Listings',
        brs: 0
      };
    }
  });

  return brsFloors;
};

export const floorParcels = async () => {
  let query = `{
    humbleFloor: erc721Listings(
      first: 1,
      where: {
      	category: 4
        cancelled: false
        timePurchased: 0,
  			size: 0
    	}
      orderBy:priceInWei
      orderDirection: asc
    ) {
      id
      tokenId
      district
      size
      priceInWei
    }
    reasonableFloor: erc721Listings(
      first: 1,
      where: {
      	category: 4
        cancelled: false
        timePurchased: 0,
  			size: 1
    	}
      orderBy:priceInWei
      orderDirection: asc
    ) {
      id
      tokenId
      district
      size
      priceInWei
    }
    spaciousFloor: erc721Listings(
      first: 1,
      where: {
      	category: 4
        cancelled: false
        timePurchased: 0,
  			size_gte: 2
    	}
      orderBy:priceInWei
      orderDirection: asc
    ) {
      id
      tokenId
      district
      size
      priceInWei
    }
  }`;

  const result = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: query
    }
  );

  console.log(result);

  let data = {
    humble: {
      floor: ethers.utils.formatEther(result.data.data.humbleFloor[0].priceInWei),
      link: `https://aavegotchi.com/baazaar/erc721/${result.data.data.humbleFloor[0].id}`,
      tokenId: result.data.data.humbleFloor[0].tokenId,
      district: result.data.data.humbleFloor[0].district
    },
    reasonable: {
      floor: ethers.utils.formatEther(result.data.data.reasonableFloor[0].priceInWei),
      link: `https://aavegotchi.com/baazaar/erc721/${result.data.data.reasonableFloor[0].id}`,
      tokenId: result.data.data.reasonableFloor[0].tokenId,
      district: result.data.data.reasonableFloor[0].district
    },
    spacious: {
      floor: ethers.utils.formatEther(result.data.data.spaciousFloor[0].priceInWei),
      link: `https://aavegotchi.com/baazaar/erc721/${result.data.data.spaciousFloor[0].id}`,
      tokenId: result.data.data.spaciousFloor[0].tokenId,
      district: result.data.data.spaciousFloor[0].district
    },
  };

  return data;
};
