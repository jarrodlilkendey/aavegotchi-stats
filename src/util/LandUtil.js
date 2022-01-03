import parcelTokens from '../data/parcels/tokens.json';

const axios = require('axios');
const _ = require('lodash');

const parcelQuery = (c1, c2, c3, c4, c5) => {
  let query = `{
    chunk1: parcels(
      first: 1000, where:{
        id_in:[${c1.join()}]
      }
    ) {
      id
      owner { id }
      size
    }
    chunk2: parcels(
      first: 1000, where:{
        id_in:[${c2.join()}]
      }
    ) {
      id
      owner { id }
      size
    }
    chunk3: parcels(
      first: 1000, where:{
        id_in:[${c3.join()}]
      }
    ) {
      id
      owner { id }
      size
    }
    chunk4: parcels(
      first: 1000, where:{
        id_in:[${c4.join()}]
      }
    ) {
      id
      owner { id }
      size
    }
    chunk5: parcels(
      first: 1000, where:{
        id_in:[${c5.join()}]
      }
    ) {
      id
      owner { id }
      size
    }
  }`;

  return query;
};

export const retrieveParcels = async () => {
  const parcelChunks = _.chunk(parcelTokens, 1000)

  let parcels = [];

  for (let i = 0; i < 30; i+=5) {
    const result = await axios.post(
      'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic',
      {
        query: parcelQuery(
          parcelChunks[i],
          parcelChunks[i+1],
          parcelChunks[i+2],
          parcelChunks[i+3],
          parcelChunks[i+4]
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

    result.data.data.chunk5.map((p) => {
      parcels.push(p);
    });
  }


  let humbleByOwner = _.groupBy(_.filter(parcels, ['size', '0']), 'owner.id');
  let reasonableByOwner = _.groupBy(_.filter(parcels, ['size', '1']), 'owner.id');
  let spaciousByOwner = _.groupBy(
    _.filter(parcels, function(p) {
      if (p.size == '2' || p.size == '3') {
        return true;
      }
      return false;
    }), 'owner.id'
  );

  let parcelsByOwner = _.groupBy(parcels, 'owner.id');

  let data = {
    humble: humbleByOwner,
    reasonable: reasonableByOwner,
    spacious: spaciousByOwner,
    all: parcelsByOwner
  };

  return data;
};
