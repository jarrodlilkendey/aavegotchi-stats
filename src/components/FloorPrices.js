import React, { Component } from 'react';

import { erc721FloorPrice, erc1155FloorPrice, erc1155FloorPriceById, erc721CheapestMythEyes, erc721CheapestByWearableRarity, cheapestXP, cheapestKIN, portalOptionCheapestMythEyes, floorByBRS } from '../util/FloorPricesUtil';

import { ethers } from "ethers";

import Loading from './Loading';

import wearableItemTypes from '../data/wearables/wearables.json';

class FloorPrices extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    this.state = {
      floorByBRS: {}
    };
  }

  async componentDidMount() {
    const _this = this;

    const erc721Types = ['h1ClosedPortals', 'h2ClosedPortals', 'h1OpenPortals', 'h2OpenPortals', 'h1Aavegotchis', 'h2Aavegotchis'];
    const erc721Indexes = [0, 0, 2, 2, 3, 3];
    const haunts = [1, 2, 1, 2, 1, 2];
    erc721Indexes.map((i, index) => {
      erc721FloorPrice(i, haunts[index])
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
    const erc1155ConsumableUnitLabel = ['kinship', 'kinship', 'xp', 'xp'];
    const erc1155PointsPerUnit = [2, 10, 20, 50];

    erc1155ConsumableIds.map((i, index) => {
      erc1155FloorPriceById(2, i)
        .then((listings) => {
          let floor = 0;
          let link = 'https://aavegotchi.com/baazaar';
          let unit = '';
          if (listings.length > 0) {
            floor = ethers.utils.formatEther(listings[0].priceInWei);
            link = `https://aavegotchi.com/baazaar/erc1155/${listings[0].id}`;
            let unitPrice = parseInt(floor) / erc1155PointsPerUnit[index];
            unit = `(${unitPrice} GHST/${erc1155ConsumableUnitLabel[index]})`;
          }
          _this.setState({ [erc1155ConsumableTypes[index]]: { listings, floor, link, unit  } });
        });
    });

    erc721CheapestMythEyes(1)
      .then((listings) => {
        let floor = 0;
        let link = 'https://aavegotchi.com/baazaar';
        let tokenId = '';
        if (listings.length > 0) {
          floor = ethers.utils.formatEther(listings[0].priceInWei);
          link = `https://aavegotchi.com/baazaar/erc721/${listings[0].id}`;
          tokenId = listings[0].gotchi.id;
        }
        _this.setState({ h1MythEyes: { listings, floor, link, tokenId  } });
      });

    erc721CheapestMythEyes(2)
      .then((listings) => {
        let floor = 0;
        let link = 'https://aavegotchi.com/baazaar';
        let tokenId = '';
        if (listings.length > 0) {
          floor = ethers.utils.formatEther(listings[0].priceInWei);
          link = `https://aavegotchi.com/baazaar/erc721/${listings[0].id}`;
          tokenId = listings[0].gotchi.id;
        }
        _this.setState({ h2MythEyes: { listings, floor, link, tokenId  } });
      });

    erc721CheapestByWearableRarity()
      .then((listings) => {

        console.log('erc721CheapestByWearableRarity', listings);

        let godlikeFloor = 0;
        let mythicalFloor = 0;
        let legendaryFloor = 0;

        let godlikeLink = 'https://aavegotchi.com/baazaar';
        let mythicalLink = 'https://aavegotchi.com/baazaar';
        let legendaryLink = 'https://aavegotchi.com/baazaar';

        let godlikeTokenId = 'No Listings';
        let mythicalTokenId = 'No Listings';
        let legendaryTokenId = 'No Listings';

        if (listings.aavegotchiGodlikes.length > 0) {
          godlikeFloor = ethers.utils.formatEther(listings.aavegotchiGodlikes[0].priceInWei);
          godlikeLink = `https://aavegotchi.com/baazaar/erc721/${listings.aavegotchiGodlikes[0].id}`;
          godlikeTokenId = `#${listings.aavegotchiGodlikes[0].gotchi.id}`;
        }

        if (listings.aavegotchiMythicals.length > 0) {
          mythicalFloor = ethers.utils.formatEther(listings.aavegotchiMythicals[0].priceInWei);
          mythicalLink = `https://aavegotchi.com/baazaar/erc721/${listings.aavegotchiMythicals[0].id}`;
          mythicalTokenId = `#${listings.aavegotchiMythicals[0].gotchi.id}`;
        }

        if (listings.aavegotchiLegendaries.length > 0) {
          legendaryFloor = ethers.utils.formatEther(listings.aavegotchiLegendaries[0].priceInWei);
          legendaryLink = `https://aavegotchi.com/baazaar/erc721/${listings.aavegotchiLegendaries[0].id}`;
          legendaryTokenId = `#${listings.aavegotchiLegendaries[0].gotchi.id}`;
        }

        _this.setState({
            aavegotchiGodlike: { listings: listings.aavegotchiGodlikes, floor: godlikeFloor, link: godlikeLink, tokenId: godlikeTokenId  },
            aavegotchiMythical: { listings: listings.aavegotchiMythicals, floor: mythicalFloor, link: mythicalLink, tokenId: mythicalTokenId  },
            aavegotchiLegendary: { listings: listings.aavegotchiLegendaries, floor: legendaryFloor, link: legendaryLink, tokenId: legendaryTokenId  },
        });
      });

      // portalOptionCheapestMythEyes(1)
      //   .then((listings) => {
      //     console.log('h1 open portal myth eyes', listings);
      //   });
      //
      // portalOptionCheapestMythEyes(2)
      //   .then((listings) => {
      //     console.log('h2 open portal myth eyes', listings);
      //   });

      cheapestXP()
        .then((listings) => {
          console.log('cheapestXP', listings);
          let floor = 0;
          let link = 'https://aavegotchi.com/baazaar';
          let tokenId = 'No Listings';
          let unit = 0;
          if (listings.length > 0) {
            floor = ethers.utils.formatEther(listings[0].priceInWei);
            link = `https://aavegotchi.com/baazaar/erc721/${listings[0].id}`;
            tokenId = `#${listings[0].gotchi.id}`;
            unit = `(${listings[0].ghstPerXp.toFixed(3)} GHST/xp)`;
          }
          _this.setState({ aavegotchiXP: { listings, floor, link, tokenId, unit } });
        });

      cheapestKIN()
        .then((listings) => {
          console.log('cheapestKIN', listings);
          let floor = 0;
          let link = 'https://aavegotchi.com/baazaar';
          let tokenId = 'No Listings';
          let unit = 0;
          if (listings.length > 0) {
            floor = ethers.utils.formatEther(listings[0].priceInWei);
            link = `https://aavegotchi.com/baazaar/erc721/${listings[0].id}`;
            tokenId = `#${listings[0].gotchi.id}`;
            unit = `(${listings[0].ghstPerKinship.toFixed(3)} GHST/kinship)`;
          }
          _this.setState({ aavegotchiKinship: { listings, floor, link, tokenId, unit } });
        });

      floorByBRS()
        .then((floorByBRS) => {
          console.log('floorByBRS', floorByBRS);
          _this.setState({ floorByBRS });
        });
  }

  renderFloorByBRS() {
    if (Object.keys(this.state.floorByBRS).length > 0) {
      let brsList = [500, 510, 520, 530, 540, 550, 560, 570, 575];

      let brsFloors = brsList.map((brs) => {
        let f = this.state.floorByBRS[brs.toString()];
        return (
          <p><img src='/portals/aavegotchi.png' height='30px' /> Gotchi BRS ≥ {brs} Floor Price: <a href={f.link}>{f.floor} GHST</a> ({f.tokenId} {f.brs} BRS)</p>
        );
      }, this);

      return(
        <div>
          {brsFloors}
        </div>
      );
    }
  }


  render() {
    if (this.state.h1ClosedPortals && this.state.h1OpenPortals && this.state.h1Aavegotchis
      && this.state.h2ClosedPortals && this.state.h2OpenPortals && this.state.h2Aavegotchis
      && this.state.commonWearables && this.state.uncommonWearables && this.state.rareWearables && this.state.legendaryWearables && this.state.mythicalWearables
      && this.state.godlikeWearables && this.state.commonTickets && this.state.uncommonTickets && this.state.rareTickets
      && this.state.legendaryTickets && this.state.mythicalTickets && this.state.godlikeTickets && this.state.dropTickets
      && this.state.kinship && this.state.greaterKinship && this.state.xp && this.state.greaterXp && this.state.h1MythEyes && this.state.h2MythEyes
      && this.state.aavegotchiGodlike && this.state.aavegotchiMythical && this.state.aavegotchiLegendary && this.state.aavegotchiXP && this.state.aavegotchiKinship) {
      return(
        <div className="container">
          <h2>Aavegotchi Baazaar Floor Prices</h2>
          <div className="row">
            <div className="col">
              <h3>Portals</h3>
              <p><img src='/portals/h1closedportal.gif' height='30px' /> H1 Closed Portal Floor Price: <a href={this.state.h1ClosedPortals.link}>{this.state.h1ClosedPortals.floor} GHST</a> (#{this.state.h1ClosedPortals.tokenId})</p>
              <p><img src='/portals/h2closedportal.gif' height='30px' /> H2 Closed Portal Floor Price: <a href={this.state.h2ClosedPortals.link}>{this.state.h2ClosedPortals.floor} GHST</a> (#{this.state.h2ClosedPortals.tokenId})</p>
              <p><img src='/portals/h1openportal.gif' height='30px' /> H1 Open Portal Floor Price: <a href={this.state.h1OpenPortals.link}>{this.state.h1OpenPortals.floor} GHST</a> (#{this.state.h1OpenPortals.tokenId})</p>
              <p><img src='/portals/h2openportal.gif' height='30px' /> H2 Open Portal Floor Price: <a href={this.state.h2OpenPortals.link}>{this.state.h2OpenPortals.floor} GHST</a> (#{this.state.h2OpenPortals.tokenId})</p>
              <h3>Aavegotchis</h3>
              <p><img src='/portals/aavegotchi.png' height='30px' /> H1 Aavegotchi Floor Price: <a href={this.state.h1Aavegotchis.link}>{this.state.h1Aavegotchis.floor} GHST</a> (#{this.state.h1Aavegotchis.tokenId})</p>
              <p><img src='/portals/aavegotchi.png' height='30px' /> H2 Aavegotchi Floor Price: <a href={this.state.h2Aavegotchis.link}>{this.state.h2Aavegotchis.floor} GHST</a> (#{this.state.h2Aavegotchis.tokenId})</p>
              <p><img src='/portals/aavegotchi.png' height='30px' /> H1 Myth Eyes Aavegotchi Floor Price: <a href={this.state.h1MythEyes.link}>{this.state.h1MythEyes.floor} GHST</a> (#{this.state.h1MythEyes.tokenId})</p>
              <p><img src='/portals/aavegotchi.png' height='30px' /> H2 Myth Eyes Aavegotchi Floor Price: <a href={this.state.h2MythEyes.link}>{this.state.h2MythEyes.floor} GHST</a> (#{this.state.h2MythEyes.tokenId})</p>
              <p><img src='/portals/aavegotchi.png' height='30px' /> Aavegotchi with Godlike Floor Price: <a href={this.state.aavegotchiGodlike.link}>{this.state.aavegotchiGodlike.floor} GHST</a> ({this.state.aavegotchiGodlike.tokenId})</p>
              <p><img src='/portals/aavegotchi.png' height='30px' /> Aavegotchi with Mythical Floor Price: <a href={this.state.aavegotchiMythical.link}>{this.state.aavegotchiMythical.floor} GHST</a> ({this.state.aavegotchiMythical.tokenId})</p>
              <p><img src='/portals/aavegotchi.png' height='30px' /> Aavegotchi with Legendary Floor Price: <a href={this.state.aavegotchiLegendary.link}>{this.state.aavegotchiLegendary.floor} GHST</a> ({this.state.aavegotchiLegendary.tokenId})</p>
              {this.renderFloorByBRS()}
            </div>
            <div className="col">
              <h3>Wearables</h3>
              <p><img src='/tickets/godlike.png' height='30px' /> Godlike Wearable Floor Price: <a href={this.state.godlikeWearables.link}>{this.state.godlikeWearables.floor} GHST</a> ({this.state.godlikeWearables.name})</p>
              <p><img src='/tickets/mythical.png' height='30px' /> Mythical Wearable Floor Price: <a href={this.state.mythicalWearables.link}>{this.state.mythicalWearables.floor} GHST</a> ({this.state.mythicalWearables.name})</p>
              <p><img src='/tickets/legendary.png' height='30px' /> Legendary Wearable Floor Price: <a href={this.state.legendaryWearables.link}>{this.state.legendaryWearables.floor} GHST</a> ({this.state.legendaryWearables.name})</p>
              <p><img src='/tickets/rare.png' height='30px' /> Rare Wearable Floor Price: <a href={this.state.rareWearables.link}>{this.state.rareWearables.floor} GHST</a> ({this.state.rareWearables.name})</p>
              <p><img src='/tickets/uncommon.png' height='30px' /> Uncommon Wearable Floor Price: <a href={this.state.uncommonWearables.link}>{this.state.uncommonWearables.floor} GHST</a> ({this.state.uncommonWearables.name})</p>
              <p><img src='/tickets/common.png' height='30px' /> Common Wearable Floor Price: <a href={this.state.commonWearables.link}>{this.state.commonWearables.floor} GHST</a> ({this.state.commonWearables.name})</p>
              <h3>Tickets</h3>
              <p><img src='/tickets/godlike.png' height='30px' /> Godlike Ticket Floor Price: <a href={this.state.godlikeTickets.link}>{this.state.godlikeTickets.floor} GHST ({this.state.godlikeTickets.perFren} GHST/fren)</a></p>
              <p><img src='/tickets/drop.png' height='30px' /> Drop Ticket Floor Price: <a href={this.state.dropTickets.link}>{this.state.dropTickets.floor} GHST ({this.state.dropTickets.perFren} GHST/fren)</a></p>
              <p><img src='/tickets/mythical.png' height='30px' /> Mythical Ticket Floor Price: <a href={this.state.mythicalTickets.link}>{this.state.mythicalTickets.floor} GHST ({this.state.mythicalTickets.perFren} GHST/fren)</a></p>
              <p><img src='/tickets/legendary.png' height='30px' /> Legendary Ticket Floor Price: <a href={this.state.legendaryTickets.link}>{this.state.legendaryTickets.floor} GHST ({this.state.legendaryTickets.perFren} GHST/fren)</a></p>
              <p><img src='/tickets/rare.png' height='30px' /> Rare Ticket Floor Price: <a href={this.state.rareTickets.link}>{this.state.rareTickets.floor} GHST ({this.state.rareTickets.perFren} GHST/fren)</a></p>
              <p><img src='/tickets/uncommon.png' height='30px' /> Uncommon Ticket Floor Price: <a href={this.state.uncommonTickets.link}>{this.state.uncommonTickets.floor} GHST ({this.state.uncommonTickets.perFren} GHST/fren)</a></p>
              <p><img src='/tickets/common.png' height='30px' /> Common Ticket Floor Price: <a href={this.state.commonTickets.link}>{this.state.commonTickets.floor} GHST ({this.state.commonTickets.perFren} GHST/fren)</a></p>
              <h3>Consumables</h3>
              <p><img src='/consumables/xp.svg' height='30px' /> XP Potion Floor Price: <a href={this.state.xp.link}>{this.state.xp.floor} GHST {this.state.xp.unit}</a></p>
              <p><img src='/consumables/greaterxp.svg' height='30px' /> Greater XP Potion Floor Price: <a href={this.state.greaterXp.link}>{this.state.greaterXp.floor} GHST {this.state.greaterXp.unit}</a></p>
              <p><img src='/portals/aavegotchi.png' height='30px' /> Cheapest Aavegotchi by XP: <a href={this.state.aavegotchiXP.link}>{this.state.aavegotchiXP.floor} GHST {this.state.aavegotchiXP.unit}</a> ({this.state.aavegotchiXP.tokenId})</p>
              <p><img src='/consumables/kinship.svg' height='30px' /> KINSHIP Potion Floor Price: <a href={this.state.kinship.link}>{this.state.kinship.floor} GHST {this.state.kinship.unit}</a></p>
              <p><img src='/consumables/greaterkinship.svg' height='30px' /> Greater KINSHIP Potion Floor Price: <a href={this.state.greaterKinship.link}>{this.state.greaterKinship.floor} GHST {this.state.greaterKinship.unit}</a></p>
              <p><img src='/portals/aavegotchi.png' height='30px' /> Cheapest Aavegotchi by KINSHIP: <a href={this.state.aavegotchiKinship.link}>{this.state.aavegotchiKinship.floor} GHST {this.state.aavegotchiKinship.unit}</a> ({this.state.aavegotchiKinship.tokenId})</p>
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
