import parcelTokens from '../data/parcels/tokens.json';

const _ = require('lodash');
const axios = require('axios');
const ethers = require('ethers');

const parcelListingsQuery = (c1, c2, c3) => { //, c4) => {
  let query = `{
    chunk1: erc721Listings(
      first: 1000, where:{
        category: 4, cancelled: false, timePurchased:0, tokenId_in:[${c1.join()}]
      }
    ) {
      id
      size
      priceInWei
      tokenId
      district
    }
    chunk2: erc721Listings(
      first: 1000, where:{
        category: 4, cancelled: false, timePurchased:0, tokenId_in:[${c2.join()}]
      }
    ) {
      id
      size
      priceInWei
      tokenId
      district
    }
    chunk3: erc721Listings(
      first: 1000, where:{
        category: 4, cancelled: false, timePurchased:0, tokenId_in:[${c3.join()}]
      }
    ) {
      id
      size
      priceInWei
      tokenId
      district
    }
  }`;

  /*     chunk4: erc721Listings(
        first: 1000, where:{
          category: 4, cancelled: false, timePurchased:0, tokenId_in:[${c4.join()}]
        }
      ) {
        id
        size
        priceInWei
        tokenId
        district
      }
  */

  return query;
};

export const retrieveParcelListings = async () => {
  const parcelChunks = _.chunk(parcelTokens, 1000)
  console.log('chunks', parcelChunks.length);
  console.log('parcels', parcelTokens.length);

  let parcels = [];

  for (let i = 0; i < parcelChunks.length; i+=3) {
    const result = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: parcelListingsQuery(
          parcelChunks[i],
          parcelChunks[i+1],
          parcelChunks[i+2],
          // parcelChunks[i+3]
        )
      }
    );
    // console.log(i, 'chunk1', result.data.data.chunk1.length)
    // console.log(i+1, 'chunk2', result.data.data.chunk2.length)
    // console.log(i+2, 'chunk3', result.data.data.chunk3.length)
    // console.log(i+3, 'chunk4', result.data.data.chunk4.length)

    result.data.data.chunk1.map((p) => {
      p.ghst = parseInt(ethers.utils.formatEther(p.priceInWei));
      parcels.push(p);
    });

    result.data.data.chunk2.map((p) => {
      p.ghst = parseInt(ethers.utils.formatEther(p.priceInWei));
      parcels.push(p);
    });

    result.data.data.chunk3.map((p) => {
      p.ghst = parseInt(ethers.utils.formatEther(p.priceInWei));
      parcels.push(p);
    });

    // result.data.data.chunk4.map((p) => {
    //   p.ghst = parseInt(ethers.utils.formatEther(p.priceInWei));
    //   parcels.push(p);
    // });
  }

  console.log('Total Listed Parcels', parcels.length);

  let districts = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 27, 28, 29, 30, 39, 40, 41, 42, 43];

  let humbleByDistrict = _.groupBy(_.filter(parcels, ['size', '0']), 'district');
  let reasonableByDistrict = _.groupBy(_.filter(parcels, ['size', '1']), 'district');
  let spaciousByDistrict = _.groupBy(
    _.filter(parcels, function(p) {
      if (p.size == '2' || p.size == '3') {
        return true;
      }
      return false;
    }), 'district'
  );

  // let parcelsByDistrict = _.orderBy(_.groupBy(parcels, 'district'), ['ghst'], ['asc']);

  let message = 'District Floor Prices by Parcel Size Report';

  let listingsByDistrict = { };

  districts.map((district) => {
    let districtHumble = _.orderBy(humbleByDistrict[district.toString()], ['ghst'], ['asc']);
    let districtReasonable = _.orderBy(reasonableByDistrict[district.toString()], ['ghst'], ['asc']);
    let districtSpacious = _.orderBy(spaciousByDistrict[district.toString()], ['ghst'], ['asc']);

    listingsByDistrict[district.toString()] = {
      humbleListings: districtHumble,
      reasonableListings: districtReasonable,
      spaciousListings: districtSpacious
    };

    // let humbleFloor = 0;
    // let reasonableFloor = 0;
    // let spaciousFloor = 0;
    //
    // if (districtHumble.length > 0) {
    //   humbleFloor = districtHumble[0].ghst;
    // }
    //
    // if (districtReasonable.length > 0) {
    //   reasonableFloor = districtReasonable[0].ghst;
    // }
    //
    // if (districtSpacious.length > 0) {
    //   spaciousFloor = districtSpacious[0].ghst;
    // }
    //
    // message += `\nD${district}: Humble: ${humbleFloor}, Reasonable: ${reasonableFloor}, Spacious: ${spaciousFloor}`;
  });

  // console.log(message);

  return listingsByDistrict;
};
