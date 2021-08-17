const axios = require('axios');
const _ = require('lodash');

const soldWearablesListingsById = (skip, wearableId) => {
  let query = `{
    erc1155Purchases(
      first: 1000,
      skip: ${skip},
      where: {
       category: 0,
       quantity_gt: 0
       erc1155TypeId: ${wearableId}
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

export const retrieveSoldWearableListingsById = async (wearableId) => {
  let listings = [];
  let moreListings = true;

  for (let i = 0; i < 5 && moreListings; i++) {
    const wearables = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: soldWearablesListingsById(i * 1000, wearableId)
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

const erc1155PricesByIdQuery = (category, id) => {
  let query = `{
    erc1155Listings(
      first: 1000,
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

export const erc1155PricesById = async (category, id) => {
  const result = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: erc1155PricesByIdQuery(category, id)
    }
  );
  return result.data.data.erc1155Listings;
};
