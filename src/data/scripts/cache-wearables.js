const aavegotchiContractAbi = require('../../abi/diamond.json');
const contract = require('../../config/aavegotchiContract.json');
const apiKeys = require('../../config/apiKeys.json');

const MaticPOSClient = require('@maticnetwork/maticjs').MaticPOSClient;
const fs = require('fs');
const _ = require('lodash');

const connectToMatic = () => {
  const parentProvider = `https://mainnet.infura.io/v3/${apiKeys.infura}`;
  const maticProvider = `https://rpc-mainnet.maticvigil.com/v1/${apiKeys.maticvigil}`;

  const maticPOSClient = new MaticPOSClient({
    network: "mainnet",
    version: "v1",
    parentProvider: parentProvider,
    maticProvider: maticProvider
  });

  return maticPOSClient;
};

const retrieveWearables = async (aavegotchiContract) => {
  let wearables = {};

  let wearableIds = [];
  for (var i = 1; i < 126; i++) {
    wearableIds.push(i.toString());
  }

  for (var i = 130; i < 162; i++) {
    wearableIds.push(i.toString());
  }

  let slices = [_.slice(wearableIds, 0, 50), _.slice(wearableIds, 50, 100), _.slice(wearableIds, 100, 125), _.slice(wearableIds, 125, 161)];


  for (var s = 0; s < slices.length; s++) {
    for (var i = 0; i < slices[s].length; i++) {
      let wearableId = slices[s][i].toString();
      await aavegotchiContract.methods.getItemType(wearableId).call().then(function (itemType) {
        console.log(itemType);
        wearables[wearableId] = {...itemType};
        // fs.writeFileSync(`../wearables/${wearableId}.json`, JSON.stringify(itemType), 'utf-8');
      }).catch(function (e) {
        console.log(e);
      });
    }
    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  return wearables;
};


const maticPOSClient = connectToMatic();
const aavegotchiContract = new maticPOSClient.web3Client.web3.eth.Contract(aavegotchiContractAbi, contract.address);

retrieveWearables(aavegotchiContract)
  .then((wearables) => {
    console.log('wearables', wearables);
    fs.writeFileSync(`../wearables/wearables.json`, JSON.stringify(wearables), 'utf-8')
  });
