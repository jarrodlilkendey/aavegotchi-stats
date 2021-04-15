import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { DataGrid } from '@material-ui/data-grid';

import DatePicker from 'react-datepicker';

import Loading from './Loading';

import { retrieveSoldWearableListings } from '../util/Graph';
import { formatGhst, wearableRarityLabel, wearablePositionLabel } from '../util/AavegotchiMath';

import wearableItemTypes from '../data/wearables/wearables.json';

const _ = require('lodash');
const moment = require('moment');

class WearableSales extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    this.state = {
      sales: [],
      sellers: {},
      buyers: {},
      gotchiIds: [],
      salesChartData: [],
      wearableSales: [],
      filteredWearableSales: [],
      loading: true
    };

    this.onChangeDebounced = _.debounce(this.onChangeDebounced, 2000);
  }

  async componentDidMount() {
    retrieveSoldWearableListings()
      .then((listings) => {
        let sellers = {};
        let buyers = {};
        let wearableIds = [];
        let earliestDate = 0;

        listings.map(function(listing, index) {
          listings[index].timeLastPurchased = parseInt(listing.timeLastPurchased);
          listings[index].formattedTime = moment.unix(parseInt(listing.timeLastPurchased)).format("MMM DD YYYY");
          listings[index].priceInGhst = formatGhst(listing.priceInWei);
          listings[index].quantity = parseInt(listing.quantity);
          listings[index].totalPrice = listing.quantity * listings[index].priceInGhst;
          listings[index].rarity = wearableRarityLabel(wearableItemTypes[listing.erc1155TypeId]);
          listings[index].slot = wearablePositionLabel(wearableItemTypes[listing.erc1155TypeId]);
          listings[index].name = wearableItemTypes[listing.erc1155TypeId].name;

          if (index == 0) {
            earliestDate = listings[index].timeLastPurchased;
          } else if (listings[index].timeLastPurchased < earliestDate) {
            earliestDate = listings[index].timeLastPurchased;
          }

          if (!_.includes(sellers, listings[index].seller)) {
            if (!sellers.hasOwnProperty(listings[index].seller)) {
              sellers[listings[index].seller] = { listings: [listings[index]] };
            } else {
              sellers[listings[index].seller].listings = [...sellers[listings[index].seller].listings, listings[index]];
            }
          }

          if (!_.includes(buyers, listings[index].buyer)) {
            if (!buyers.hasOwnProperty(listings[index].buyer)) {
              buyers[listings[index].buyer] = { listings: [listings[index]] };
            } else {
              buyers[listings[index].buyer].listings = [...buyers[listings[index].buyer].listings, listings[index]];
            }
          }

          if (!_.includes(wearableIds, listings[index].erc1155TypeId)) {
            wearableIds.push(listings[index].erc1155TypeId);
          }
        });

        console.log('sales', listings);
        console.log('sellers', sellers);
        console.log('buyers', buyers);
        console.log('wearableIds', wearableIds);

        let dateFrom = new Date(earliestDate * 1000);
        dateFrom.setHours(0,0,0,0);

        let dateTo = new Date();
        dateTo.setHours(23,59,59,999);

        this.setState({ wearableSales: listings, sellers, buyers, wearableIds, dateFrom, dateTo, loading: false });

        this.applyFilters();
      });
  }

  refreshVisualisations() {
    this.prepareSalesAvgPriceChartData();
    this.prepareRarityChartData();
    this.prepareSlotChartData();
  }

  applyFilters() {
    const _this = this;

    let filteredWearableSales = [...this.state.wearableSales];
    let filteredSellers = {};
    let filteredBuyers = {};
    let filteredWearableIds = [];

    // apply date filters
    if (this.state.dateFrom) {
      filteredWearableSales = _.filter(filteredWearableSales, function(w) { return new Date(w.timeLastPurchased * 1000) >= _this.state.dateFrom; });
    }

    if (this.state.dateTo) {
      filteredWearableSales = _.filter(filteredWearableSales, function(w) { return new Date(w.timeLastPurchased * 1000) <= _this.state.dateTo; });
    }

    // apply price filters
    if (this.state.priceFrom && this.state.priceFrom != '') {
      filteredWearableSales = _.filter(filteredWearableSales, function(w) { return w.priceInGhst >= _this.state.priceFrom; });
    }

    if (this.state.priceTo && this.state.priceTo != '') {
      filteredWearableSales = _.filter(filteredWearableSales, function(w) { return w.priceInGhst <= _this.state.priceTo; });
    }

    // apply account filters
    if (this.state.account && this.state.account != '') {
      filteredWearableSales = _.filter(filteredWearableSales, function(w) { return w.buyer.toLowerCase().includes(_this.state.account.toLowerCase()) || w.seller.toLowerCase().includes(_this.state.account.toLowerCase()); });
    }

    // apply name filters
    if (this.state.wearable && this.state.wearable != '') {
      filteredWearableSales = _.filter(filteredWearableSales, function(w) { return w.name.toLowerCase().includes(_this.state.wearable.toLowerCase()); });
    }

    // apply rarity filters
    if (this.state.rarity && this.state.rarity != '' && this.state.rarity != 'Any') {
      filteredWearableSales = _.filter(filteredWearableSales, function(w) { return w.rarity == _this.state.rarity; });
    }

    // apply slot filters
    if (this.state.slot && this.state.slot != '' && this.state.slot != 'Any') {
      filteredWearableSales = _.filter(filteredWearableSales, function(w) { return w.slot == _this.state.slot; });
    }

    // order by time last purchased
    filteredWearableSales = _.orderBy(filteredWearableSales, 'timeLastPurchased', 'desc');

    filteredWearableSales.map(function(listing, index) {
      if (!_.includes(filteredSellers, filteredWearableSales[index].seller)) {
        if (!filteredSellers.hasOwnProperty(filteredWearableSales[index].seller)) {
          filteredSellers[filteredWearableSales[index].seller] = { listings: [filteredWearableSales[index]] };
        } else {
          filteredSellers[filteredWearableSales[index].seller].listings = [...filteredSellers[filteredWearableSales[index].seller].listings, filteredWearableSales[index]];
        }
      }

      if (!_.includes(filteredBuyers, filteredWearableSales[index].buyer)) {
        if (!filteredBuyers.hasOwnProperty(filteredWearableSales[index].buyer)) {
          filteredBuyers[filteredWearableSales[index].buyer] = { listings: [filteredWearableSales[index]] };
        } else {
          filteredBuyers[filteredWearableSales[index].buyer].listings = [...filteredBuyers[filteredWearableSales[index].buyer].listings, filteredWearableSales[index]];
        }
      }

      if (!_.includes(filteredWearableIds, filteredWearableSales[index].erc1155TypeId)) {
        filteredWearableIds.push(filteredWearableSales[index].erc1155TypeId);
      }
    });

    this.setState(
      { filteredWearableSales, filteredBuyers, filteredSellers, filteredWearableIds },
      () => {
        this.refreshVisualisations();
      }
    );

    console.log('filteredWearableSales', filteredWearableSales, _this.state.dateFrom, _this.state.dateTo);
    console.log('filtered', filteredBuyers, filteredSellers, filteredWearableIds);
  }

  prepareSalesAvgPriceChartData() {
    let data = { 'totalSales': [], 'averageSales': [] };
    let totalSales = { };
    let averageSales = { };

    _.orderBy(this.state.filteredWearableSales, ['timeLastPurchased', 'desc']).map(function(listing, index) {
      if (!totalSales.hasOwnProperty(listing.formattedTime)) {
        totalSales[listing.formattedTime] = 1 * listing.quantity;
        averageSales[listing.formattedTime] = [];
        for (let q = 0; q < listing.quantity; q++) {
          averageSales[listing.formattedTime].push(listing.priceInGhst);
        }
      } else {
        totalSales[listing.formattedTime] += (1 * listing.quantity);
        for (let q = 0; q < listing.quantity; q++) {
          averageSales[listing.formattedTime].push(listing.priceInGhst);
        }
      }
    });

    Object.keys(totalSales).map(function(date, index) {
      data.totalSales.push([date, totalSales[date]]);
      data.averageSales.push([date, parseFloat(_.mean(averageSales[date]).toFixed(2))]);
    });

    this.setState({ salesChartData: data });

    console.log('salesChartDate', data, averageSales);
  }

  prepareRarityChartData() {
    const _this = this;
    let rarityData = [];
    let totalSales = this.state.filteredWearableSales.length;

    let rarities = ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical' ,'Godlike'];
    let colors = ['#8064ff', '#33bacc', '#59bcff', '#ffc36b', '#ff96ff', '#51ffa8'];
    rarities.map(function(r, index) {
      let countRarity = _.filter(_this.state.filteredWearableSales, ['rarity', r]).length;
      if (countRarity > 0) {
        let rarityPercentage = parseFloat(((countRarity/totalSales)*100).toFixed(2));
        rarityData.push({
          name: r,
          y: rarityPercentage,
          color: colors[index]
        });
      }
    });

    console.log('prepareRarityChartData', rarityData);
    this.setState({ rarityData });
  }

  prepareSlotChartData() {
    const _this = this;
    let slotData = [];
    let totalSales = this.state.filteredWearableSales.length;
    let slots = ['Body', 'Face', 'Eyes', 'Head', 'Hand', 'Pet', 'Background'];
    slots.map(function(s, index) {
      let countSlot = _.filter(_this.state.filteredWearableSales, ['slot', s]).length;
      if (countSlot > 0) {
        let slotPercentage = parseFloat(((countSlot/totalSales)*100).toFixed(2));
        slotData.push({
          name: s,
          y: slotPercentage
        });
      }
    });

    console.log('prepareSlotChartData', slotData);
    this.setState({ slotData });
  }

  renderSalesAvgPriceChart() {
    if (this.state.salesChartData && this.state.salesChartData.totalSales && this.state.salesChartData.totalSales.length > 0) {
      const options = {
        chart: { zoomType: 'xy' },
        title: { text: 'Wearable Sales Over Time' },
        subtitle: { text: 'Daily Sales Volume and Average Sales Price' },

        series: [{
          data: this.state.salesChartData.totalSales,
          name: 'Number of Sales',
          type: 'column',
        }, {
          data: this.state.salesChartData.averageSales,
          name: 'Average Sale Price (GHST)',
          type: 'spline',
          yAxis: 1
        }],

        yAxis: [
          {
            title: {
              text: 'Number of Sales',
              style: {
                color: Highcharts.getOptions().colors[0]
              },
            },
            labels: {
              format: '{value} Sales',
              style: {
                color: Highcharts.getOptions().colors[0]
              }
            },
          },
          {
            title: {
              text: 'Average Sale Price',
              style: {
                color: Highcharts.getOptions().colors[1]
              },
            },
            labels: {
              format: '{value} GHST',
              style: {
                color: Highcharts.getOptions().colors[1]
              }
            },
            opposite: true
          },
        ],

        tooltip: {
          shared: true
        },

        xAxis: {
          title: {
            text: 'Date'
          },
          type: 'category',
          crosshair: true
        },

        credits: {
          enabled: true,
          href: 'https://aavegotchistats.com/wearablesales',
          text: 'aavegotchistats.com/wearablesales'
        }
      };

      return (
        <div>
          <h2>Wearable Sales Over Time</h2>
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
          />
        </div>
      );
    }
  }

  renderSalesTable() {
    if (this.state.filteredWearableSales.length > 0) {
      const columns = [
        {
          field: 'id',
          headerName: 'Listing',
          width: 100,
          renderCell: (params: GridCellParams) => (
            <a href={`https://aavegotchi.com/baazaar/erc1155/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'wearableId', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Name', width: 185 },
        { field: 'rarity', headerName: 'Rarity', width: 120 },
        { field: 'slot', headerName: 'Slot', width: 80 },
        { field: 'date', headerName: 'Date', width: 120 },
        { field: 'buyer', headerName: 'Buyer', width: 140 },
        { field: 'seller', headerName: 'Seller', width: 140 },
        { field: 'quantity', headerName: 'Qty', width: 80 },
        { field: 'price', headerName: 'Sale Price', width: 120 },
        { field: 'totalPrice', headerName: 'Total Price', width: 130 },
      ];

      let rows = [];
      this.state.filteredWearableSales.map(function(listing, index) {
        let wearable = wearableItemTypes[listing.erc1155TypeId];

        let row = {
          id: listing.listingID,
          wearableId: listing.erc1155TypeId,
          name: wearable.name,
          rarity: listing.rarity,
          slot: listing.slot,
          date: listing.formattedTime,
          buyer: listing.buyer,
          seller: listing.seller,
          quantity: listing.quantity,
          price: listing.priceInGhst,
          totalPrice: listing.totalPrice
        };

        rows.push(row);
      });

      return (
        <div>
          <h2>Wearable Sales</h2>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
          </div>
        </div>
      );
    }
  }

  renderTopAddressesTables() {
    const _this = this;

    if (this.state.filteredWearableSales.length > 0) {
      const buyersColumns = [
        { field: 'id', headerName: 'Buyer', width: 370 },
        { field: 'spend', headerName: 'Spend', width: 100 },
        { field: 'wearables', headerName: '# Wearables', width: 140 },
      ];

      const sellersColumns = [
        { field: 'id', headerName: 'Seller', width: 370 },
        { field: 'spend', headerName: 'Spend', width: 100 },
        { field: 'wearables', headerName: '# Wearables', width: 140 },
      ];

      let buyersRows = [];
      let sellersRows = [];

      Object.keys(this.state.filteredBuyers).map(function(buyer, index) {
        buyersRows.push({
          id: buyer,
          spend: parseFloat(_.sumBy(_this.state.filteredBuyers[buyer].listings, 'priceInGhst').toFixed(0)),
          wearables: _this.state.filteredBuyers[buyer].listings.length
        });
      });

      Object.keys(this.state.filteredSellers).map(function(seller, index) {
        sellersRows.push({
          id: seller,
          spend: parseFloat(_.sumBy(_this.state.filteredSellers[seller].listings, 'priceInGhst').toFixed(0)),
          wearables: _this.state.filteredSellers[seller].listings.length
        });
      });

      return (
        <div className="container">
          <div className="row">
            <div className="col">
              <h2>Top Buyers</h2>
              <div style={{ height: '450px', width: '100%' }}>
                <DataGrid rows={_.orderBy(buyersRows, ['spend'], ['desc'])} columns={buyersColumns} pageSize={10} density="compact" disableSelectionOnClick="true" />
              </div>
            </div>
            <div className="col">
              <h2>Top Sellers</h2>
              <div style={{ height: '450px', width: '100%' }}>
                <DataGrid rows={_.orderBy(sellersRows, ['spend'], ['desc'])} columns={sellersColumns} pageSize={10} density="compact" disableSelectionOnClick="true" />
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  renderPieCharts() {
    if (this.state.rarityData && this.state.rarityData.length > 0 && this.state.slotData && this.state.slotData.length > 0) {
      let options = {
        chart: { type: 'pie' },
        subtitle: { text: '' },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.percentage:.2f} %'
            }
          }
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
        },
        credits: {
          enabled: true,
          href: 'https://aavegotchistats.com/wearablesales',
          text: 'aavegotchistats.com/wearablesales'
        }
      };

      let rarityOptions = {...options};
      rarityOptions.title = { text: 'Wearable Sales by Rarity' };
      rarityOptions.series = [{ name: 'Rarity', colorByPoint: true, data: this.state.rarityData }];

      let slotOptions = {...options};
      slotOptions.title = { text: 'Wearable Sales by Slot' };
      slotOptions.series = [{ name: 'Slot', colorByPoint: true, data: this.state.slotData }];

      return (
        <div className="container">
          <div className="row">
            <div className="col">
              <h2>Wearable Rarity Breakdown</h2>
              <HighchartsReact
                highcharts={Highcharts}
                options={rarityOptions}
              />
            </div>
            <div className="col">
              <h2>Wearable Slot Breakdown</h2>
              <HighchartsReact
                highcharts={Highcharts}
                options={slotOptions}
              />
            </div>
          </div>
        </div>
      );
    }
  }

  handleDateChange(date, dateType) {
    let dateValue = date;

    if (dateType == 'dateFrom') {
      dateValue.setHours(0,0,0,0);
    } else if (dateType == 'dateTo') {
      dateValue.setHours(23,59,59,999);
    }

    this.setState(
      { [dateType]: dateValue },
      () => {
        this.applyFilters();
      }
    );
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
    this.applyFilters();
  }

  renderFilters() {
    if (this.state.wearableSales && this.state.wearableSales.length > 0) {
      return(
        <form class="row g-3">
          <div class="col-12">
            <label>Date Sold From <DatePicker selected={this.state.dateFrom} onChange={(date) => this.handleDateChange(date, 'dateFrom')} dateFormat='MMM dd yyyy' /></label> <label> To <DatePicker selected={this.state.dateTo} onChange={(date) => this.handleDateChange(date, 'dateTo')} dateFormat='MMM dd yyyy' /></label>
          </div>

          <div class="col-3">
            <label for="priceFrom" class="form-label">Price From</label>
            <input type="number" class="form-control" id="priceFrom" value={this.state.priceFrom} onChange={(event) => this.onInputChange(event)} />
          </div>
          <div class="col-3">
            <label for="priceTo" class="form-label">Price To</label>
            <input type="number" class="form-control" id="priceTo" value={this.state.priceTo} onChange={(event) => this.onInputChange(event)} />
          </div>
          <div class="col-6">
            <label for="account" class="form-label">Buyer or Seller Address</label>
            <input type="text" class="form-control" id="account" value={this.state.account} onChange={(event) => this.onInputChange(event)} />
          </div>

          <div class="col-3">
            <label for="rarity" class="form-label">Wearable Rarity</label>
            <select id="rarity" class="form-select" onChange={(event) => this.onInputChange(event)} value={this.state.rarity}>
              <option>Any</option>
              <option>Common</option>
              <option>Uncommon</option>
              <option>Rare</option>
              <option>Legendary</option>
              <option>Mythical</option>
              <option>Godlike</option>
            </select>
          </div>

          <div class="col-3">
            <label for="slot" class="form-label">Wearable Slot</label>
            <select id="slot" class="form-select" onChange={(event) => this.onInputChange(event)} value={this.state.slot}>
              <option>Any</option>
              <option>Body</option>
              <option>Face</option>
              <option>Eyes</option>
              <option>Head</option>
              <option>Hand</option>
              <option>Pet</option>
              <option>Background</option>
            </select>
          </div>

          <div class="col-6">
            <label for="wearable" class="form-label">Wearable Name</label>
            <input type="text" class="form-control" id="wearable" value={this.state.wearable} onChange={(event) => this.onInputChange(event)} />
          </div>
        </form>
      );
    }
  }

  render() {
    return(
      <div>
        <h1>Wearable Sales</h1>
        {this.state.loading &&
          <Loading message="Loading Wearable Sales from TheGraph..." />
        }
        {this.renderFilters()}
        {this.renderSalesAvgPriceChart()}
        {this.renderPieCharts()}
        {this.renderTopAddressesTables()}
        {this.renderSalesTable()}
      </div>
    );
  }
}

export default WearableSales;
