const axios = require('axios');
const _ = require('lodash');

const erc721FloorPricesQuery = (category) => {
  let query = `{
    erc721Listings(
      first: 5,
      orderBy: priceInWei,
      orderDirection: asc,
      where:{
        category: ${category},
        cancelled: false,
        timePurchased: 0
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

export const erc721FloorPrice = async (category) => {
  const result = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: erc721FloorPricesQuery(category)
    }
  );

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

export const erc721CheapestMythEyes = async () => {
  let query = `{
    erc721Listings(
      first: 1000,
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

export const erc721CheapestGodlike = async () => {
  let query = `{
    erc721Listings(
      first: 1000,
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
  }`;

  const result = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: query
    }
  );

  let aavegotchiGodlikes = [];
  let listGodlikes = [16, 17, 33, 34, 35, 52, 53, 54, 63, 107, 113, 145, 156, 161];

  result.data.data.erc721Listings.map((listing) => {
    listing.equippedWearables.map((w) => {
      listGodlikes.map((g) => {
        if (w == g) {
          aavegotchiGodlikes.push(listing);
        }
      });
    });
  });

  return aavegotchiGodlikes;
};

export const erc721CheapestMythical = async () => {
  let query = `{
    erc721Listings(
      first: 1000,
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
  }`;

  const result = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: query
    }
  );

  let aavegotchiMythicals = [];
  let listMythicals = [13, 14, 15, 30, 31, 32, 48, 49, 50, 51, 62, 70, 72, 73, 74, 75, 86, 99, 103, 114, 122, 124, 144, 150, 155, 160, 202];

  result.data.data.erc721Listings.map((listing) => {
    listing.equippedWearables.map((w) => {
      listMythicals.map((g) => {
        if (w == g) {
          aavegotchiMythicals.push(listing);
        }
      });
    });
  });

  return aavegotchiMythicals;
};
