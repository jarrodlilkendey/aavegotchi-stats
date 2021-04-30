import React, { Component } from 'react';

import aavegotchiContractAbi from '../abi/diamond.json';
import contract from '../config/aavegotchiContract.json';

const Web3 = require('web3');

class PetAll extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;
  }

  componentDidMount() {
  }

  async petAll() {
    console.log('petAll');
    let provider = new Web3(Web3.givenProvider || "ws://localhost:8545");
    console.log(provider);

    const aavegotchiContract = new provider.eth.Contract(aavegotchiContractAbi, contract.address);
    console.log(aavegotchiContract);

    let accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    console.log(accounts);

    let gotchis = await aavegotchiContract.methods.tokenIdsOfOwner(accounts[0]).call();
    console.log(gotchis);
    if (gotchis.length > 0) {
      let pet = aavegotchiContract.methods.interact(gotchis).send({from: accounts[0]});
      console.log(pet);
    }
  }

  render() {
    return (
      <div>
        <h1>Pet All</h1>
        <button onClick={() => this.petAll()}>Pet All</button>
      </div>
    );
  }
}

export default PetAll;
