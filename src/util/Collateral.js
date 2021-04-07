export const collateralToAddress = (collateral) => {
  const addressMapping = {
    'maUSDC': '0x9719d867A500Ef117cC201206B8ab51e794d3F82',
    'maDAI': '0xE0b22E0037B130A9F56bBb537684E6fA18192341',
    'maUSDT' : '0xDAE5F1590db13E3B40423B5b5c5fbf175515910b',
    'maTUSD': '0xF4b8888427b00d7caf21654408B7CBA2eCf4EbD9',
    'maWETH': '0x20D3922b4a1A8560E1aC99FBA4faDe0c849e2142',
    'maAAVE': '0x823CD4264C1b951C9209aD0DeAea9988fE8429bF',
    'maUNI': '0x8c8bdBe9CeE455732525086264a4Bf9Cf821C498',
    'maYFI': '0xe20f7d1f0eC39C4d5DB01f53554F2EF54c71f613',
    'maLINK': '0x98ea609569bD25119707451eF982b90E3eb719cD'
  };

  return addressMapping[collateral];
};

export const addressToCollateral = (address) => {
  const collateralMapping = {
    '0x9719d867A500Ef117cC201206B8ab51e794d3F82': 'maUSDC',
    '0xE0b22E0037B130A9F56bBb537684E6fA18192341': 'maDAI',
    '0xDAE5F1590db13E3B40423B5b5c5fbf175515910b': 'maUSDT',
    '0xF4b8888427b00d7caf21654408B7CBA2eCf4EbD9': 'maTUSD',
    '0x20D3922b4a1A8560E1aC99FBA4faDe0c849e2142': 'maWETH',
    '0x823CD4264C1b951C9209aD0DeAea9988fE8429bF': 'maAAVE',
    '0x8c8bdBe9CeE455732525086264a4Bf9Cf821C498': 'maUNI',
    '0xe20f7d1f0eC39C4d5DB01f53554F2EF54c71f613': 'maYFI',
    '0x98ea609569bD25119707451eF982b90E3eb719cD': 'maLINK'
  };

  return collateralMapping[address];
};

export const graphAddressToCollateral = (address) => {
  const collateralMapping = {
    '0x9719d867a500ef117cc201206b8ab51e794d3f82': 'maUSDC',
    '0xe0b22e0037b130a9f56bbb537684e6fa18192341': 'maDAI',
    '0xf4b8888427b00d7caf21654408b7cba2ecf4ebd9': 'maTUSD',
    '0xdae5f1590db13e3b40423b5b5c5fbf175515910b': 'maUSDT',
    '0xe20f7d1f0ec39c4d5db01f53554f2ef54c71f613': 'maYFI',
    '0x20d3922b4a1a8560e1ac99fba4fade0c849e2142': 'maWETH',
    '0x823cd4264c1b951c9209ad0deaea9988fe8429bf': 'maAAVE',
    '0x8c8bdbe9cee455732525086264a4bf9cf821c498': 'maUNI',
    '0x98ea609569bd25119707451ef982b90e3eb719cd': 'maLINK'
  };

  return collateralMapping[address];
};

export const collateralToCoingeckoId = (collateral) => {
  const coingeckoIdMapping = {
    'maUSDC': 'matic-aave-usdc',
    'maDAI': 'matic-aave-usdc',  //  no usd data for 'matic-aave-dai'
    'maUSDT' : 'matic-aave-usdt',
    'maTUSD': 'matic-aave-usdc', //  no usd data for 'matic-aave-tusd'
    'maWETH': 'matic-aave-weth',
    'maAAVE': 'matic-aave-aave',
    'maUNI': 'matic-aave-usdc', //  no usd data for 'matic-aave-uni'
    'maYFI': 'matic-aave-yfi',
    'maLINK': 'matic-aave-link'
  };

  return coingeckoIdMapping[collateral];
}
