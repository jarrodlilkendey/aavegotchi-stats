import wearableItemTypes from '../data/wearables/wearables.json';

import { ethers } from "ethers";

import {
    erc1155FloorPriceById,
} from './FloorPricesUtil';
import { all } from 'mathjs';

const config = require('../Config');

const axios = require('axios');
const _ = require('lodash');

const alloyFloorQuery = (listingCount) => {
    let query = `{
      erc1155Listings(
        first: ${listingCount},
        orderBy: priceInWei,
        orderDirection: asc,
        where:{
          category: 7,
          erc1155TypeId: "1000000000",
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

export const alloyFloorPrices = async() => {
    const result = await axios.post(
        config.AAVEGOTCHI_CORE_SUBGRAPH_URL,
        {
          query: alloyFloorQuery(50)
        }
      );
    return result.data.data.erc1155Listings;
};

export const alloyPurchaseCostToForge = async(alloyListings, rarity) => {
    let alloyRequired = getForgeAlloyRequirements(rarity).quantity;
    let totalCost = 0;

    for (let l = 0; l < alloyListings.length; l++) {
        if (alloyRequired <= 0) {
            break;
        }

        let listingQuantity = alloyListings[l].quantity;
        let listingUnitPrice = ethers.utils.formatEther(alloyListings[l].priceInWei);

        for (let i = 0; i < listingQuantity; i++) {
            if (alloyRequired <= 0) {
                break;
            }

            totalCost += parseFloat(listingUnitPrice);
            alloyRequired--;
        }
    }

    if (alloyRequired > 0) {
        totalCost = 0;
    }

    return totalCost;
    
    // return { totalCost, quantityRequired: getForgeAlloyRequirements(rarity).quantity, quantityUnavailable: alloyRequired };
};

export const getForgeAlloyRequirements = (rarity) => {
    const alloyQuantity = { 
        "Common": 100,
        "Uncommon": 300,
        "Rare": 1300,
        "Legendary": 5300,
        "Mythical": 25000,
        "Godlike": 130000
    }

    const forgeTime = {
        "Common": 32922,
        "Uncommon": 98765,
        "Rare": 296296,
        "Legendary": 888889,
        "Mythical": 2666667,
        "Godlike": 8000000
    }

    return { quantity: alloyQuantity[rarity], time: forgeTime[rarity] };
};

const coreFloorQuery = (erc1155TypeId) => {
    let query = `{
      erc1155Listings(
        first: 1,
        orderBy: priceInWei,
        orderDirection: asc,
        where:{
          category: 11,
          erc1155TypeId: ${erc1155TypeId},
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

export const coreFloorPrice = async(rarity, slot) => {
    const coreERC1155Ids = {
        "Body": {
            "Common":       "1000000008",
            "Uncommon":     "1000000009",
            "Rare":         "1000000010",
            "Legendary":    "1000000011",
            "Mythical":     "1000000012",
            "Godlike":      "1000000013",
        },

        "Face": {
            "Common":       "1000000014",
            "Uncommon":     "1000000015",
            "Rare":         "1000000016",
            "Legendary":    "1000000017",
            "Mythical":     "1000000018",
            "Godlike":      "1000000019",
        },

        "Eyes": {
            "Common":       "1000000020",
            "Uncommon":     "1000000021",
            "Rare":         "1000000022",
            "Legendary":    "1000000023",
            "Mythical":     "1000000024",
            "Godlike":      "1000000025",
        },

        "Head": {
            "Common":       "1000000026",
            "Uncommon":     "1000000027",
            "Rare":         "1000000028",
            "Legendary":    "1000000029",
            "Mythical":     "1000000030",
            "Godlike":      "1000000031",
        },

        "Hands": {
            "Common":       "1000000032",
            "Uncommon":     "1000000033",
            "Rare":         "1000000034",
            "Legendary":    "1000000035",
            "Mythical":     "1000000036",
            "Godlike":      "1000000037",
        },

        "Pet": {
            "Common":       "1000000038",
            "Uncommon":     "1000000039",
            "Rare":         "1000000040",
            "Legendary":    "1000000041",
            "Mythical":     "1000000042",
            "Godlike":      "1000000043",
        },
    }

    const result = await axios.post(
        config.AAVEGOTCHI_CORE_SUBGRAPH_URL,
        {
          query: coreFloorQuery(coreERC1155Ids[slot][rarity])
        }
      );

    let listings = result.data.data.erc1155Listings;

    let floor = 0;
    let link = 'https://dapp.aavegotchi.com/baazaar/forge';
    if (listings.length > 0) {
      floor = ethers.utils.formatEther(listings[0].priceInWei);
      link = `https://dapp.aavegotchi.com/baazaar/forge?id=${listings[0].id}`;
    }

    return { floor, link };
};

const schematicFloorQuery = (erc1155TypeId) => {
    let query = `{
      erc1155Listings(
        first: 1,
        orderBy: priceInWei,
        orderDirection: asc,
        where:{
          category: 7,
          erc1155TypeId: ${erc1155TypeId},
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

export const schematicFloorPrice = async(wearableId) => {
    const result = await axios.post(
        config.AAVEGOTCHI_CORE_SUBGRAPH_URL,
        {
          query: schematicFloorQuery(wearableId)
        }
      );

    let listings = result.data.data.erc1155Listings;

    let floor = 0;
    let link = 'https://dapp.aavegotchi.com/baazaar/forge';
    if (listings.length > 0) {
      floor = ethers.utils.formatEther(listings[0].priceInWei);
      link = `https://dapp.aavegotchi.com/baazaar/forge?id=${listings[0].id}`;
    }

    return { floor, link };
};