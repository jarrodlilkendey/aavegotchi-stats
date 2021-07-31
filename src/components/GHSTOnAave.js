import React, { Component } from 'react';

import { ethers } from "ethers";

import abi from '../abi/AaveGovernanceStrategy.json';

const address = '0xb7e383ef9b1e9189fc0f71fb30af8aa14377429e';

class GHSTOnAave extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    this.state = {
      blockNumber: null,
      pp: null,
      target: 80000
    };
  }

  async componentDidMount() {
    const apiKeys = JSON.parse(process.env.REACT_APP_RPC_CONFIG);
    const provider = new ethers.providers.JsonRpcProvider(`https://mainnet.infura.io/v3/${apiKeys.infura}`);
    const contract = new ethers.Contract(address, abi, provider);
    console.log(contract);
    console.log(provider);
    provider.getBlockNumber()
      .then((block) => {
        let propositionPower = contract.getPropositionPowerAt('0xC3c2e1Cf099Bc6e1fA94ce358562BCbD5cc59FE5', block)
          .then((propositionPower) => {
            let pp = ethers.utils.formatEther(propositionPower);
            this.setState({ blockNumber: block, pp });
          })
      })
  }

  render() {
    return (
      <div>
        <h1>GHST on AAVE</h1>
        {this.state.blockNumber && this.state.pp &&
          <div>
          <h2>Proposition Power as of Block {this.state.blockNumber}</h2>
            <p>Coderdan's PP: {this.state.pp}</p>
            <p>We need a total of {this.state.target} proposition power. We are {((this.state.pp/this.state.target)*100).toFixed(2)}% of the way.</p>
          </div>
        }
        <h2>Process</h2>
        <p>Delegate to proposition power to coderdan and lets get GHST on Aave</p>
        <ol>
          <li>Obtain AAVE or stkAAVE on your ETH mainnet wallet</li>
          <li>Go to <a href='https://app.aave.com/governance'>https://app.aave.com/governance</a></li>
          <li>Click the "Delegate" button</li>
          <li>Select the asset to delegate as either AAVE or stkAAVE</li>
          <li>Set the type to "Proposition power"</li>
          <li>Enter Coderdan's address 0xC3c2e1Cf099Bc6e1fA94ce358562BCbD5cc59FE5 <a href='https://twitter.com/aavegotchi/status/1420058870907510790'>[src]</a></li>
          <li>Share this on social media with the hashtag #GHSTonAave</li>
        </ol>
        <h2>Share it</h2>
        <p><a href="https://twitter.com/intent/tweet?button_hashtag=GHSTonAave&ref_src=twsrc%5Etfw" class="twitter-hashtag-button" data-size="large" data-text="Let&#39;s get $GHST on Aave" data-url="https://aavegotchistats.com/ghstonaave" data-related="GotchiStats" data-show-count="false">Tweet #GHSTonAave</a></p>
        <iframe src="https://widget.taggbox.com/66640" style={{width:'100%', height:'400px', overflow:'auto', border:'none' }}></iframe>
      </div>
    );
  }
}

export default GHSTOnAave;
