import React, { Component } from 'react';

import { erc721FloorPrice, erc1155FloorPrice, erc1155FloorPriceById, erc721CheapestMythEyes, erc721CheapestGodlike, erc721CheapestMythical } from '../util/FloorPricesUtil';

import { ethers } from "ethers";

import Loading from './Loading';

import wearableItemTypes from '../data/wearables/wearables.json';

class FloorPrices extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    this.state = {

    };
  }

  async componentDidMount() {
    const _this = this;

    const erc721Types = ['closedPortals', 'openPortals', 'aavegotchis'];
    const erc721Indexes = [0, 2, 3];
    erc721Indexes.map((i, index) => {
      erc721FloorPrice(i)
        .then((listings) => {
          let floor = 0;
          let link = 'https://aavegotchi.com/baazaar';
          let tokenId = '';
          if (listings.length > 0) {
            floor = ethers.utils.formatEther(listings[0].priceInWei);
            link = `https://aavegotchi.com/baazaar/erc721/${listings[0].id}`;
            if (listings[0].portal) {
              tokenId = listings[0].portal.id;
            } else if (listings[0].gotchi) {
              tokenId = listings[0].gotchi.id;
            }
          }
          _this.setState({ [erc721Types[index]]: { listings, floor, link, tokenId } });
        });
    });

    const erc1155WearableTypes = ['commonWearables', 'uncommonWearables', 'rareWearables', 'legendaryWearables', 'mythicalWearables', 'godlikeWearables'];
    for (let i = 0; i <= 5; i++) {
      erc1155FloorPrice(0, i)
        .then((listings) => {
          let floor = 0;
          let link = 'https://aavegotchi.com/baazaar';
          let name = 'No Listings';
          if (listings.length > 0) {
            floor = ethers.utils.formatEther(listings[0].priceInWei);
            link = `https://aavegotchi.com/baazaar/erc1155/${listings[0].id}`;
            name = wearableItemTypes[listings[0].erc1155TypeId].name;
          }
          _this.setState({ [erc1155WearableTypes[i]]: { listings, floor, link, name } });
        });
    }

    const erc1155TicketTypes = ['commonTickets', 'uncommonTickets', 'rareTickets', 'legendaryTickets', 'mythicalTickets', 'godlikeTickets', 'dropTickets'];
    const erc1155TicketFren = [50, 250, 500, 2500, 10000, 50000, 10000];
    for (let i = 0; i <= 6; i++) {
      erc1155FloorPrice(3, i)
        .then((listings) => {
          let floor = 0;
          let link = 'https://aavegotchi.com/baazaar';
          let perFren = 0;
          if (listings.length > 0) {
            floor = ethers.utils.formatEther(listings[0].priceInWei);
            link = `https://aavegotchi.com/baazaar/erc1155/${listings[0].id}`;
            perFren = (parseFloat(floor) / erc1155TicketFren[i]).toFixed(6);
          }
          _this.setState({ [erc1155TicketTypes[i]]: { listings, floor, perFren, link  } });
        });
    }

    const erc1155ConsumableTypes = ['kinship', 'greaterKinship', 'xp', 'greaterXp'];
    const erc1155ConsumableIds = [126, 127, 128, 129];
    erc1155ConsumableIds.map((i, index) => {
      erc1155FloorPriceById(2, i)
        .then((listings) => {
          let floor = 0;
          let link = 'https://aavegotchi.com/baazaar';
          if (listings.length > 0) {
            floor = ethers.utils.formatEther(listings[0].priceInWei);
            link = `https://aavegotchi.com/baazaar/erc1155/${listings[0].id}`;
          }
          _this.setState({ [erc1155ConsumableTypes[index]]: { listings, floor, link  } });
        });
    });

    erc721CheapestMythEyes()
      .then((listings) => {
        let floor = 0;
        let link = 'https://aavegotchi.com/baazaar';
        let tokenId = '';
        if (listings.length > 0) {
          floor = ethers.utils.formatEther(listings[0].priceInWei);
          link = `https://aavegotchi.com/baazaar/erc721/${listings[0].id}`;
          tokenId = listings[0].gotchi.id;
        }
        _this.setState({ mythEyes: { listings, floor, link, tokenId  } });
      });

    erc721CheapestGodlike()
      .then((listings) => {
        let floor = 0;
        let link = 'https://aavegotchi.com/baazaar';
        let tokenId = 'No Listings';
        if (listings.length > 0) {
          floor = ethers.utils.formatEther(listings[0].priceInWei);
          link = `https://aavegotchi.com/baazaar/erc721/${listings[0].id}`;
          tokenId = `#${listings[0].gotchi.id}`;
        }
        _this.setState({ aavegotchiGodlike: { listings, floor, link, tokenId  } });
      });

      erc721CheapestMythical()
        .then((listings) => {
          let floor = 0;
          let link = 'https://aavegotchi.com/baazaar';
          let tokenId = 'No Listings';
          if (listings.length > 0) {
            floor = ethers.utils.formatEther(listings[0].priceInWei);
            link = `https://aavegotchi.com/baazaar/erc721/${listings[0].id}`;
            tokenId = `#${listings[0].gotchi.id}`;
          }
          _this.setState({ aavegotchiMythical: { listings, floor, link, tokenId  } });
        });
  }


  render() {
    if (this.state.closedPortals && this.state.openPortals && this.state.aavegotchis && this.state.commonWearables
      && this.state.uncommonWearables && this.state.rareWearables && this.state.legendaryWearables && this.state.mythicalWearables
      && this.state.godlikeWearables && this.state.commonTickets && this.state.uncommonTickets && this.state.rareTickets
      && this.state.legendaryTickets && this.state.mythicalTickets && this.state.godlikeTickets && this.state.dropTickets
      && this.state.kinship && this.state.greaterKinship && this.state.xp && this.state.greaterXp && this.state.mythEyes
     && this.state.aavegotchiGodlike && this.state.aavegotchiMythical) {
      return(
        <div className="container">
          <h2>Aavegotchi Baazaar Floor Prices</h2>
          <div className="row">
            <div className="col">
              <h3>Portals and Aavegotchis</h3>
              <p><img src='/portals/closedportal.svg' height='35px' /> Closed Portal Floor Price: <a href={this.state.closedPortals.link}>{this.state.closedPortals.floor} GHST</a> (#{this.state.closedPortals.tokenId})</p>
              <p><img src='/portals/openportal.svg' height='35px' /> Open Portal Floor Price: <a href={this.state.openPortals.link}>{this.state.openPortals.floor} GHST</a> (#{this.state.openPortals.tokenId})</p>
              <p><img src='/portals/aavegotchi.png' height='35px' /> Aavegotchi Floor Price: <a href={this.state.aavegotchis.link}>{this.state.aavegotchis.floor} GHST</a> (#{this.state.aavegotchis.tokenId})</p>
              <p><img src='/portals/aavegotchi.png' height='35px' /> Myth Eyes Aavegotchi Floor Price: <a href={this.state.mythEyes.link}>{this.state.mythEyes.floor} GHST</a> (#{this.state.mythEyes.tokenId})</p>
              <p><img src='/portals/aavegotchi.png' height='35px' /> Aavegotchi with Godlike Floor Price: <a href={this.state.aavegotchiGodlike.link}>{this.state.aavegotchiGodlike.floor} GHST</a> ({this.state.aavegotchiGodlike.tokenId})</p>
              <p><img src='/portals/aavegotchi.png' height='35px' /> Aavegotchi with Mythical Floor Price: <a href={this.state.aavegotchiMythical.link}>{this.state.aavegotchiMythical.floor} GHST</a> ({this.state.aavegotchiMythical.tokenId})</p>
              <h3>Wearables</h3>
              <p><img src='/tickets/godlike.png' height='30px' /> Godlike Wearable Floor Price: <a href={this.state.godlikeWearables.link}>{this.state.godlikeWearables.floor} GHST</a> ({this.state.godlikeWearables.name})</p>
              <p><img src='/tickets/mythical.png' height='30px' /> Mythical Wearable Floor Price: <a href={this.state.mythicalWearables.link}>{this.state.mythicalWearables.floor} GHST</a> ({this.state.mythicalWearables.name})</p>
              <p><img src='/tickets/legendary.png' height='30px' /> Legendary Wearable Floor Price: <a href={this.state.legendaryWearables.link}>{this.state.legendaryWearables.floor} GHST</a> ({this.state.legendaryWearables.name})</p>
              <p><img src='/tickets/rare.png' height='30px' /> Rare Wearable Floor Price: <a href={this.state.rareWearables.link}>{this.state.rareWearables.floor} GHST</a> ({this.state.rareWearables.name})</p>
              <p><img src='/tickets/uncommon.png' height='30px' /> Uncommon Wearable Floor Price: <a href={this.state.uncommonWearables.link}>{this.state.uncommonWearables.floor} GHST</a> ({this.state.uncommonWearables.name})</p>
              <p><img src='/tickets/common.png' height='30px' /> Common Wearable Floor Price: <a href={this.state.commonWearables.link}>{this.state.commonWearables.floor} GHST</a> ({this.state.commonWearables.name})</p>
            </div>
            <div className="col">
              <h3>Consumables</h3>
              <p><img src='/consumables/xp.svg' height='35px' /> XP Potion Floor Price: <a href={this.state.xp.link}>{this.state.xp.floor} GHST</a></p>
              <p><img src='/consumables/greaterxp.svg' height='35px' /> Greater XP Potion Floor Price: <a href={this.state.greaterXp.link}>{this.state.greaterXp.floor} GHST</a></p>
              <p><img src='/consumables/kinship.svg' height='35px' /> KINSHIP Potion Floor Price: <a href={this.state.kinship.link}>{this.state.kinship.floor} GHST</a></p>
              <p><img src='/consumables/greaterkinship.svg' height='35px' /> Greater KINSHIP Potion Floor Price: <a href={this.state.greaterKinship.link}>{this.state.greaterKinship.floor} GHST</a></p>
              <h3>Tickets</h3>
              <p><img src='/tickets/godlike.png' height='30px' /> Godlike Ticket Floor Price: <a href={this.state.godlikeTickets.link}>{this.state.godlikeTickets.floor} GHST ({this.state.godlikeTickets.perFren} GHST/fren)</a></p>
              <p><img src='/tickets/drop.png' height='30px' /> Drop Ticket Floor Price: <a href={this.state.dropTickets.link}>{this.state.dropTickets.floor} GHST ({this.state.dropTickets.perFren} GHST/fren)</a></p>
              <p><img src='/tickets/mythical.png' height='30px' /> Mythical Ticket Floor Price: <a href={this.state.mythicalTickets.link}>{this.state.mythicalTickets.floor} GHST ({this.state.mythicalTickets.perFren} GHST/fren)</a></p>
              <p><img src='/tickets/legendary.png' height='30px' /> Legendary Ticket Floor Price: <a href={this.state.legendaryTickets.link}>{this.state.legendaryTickets.floor} GHST ({this.state.legendaryTickets.perFren} GHST/fren)</a></p>
              <p><img src='/tickets/rare.png' height='30px' /> Rare Ticket Floor Price: <a href={this.state.rareTickets.link}>{this.state.rareTickets.floor} GHST ({this.state.rareTickets.perFren} GHST/fren)</a></p>
              <p><img src='/tickets/uncommon.png' height='30px' /> Uncommon Ticket Floor Price: <a href={this.state.uncommonTickets.link}>{this.state.uncommonTickets.floor} GHST ({this.state.uncommonTickets.perFren} GHST/fren)</a></p>
              <p><img src='/tickets/common.png' height='30px' /> Common Ticket Floor Price: <a href={this.state.commonTickets.link}>{this.state.commonTickets.floor} GHST ({this.state.commonTickets.perFren} GHST/fren)</a></p>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <Loading message="Loading floor prices from the Aavegotchi Baazaar" />
      );
    }
  }
}

export default FloorPrices;
