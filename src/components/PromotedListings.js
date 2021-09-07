import React, { Component } from 'react';
import { ReactSVG } from 'react-svg';

import { retrievePromoListings } from '../util/PromoUtil';
import wearableItemTypes from '../data/wearables/wearables.json';
import { wearableRarityLabel, wearablePositionLabel, wearableTraitModifiers } from '../util/AavegotchiMath';
import { ticketSvgByTokenId } from '../util/TicketSvgsUtil';

import promos from '../data/promos/promos.json';

import aavegotchiContractAbi from '../abi/diamond.json';
import contract from '../config/aavegotchiContract.json';
import { connectToMatic } from '../util/MaticClient';
import { generateGotchiUrl } from '../util/AavegotchiSvg';

class PromotedListings extends Component {
  constructor(props) {
    super(props);

    console.log(promos);

    this.state = {
      categories: {
        erc721: ['Unopened Portal', '', 'Open Portal', 'Aavegotchi'],
        erc1155: ['Wearable', '', 'Consumable', 'Ticket'],
      },
      erc721ListingIds: promos.erc721ListingIds,
      erc1155ListingIds: promos.erc1155ListingIds,
      listingInfo: {},
      promoted: [],
      mySvgObjects: {}
    };

    console.log(this.state);
  }

  fetchFromRPC(category, tokenId) {
    const _this = this;

    const maticPOSClient = connectToMatic();

    const aavegotchiContract = new maticPOSClient.web3Client.web3.eth.Contract(aavegotchiContractAbi, contract.address);

    console.log(aavegotchiContract);

    let response;

    if (category == 'Wearable' || category == 'Consumable') {
      response = aavegotchiContract.methods.getItemSvg(tokenId).call()
        .then((svg) => {
          console.log('svg for', tokenId);
          let mySvgObjects = _this.state.mySvgObjects;
          mySvgObjects[tokenId] = svg;
          _this.setState({ mySvgObjects: mySvgObjects });
        })
        .catch((error) => console.log(error));
    } else if (category == 'Ticket') {
      let mySvgObjects = _this.state.mySvgObjects;
      mySvgObjects[tokenId] = ticketSvgByTokenId(tokenId);
      _this.setState({ mySvgObjects: mySvgObjects });
    } else {
      response = aavegotchiContract.methods.getAavegotchiSvg(tokenId).call()
        .then((svg) => {
          console.log('svg for', tokenId);
          let mySvgObjects = _this.state.mySvgObjects;
          mySvgObjects[tokenId] = svg;
          _this.setState({ mySvgObjects: mySvgObjects });
        })
        .catch((error) => console.log(error));
    }


    return response;
  }

  async componentDidMount() {
    const _this = this;

    retrievePromoListings(this.state.erc721ListingIds, this.state.erc1155ListingIds)
      .then((listings) => {
        let listingInfo = { };

        for (let i = 0; i < listings.length; i++) {
          let l = listings[i];

          console.log(l);

          listingInfo[l.listingId] = {};

          let category = _this.state.categories[l.tokenType][parseInt(l.category)];

          this.fetchFromRPC(category, l.tokenId);

          if (category == 'Unopened Portal' || category == 'Open Portal') {
            listingInfo[l.listingId].title = `H${l.hauntId} ${category} #${l.tokenId}`;
            listingInfo[l.listingId].description = `Portal #${l.tokenId} from Haunt ${l.hauntId}`;
          } else if (category == 'Aavegotchi') {
            let t = l.gotchi.numericTraits;
            listingInfo[l.listingId].title = `H${l.hauntId} ${category} #${l.tokenId}`;
            listingInfo[l.listingId].description = `${l.gotchi.name} with BRS ${l.gotchi.baseRarityScore} & MRS ${l.gotchi.withSetsRarityScore}`;
            listingInfo[l.listingId].extra = `⚡️${t[0]} 👹${t[1]} 👻${t[2]} 🧠${t[3]} 👀${t[4]} 👁${t[5]}`;
          } else if (category == 'Wearable') {
            let w = wearableItemTypes[l.tokenId];
            let wRarity = wearableRarityLabel(w);
            let wSlot = wearablePositionLabel(w);
            listingInfo[l.listingId].title = `${w.name} Wearable #${l.tokenId}`;
            listingInfo[l.listingId].description = `${wRarity} ${wSlot} wearable with total supply of ${w.totalQuantity}`;
          } else if (category == 'Consumable') {
            const erc1155ConsumableTypes = {
              '126': { name: 'Kinship', points: 2, unit: 'Kinship' },
              '127': { name: 'Greater Kinship', points: 10, unit: 'Kinship' },
              '128': { name: 'XP', points: 20, unit: 'XP' },
              '129': { name: 'Greater XP', points: 50, unit: 'XP' },
            };

            let consumable = erc1155ConsumableTypes[l.tokenId];
            listingInfo[l.listingId].title = `${consumable.name} ${category}`;
            listingInfo[l.listingId].description = `${consumable.name} potion gives ${consumable.points} ${consumable.unit}`;
          } else if (category == 'Ticket') {
            const ticketRarity = ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical', 'Godlike', 'Drop'];
            listingInfo[l.listingId].title = `${ticketRarity[l.tokenId]} ${category}`;
            listingInfo[l.listingId].description = `${ticketRarity[l.tokenId]} ${category} usable in raffles`;
          }

          if (l.tokenType == 'erc721') {
            listingInfo[l.listingId].price = `${l.price} GHST`;
          } else {
            listingInfo[l.listingId].price = `${l.quantity} @ ${l.price} GHST each`;
          }
        }

        this.setState({ promoted: listings, listingInfo });
      });
  }

  renderListings() {
    const _this = this;

    if (this.state.promoted.length > 0) {
      let promoCards = this.state.promoted.map((l, index) => {
        if (this.state.mySvgObjects[l.tokenId]) {
          let blobUrl = generateGotchiUrl(this.state.mySvgObjects[l.tokenId]);;

          let info = this.state.listingInfo[l.listingId];
          return (
            <div className="col d-flex align-items-stretch" key={`svgcard${l.listingId}`}>
              <div className="card" style={ { width: '10.5rem', 'margin-bottom': '5px', fontSize: '11px', cursor: 'pointer'} } onClick={() => this.selectListing(l.tokenType, l.listingId)}>
                <div className="card-img-top" style={{ display: 'flex', 'align-items': 'center', 'justify-content': 'center' }}>
                  <img src={blobUrl} />
                </div>
                <div className="card-body">
                  <p><b className="card-title">{info.title}</b></p>
                  <p className="card-text">{info.description}</p>
                  {info.extra &&
                    <p className="card-text">{info.extra}</p>
                  }
                  <p className="card-text">{info.price}</p>
                </div>
              </div>
            </div>
          );
        }
      }, this);

      return(
        <div className="container">
          <div className="row">
            {promoCards}
          </div>
        </div>
      );
    }
  }

  selectListing(tokenType, listingId) {
    // submit click
    // then navigate to listing
    window.location.href = `https://aavegotchi.com/baazaar/${tokenType}/${listingId}`;
  }

  render() {
    return(
      <div>
        <p>Promoted Baazaar Listings <a href='/promote'>(promote your listing)</a></p>
        {this.renderListings()}
      </div>
    );
  }
}

export default PromotedListings;
