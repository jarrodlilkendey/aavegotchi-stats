export const collateralToAddress = (collateral) => {
  const addressMapping = {
    'aUSDC': '0x9719d867A500Ef117cC201206B8ab51e794d3F82',
    'aDAI': '0xE0b22E0037B130A9F56bBb537684E6fA18192341',
    'aUSDT' : '0xDAE5F1590db13E3B40423B5b5c5fbf175515910b',
    'aTUSD': '0xF4b8888427b00d7caf21654408B7CBA2eCf4EbD9',
    'aWETH': '0x20D3922b4a1A8560E1aC99FBA4faDe0c849e2142',
    'aAAVE': '0x823CD4264C1b951C9209aD0DeAea9988fE8429bF',
    'aUNI': '0x8c8bdBe9CeE455732525086264a4Bf9Cf821C498',
    'aYFI': '0xe20f7d1f0eC39C4d5DB01f53554F2EF54c71f613',
    'aLINK': '0x98ea609569bD25119707451eF982b90E3eb719cD'
  };

  return addressMapping[collateral];
};

export const addressToCollateral = (address) => {
  const collateralMapping = {
    '0x9719d867A500Ef117cC201206B8ab51e794d3F82': 'aUSDC',
    '0xE0b22E0037B130A9F56bBb537684E6fA18192341': 'aDAI',
    '0xDAE5F1590db13E3B40423B5b5c5fbf175515910b': 'aUSDT',
    '0xF4b8888427b00d7caf21654408B7CBA2eCf4EbD9': 'aTUSD',
    '0x20D3922b4a1A8560E1aC99FBA4faDe0c849e2142': 'aWETH',
    '0x823CD4264C1b951C9209aD0DeAea9988fE8429bF': 'aAAVE',
    '0x8c8bdBe9CeE455732525086264a4Bf9Cf821C498': 'aUNI',
    '0xe20f7d1f0eC39C4d5DB01f53554F2EF54c71f613': 'aYFI',
    '0x98ea609569bD25119707451eF982b90E3eb719cD': 'aLINK'
  };

  return collateralMapping[address];
};

export const collateralToCoingeckoId = (collateral) => {
  const coingeckoIdMapping = {
    'aUSDC': 'matic-aave-usdc',
    'aDAI': 'matic-aave-usdc',  //  no usd data for 'matic-aave-dai'
    'aUSDT' : 'matic-aave-usdt',
    'aTUSD': 'matic-aave-usdc', //  no usd data for 'matic-aave-tusd'
    'aWETH': 'matic-aave-weth',
    'aAAVE': 'matic-aave-aave',
    'aUNI': 'matic-aave-usdc', //  no usd data for 'matic-aave-uni'
    'aYFI': 'matic-aave-yfi',
    'aLINK': 'matic-aave-link'
  };

  return coingeckoIdMapping[collateral];
}
