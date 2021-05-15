const aavegotchiContractAbi = require('../../abi/diamond.json');
const contract = require('../../config/aavegotchiContract.json');
const apiKeys = require('../../config/apiKeys.json');

const AsyncSema = require('async-sema');

const MaticPOSClient = require('@maticnetwork/maticjs').MaticPOSClient;

const sharp = require("sharp")
const fs = require('fs');
const axios = require('axios');
const _ = require('lodash');

function svgToPng(src, dest) {
  sharp(src)
    .resize({ width: 48, height: 48 })
    .png()
    .toFile(dest)
    .then(function(info) {
      console.log(info)
    })
    .catch(function(err) {
      console.log(err)
    });
}

async function getAavegotchiSvgs() {
  const parentProvider = `https://mainnet.infura.io/v3/${apiKeys.infura}`;
  const maticProvider = `https://rpc-mainnet.maticvigil.com/v1/${apiKeys.maticvigil}`;

  const maticPOSClient = new MaticPOSClient({
    network: "mainnet",
    version: "v1",
    parentProvider: parentProvider,
    maticProvider: maticProvider
  });


  const aavegotchiContract = new maticPOSClient.web3Client.web3.eth.Contract(aavegotchiContractAbi, contract.address);

  retrieveAllGotchis()
    .then(async function(allGotchis) {
      console.log('allGotchis', allGotchis.length);

      let gotchiIds = [];
      let countGotchis = allGotchis.length;
      allGotchis.map(function(gotchi) {
        gotchiIds.push(gotchi.id);
      });

      let myGotchiSvgs = await retrieveGotchiSvgs(aavegotchiContract, gotchiIds, 25);

      console.log('myGotchiSvgs', Object.keys(myGotchiSvgs).length);

      let spriteSheetMetadata = {};

      Object.keys(myGotchiSvgs).map((tokenId, index) => {
        let svg = myGotchiSvgs[tokenId];
        let newSvg = filterSvgBackground(svg);
        let svgfileName = './svg/' + tokenId + '.svg';
        fs.writeFile(svgfileName, newSvg, function (err) {
          if (err) {
            return console.log(err);
          }
          console.log('wrote gotchi svg', tokenId);
          let pngfileName = './png/' + tokenId + '.png';
          svgToPng(svgfileName, pngfileName)
          spriteSheetMetadata[tokenId] = index;

          if (index == (countGotchis - 1)) {
            let data = JSON.stringify(spriteSheetMetadata);
            fs.writeFileSync('gotchisMetadata.json', data);
            console.log('write metadata', data);
          }
        });
      });
    })
    .catch((error) => console.log(error));
}

function filterSvgBackground(gotchiSvg) {
  let from = gotchiSvg.search('<g class="gotchi-bg">');
  let fromString = gotchiSvg.substring(from, gotchiSvg.length);
  let to = fromString.search('</g>');
  let newSvg = gotchiSvg.substring(0, from) + fromString.substring(to + 4, gotchiSvg.length);
  return newSvg;
};

async function retrieveAavegotchiSvg(aavegotchiContract, gotchiId) {
  try {
    const response = aavegotchiContract.methods.getAavegotchiSvg(gotchiId).call();
    console.log('retieved svg', gotchiId);
    return response;
  } catch (error) {
    console.log(error);
  }
}

async function retrieveGotchiSvgs(aavegotchiContract, gotchiIds, rateLimit) {
  let gotchiSvgs = {};

  const limit = AsyncSema.RateLimit(rateLimit);

  for (var i = 0; i < gotchiIds.length; i++) {
    let tokenId = gotchiIds[i];
    await limit();
    // let svg = retrieveAavegotchiSvg(aavegotchiContract, tokenId);
    let svg = await retrieveAavegotchiSvg(aavegotchiContract, tokenId);
    gotchiSvgs[tokenId] = svg;
  }

  return gotchiSvgs;
}

function aavegotchiGraphQuery(skip, order) {
  let query = `{
    aavegotchis(
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

async function retrieveAllGotchis() {
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
}

getAavegotchiSvgs();
// svgToPng('./svg/bojack.svg', './png/bojack.png');
