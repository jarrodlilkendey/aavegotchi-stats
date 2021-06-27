// import WalletConnectProvider from "@maticnetwork/walletconnect-provider";
// import WalletConnectProvider from "@walletconnect/web3-provider";

const MaticPOSClient = require('@maticnetwork/maticjs').MaticPOSClient;

export const connectToMatic = () => {
  const apiKeys = JSON.parse(process.env.REACT_APP_RPC_CONFIG);
  const parentProvider = `https://mainnet.infura.io/v3/${apiKeys.infura}`;
  const maticProvider = `https://rpc-mainnet.maticvigil.com/v1/${apiKeys.maticvigil}`;
  // const maticProvider = `https://polygon-mainnet.infura.io/v3/${apiKeys.infura}`;

  // const maticProvider = new WalletConnectProvider({
  //   infuraId: `${apiKeys.infura}`,
  //   // host: `https://rpc-mainnet.maticvigil.com/v1/${apiKeys.maticvigil}`,
  //   // callbacks: {
  //   //   onConnect: () => {
  //   //     console.log('walletconnect onConnect');
  //   //   },
  //   //   onDisconnect: () => {
  //   //     console.log('walletconnect onDisconnect');
  //   //   }
  //   // }
  // });

  // maticProvider.enable();

  const maticPOSClient = new MaticPOSClient({
    network: "mainnet",
    version: "v1",
    parentProvider: parentProvider,
    maticProvider: maticProvider
  });

  return maticPOSClient;
};
