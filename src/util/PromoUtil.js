import { ethers } from "ethers";

const axios = require('axios');
const _ = require('lodash');

const listingQuery = (erc721ListingIds, erc1155ListingIds) => {
  if (erc721ListingIds.length > 0 || erc1155ListingIds.length > 0) {
    let erc721Query = '';
    let erc1155Query = '';

    if (erc721ListingIds.length > 0) {
      erc721Query = `erc721Listings(
          first: ${erc721ListingIds.length},
          where: {
            id_in: [${erc721ListingIds.join()}]
          }
        ) {
          id
          category
          tokenId
          seller
          timeCreated
          timePurchased
          cancelled
          priceInWei
          hauntId
          portal {
            id
            hauntId
            status
          }
          gotchi {
            name
            numericTraits
            baseRarityScore
            modifiedRarityScore
            withSetsRarityScore
            withSetsNumericTraits
            collateral
            kinship
            experience
            level
            equippedWearables
          }
        }`;
    }

    if (erc1155ListingIds.length > 0) {
      erc1155Query = `erc1155Listings(
        first: ${erc1155ListingIds.length},
        where: {
          id_in: [${erc1155ListingIds.join()}]
        }
      ) {
        id
        category
        erc1155TypeId
        seller
        priceInWei
        quantity
        cancelled
        timeCreated
        sold
        rarityLevel
      }`;
    }

    let query = `{
      ${erc721Query}
      ${erc1155Query}
    }`;

    return query;
  } else {
    return false;
  }
}

export const retrievePromoListings = async (erc721ListingIds, erc1155ListingIds) => {
  let listings = [];

  const l = await axios.post(
    'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
    {
      query: listingQuery(erc721ListingIds, erc1155ListingIds)
    }
  );

  console.log('retrievePromoListings', l)

  if (l.data.data.erc721Listings) {
    for (let i = 0; i < l.data.data.erc721Listings.length; i++) {
      let listing = l.data.data.erc721Listings[i];

      let active = true;
      if (listing.cancelled == true || listing.timePurchased != null) {
        active = false;
      }

      console.log('listing', listing);

      listings.push({
        tokenType: 'erc721',
        listingId: listing.id,
        category: listing.category,
        tokenId: listing.tokenId,
        price: ethers.utils.formatEther(listing.priceInWei),
        hauntId: listing.hauntId,
        portal: listing.portal,
        gotchi: listing.gotchi,
        active: active,
      });
    }
  }

  if (l.data.data.erc1155Listings) {
    for (let i = 0; i < l.data.data.erc1155Listings.length; i++) {
      let listing = l.data.data.erc1155Listings[i];

      let active = true;
      if (listing.cancelled == true || listing.sold == true) {
        active = false;
      }

      listings.push({
        tokenType: 'erc1155',
        listingId: listing.id,
        category: listing.category,
        tokenId: listing.erc1155TypeId,
        price: ethers.utils.formatEther(listing.priceInWei),
        quantity: listing.quantity,
        active: active
      });
    }
  }

  return listings;
};
