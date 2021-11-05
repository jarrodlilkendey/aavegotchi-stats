import parcelTokens from '../data/parcels/tokens.json';

const axios = require('axios');
const _ = require('lodash');

const parcelQuery = (c1, c2, c3, c4) => {
  let query = `{
    chunk1: parcels(
      first: 1000, where:{
        id_in:[${c1.join()}]
      }
    ) {
      id
      owner { id }
    }
    chunk2: parcels(
      first: 1000, where:{
        id_in:[${c2.join()}]
      }
    ) {
      id
      owner { id }
    }
    chunk3: parcels(
      first: 1000, where:{
        id_in:[${c3.join()}]
      }
    ) {
      id
      owner { id }
    }
    chunk4: parcels(
      first: 1000, where:{
        id_in:[${c4.join()}]
      }
    ) {
      id
      owner { id }
    }
  }`;

  return query;
};

export const retrieveParcels = async () => {
  const parcelChunks = _.chunk(parcelTokens, 1000)

  console.log(parcelChunks.length);

  let parcels = [];

  for (let i = 0; i < 16; i+=4) {
    const result = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: parcelQuery(
          parcelChunks[i],
          parcelChunks[i+1],
          parcelChunks[i+2],
          parcelChunks[i+3]
        )
      }
    );

    result.data.data.chunk1.map((p) => {
      parcels.push(p);
    });

    result.data.data.chunk2.map((p) => {
      parcels.push(p);
    });

    result.data.data.chunk3.map((p) => {
      parcels.push(p);
    });

    result.data.data.chunk4.map((p) => {
      parcels.push(p);
    });
  }

  let parcelsByOwner = _.groupBy(parcels, 'owner.id');

  return parcelsByOwner;
};
