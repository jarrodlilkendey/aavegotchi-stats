import apiKeys from '../config/apiKeys.json';

const MaticPOSClient = require('@maticnetwork/maticjs').MaticPOSClient;

export const connectToMatic = () => {
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
