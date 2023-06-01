import React, { Component } from 'react';

import {
    erc1155FloorPriceById,
} from '../util/FloorPricesUtil';

import {
    alloyPurchaseCostToForge,
    alloyFloorPrices,
    coreFloorPrice,
    schematicFloorPrice
} from '../util/ForgeUtil';

import { ethers } from "ethers";
import { DataGrid } from '@material-ui/data-grid';

import { getSlotLabel, wearableTraitModifiers } from '../util/AavegotchiMath';

import Loading from './Loading';

import wearableItemTypes from '../data/wearables/wearables.json';

export default class ForgeOrBuy extends Component {
    constructor(props) {
        super(props);
    
        document.title = this.props.title;
    
        this.state = {
            loading: true,
            rarity: "Common",
            slot: "Head",
            filteredWearables: [],
        };
    }

    async componentDidMount() {
        this.filterWearables();
    }

    onInputChange(event) {
        console.log('onInputChange', event.target.id, event.target.value);
        this.setState(
          { [event.target.id]: event.target.value },
          () => {
            this.onChangeDebounced(event);
          }
        );
      }
    
    onChangeDebounced(event) {
        console.log('onChangeDebounced', event);
        this.filterWearables();
    }

    renderFilters() {
        return(
            <div>
                <form class="row g-3">
                    <div class="col-2">
                        <label for="rarity" class="form-label">Rarity</label>
                        <select id="rarity" class="form-select" onChange={(event) => this.onInputChange(event)} value={this.state.rarity}>
                            <option>Common</option>
                            <option>Uncommon</option>
                            <option>Rare</option>
                            <option>Legendary</option>
                            <option>Mythical</option>
                            <option>Godlike</option>
                        </select>
                    </div>

                    <div class="col-2">
                        <label for="slot" class="form-label">Slot</label>
                        <select id="slot" class="form-select" onChange={(event) => this.onInputChange(event)} value={this.state.slot}>
                            <option>Head</option>
                            <option>Body</option>
                            <option>Eyes</option>
                            <option>Face</option>
                            <option>Hands</option>
                            <option>Pet</option>
                        </select>
                    </div>
                </form>
            </div>
        );
    }

    async filterWearables() {
        let filteredWearables = [];
        let filteredWearableIds = [];
    
        let rarityLookup = {'1': 'Common', '2': 'Uncommon', '5': 'Rare', '10': 'Legendary', '20': 'Mythical', '50': 'Godlike'};
    
        Object.keys(wearableItemTypes).map((key, index) => {
          let w = wearableItemTypes[key];

          let wRarity = rarityLookup[w.rarityScoreModifier];
          let wSlot = getSlotLabel(w.slotPositions, true);

          if (wRarity == this.state.rarity && wSlot == this.state.slot) {
            filteredWearables.push({
                id: key,
                name: w.name,
                slot: wSlot,
                rarity: wRarity,
                totalQuantity: parseInt(w.totalQuantity),
                traitModifiers: wearableTraitModifiers(w.traitModifiers)
            });

            filteredWearableIds.push(key);
          }
        });

        let _this = this;
        filteredWearableIds.map((i, index) => {
            erc1155FloorPriceById(0, i)
              .then(async (listings) => {
                let floor = 0;
                let link = 'https://app.aavegotchi.com/baazaar';
                if (listings.length > 0) {
                  floor = ethers.utils.formatEther(listings[0].priceInWei);
                  link = `https://app.aavegotchi.com/baazaar/erc1155/${listings[0].id}`;
                }

                let schematicPrice = await schematicFloorPrice(i);
                
                _this.setState({ [filteredWearableIds[index]]: { listings, floor, link, schematicFloor: schematicPrice.floor, schematicLink: schematicPrice.link  } });
              });
        });

        let alloyFloorListings = await alloyFloorPrices(this.state.rarity)
        let alloyCost = await alloyPurchaseCostToForge(alloyFloorListings, this.state.rarity)
        let coreCost = await coreFloorPrice(this.state.rarity, this.state.slot)

        this.setState({
            filteredWearables,
            filteredWearableIds,
            alloyFloorListings,
            alloyCost,
            coreCost,
            loading: false,
        });
    }

    renderCalculator() {
        console.log(this.state);
        if (this.state.filteredWearables.length > 0) {
            const columns = [
                {
                  field: 'id',
                  headerName: 'ID',
                  width: 80,
                  renderCell: (params: GridCellParams) => (
                    <a href={`/wearables/${params.value}`} target="_blank">
                      {params.value}
                    </a>
                  )
                },
                { field: 'name', headerName: 'Name', width: 240 },
                { field: 'slot', headerName: 'Slot', width: 80 },
                { field: 'rarity', headerName: 'Rarity', width: 100 },
                // { field: 'totalQuantity', headerName: 'Total Quantity', width: 180 },
                // { field: 'traitModifiers', headerName: 'Trait Modifiers', width: 240 },
                { field: 'floor', headerName: 'Baazaar Floor', width: 180 },
                { field: 'totalForgeCost', headerName: 'Forge Cost', width: 160 },
                { field: 'forgingSavings', headerName: 'Forging Savings', width: 160 },
                { field: 'baazaarSpot', headerName: 'Baazaar Spot Price', width: 180 },
                { field: 'baazaarSale', headerName: 'Baazaar Last Sale', width: 180 },
                {
                    field: 'link',
                    headerName: 'Baazaar Link',
                    width: 160,
                    renderCell: (params: GridCellParams) => (
                      <a href={params.value} target="_blank">
                        Buy
                      </a>
                    )
                },
                { field: 'alloyCost', headerName: 'Alloy Cost', width: 160 },
                { field: 'coreCost', headerName: 'Core Cost', width: 160 },
                {
                    field: 'coreLink',
                    headerName: 'Baazaar Link',
                    width: 160,
                    renderCell: (params: GridCellParams) => (
                      <a href={params.value} target="_blank">
                        Buy
                      </a>
                    )
                },

                { field: 'schematicCost', headerName: 'Schematic Cost', width: 160 },
                {
                    field: 'schematicLink',
                    headerName: 'Baazaar Link',
                    width: 160,
                    renderCell: (params: GridCellParams) => (
                      <a href={params.value} target="_blank">
                        Buy
                      </a>
                    )
                },
            ];

            let rows = [];

            this.state.filteredWearables.map((w, index) => {
                let r = w;
                if (this.state[w.id]) {
                    r.floor = parseFloat(this.state[w.id].floor);
                    r.link = this.state[w.id].link;
                    r.alloyCost = parseFloat(this.state.alloyCost);
                    r.coreCost = parseFloat(this.state.coreCost.floor);
                    r.coreLink = this.state.coreCost.link;
                    r.schematicCost = parseFloat(this.state[w.id].schematicFloor);
                    r.schematicLink = this.state[w.id].schematicLink;

                    if (r.alloyCost == 0 || r.coreCost == 0 || r.schematicCost == 0) {
                        r.totalForgeCost = 0;
                        r.forgingSavings = 0;
                    } else {
                        r.totalForgeCost = r.alloyCost+r.coreCost+r.schematicCost;
                        r.forgingSavings = 100.0 * ((r.floor - r.totalForgeCost) / r.floor);
                    }
                }
                rows.push(r);
            });
           
            return(
              <div>
                <h2>Wearables Forge vs Buy Costs</h2>
                <p>Note that 0 for the Alloy Costs means there is insufficient alloy available on the Baazaar to forge your item and you will need to source the Alloy through smelting or other means</p>
                <div style={{ height: '1080px', width: '100%' }}>
                  <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
                </div>
              </div>
            );
        }
      }

    render() {
        return(
            <div className="container">
                <h2>Forge or Buy</h2>
                {this.renderFilters()}
                {this.state.loading ? <Loading /> : this.renderCalculator()}
            </div>
        );
    }
}