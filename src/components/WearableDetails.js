import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { DataGrid } from '@material-ui/data-grid';

import DatePicker from 'react-datepicker';

import Loading from './Loading';

import { retrieveSoldWearableListingsById, erc1155PricesById, gotchisWithEquippedWearable } from '../util/WearablesUtil';
import { formatGhst, wearableRarityLabel, wearablePositionLabel, wearableTraitModifiers } from '../util/AavegotchiMath';

import { withRouter } from 'react-router-dom';

import wearableItemTypes from '../data/wearables/wearables.json';

import { ethers } from "ethers";

const _ = require('lodash');
const moment = require('moment');

class WearableDetails extends Component {
  constructor(props) {
    super(props);

    let wearable = wearableItemTypes[this.props.match.params.id];

    document.title = `${wearable.name} Aavegotchi Wearable Analytics`;

    console.log('wearable', wearable);

    this.state = {
      wearable: wearable,
      wearableId: this.props.match.params.id,
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
    retrieveSoldWearableListingsById(this.state.wearableId)
      .then((listings) => {
        console.log('soldlistings', listings);

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

    erc1155PricesById(0, this.state.wearableId)
      .then((listings) => {
        console.log('openListings', listings);
        let floor = 0;
        let ceiling = 0;
        let link = 'https://aavegotchi.com/baazaar';
        let name = 'No Listings';
        let qty = 0;
        if (listings.length > 0) {
          floor = ethers.utils.formatEther(listings[0].priceInWei);
          link = `https://aavegotchi.com/baazaar/erc1155/${listings[0].id}`;
          name = wearableItemTypes[listings[0].erc1155TypeId].name;
          qty = parseInt(listings[0].quantity);
          ceiling = ethers.utils.formatEther(listings[listings.length-1].priceInWei);
        }

        let listedQuantity = 0;
        listings.map((listing, index) => {
          listedQuantity += parseInt(listing.quantity);
        });

        this.setState({
          floorPrice: {
            floor, link, name, qty
          },

          openListings: {
            listings: listings,
            listingCount: listings.length,
            listedQuantity: listedQuantity,
            floor,
            ceiling
          }
        });
      });

    gotchisWithEquippedWearable(this.state.wearableId)
      .then((gotchisWithWearable) => {
        let gotchisWithWearableUnits = 0;
        gotchisWithWearable.map((g) => {
          g.equippedWearables.map((w) => {
            if (w == this.state.wearableId) {
              gotchisWithWearableUnits++;
            }
          })
        });

        console.log('gotchisWithWearable', gotchisWithWearable, gotchisWithWearableUnits);

        this.setState({ gotchisWithWearable, gotchisWithWearableUnits });
      })
  }

  refreshVisualisations() {
    this.prepareSalesAvgPriceChartData();
  }

  applyFilters() {
    console.log('applyFilters');

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

  renderSalesAvgPriceChart() {
    if (this.state.salesChartData && this.state.salesChartData.totalSales && this.state.salesChartData.totalSales.length > 0) {
      const options = {
        chart: { zoomType: 'xy' },
        title: { text: `${this.state.wearable.name} Sales Over Time` },
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
          href: `https://aavegotchistats.com/wearables/${this.state.wearableId}`,
          text: `aavegotchistats.com/wearables/${this.state.wearableId}`
        }
      };

      return (
        <div>
          <h2>{this.state.wearable.name} Sales Over Time</h2>
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
        { field: 'id', hide: true },
        {
          field: 'listingId',
          headerName: 'Listing',
          width: 100,
          renderCell: (params: GridCellParams) => (
            <a href={`https://aavegotchi.com/baazaar/erc1155/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
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
          id: listing.id,
          listingId: listing.listingID,
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
          <h2>{this.state.wearable.name} Sales</h2>
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
        let totalBuyerSpend = 0;
        let totalBuyerWearables = 0;

        _this.state.filteredBuyers[buyer].listings.map((listing) => {
          totalBuyerSpend += (listing.priceInGhst * listing.quantity);
          totalBuyerWearables += listing.quantity;
        });

        buyersRows.push({
          id: buyer,
          spend: parseFloat(totalBuyerSpend.toFixed(0)),
          wearables: totalBuyerWearables
        });
      });

      Object.keys(this.state.filteredSellers).map(function(seller, index) {
        let totalSellerSpend = 0;
        let totalSellerWearables = 0;

        _this.state.filteredSellers[seller].listings.map((listing) => {
          totalSellerSpend += (listing.priceInGhst * listing.quantity);
          totalSellerWearables += listing.quantity;
        });

        sellersRows.push({
          id: seller,
          spend: parseFloat(totalSellerSpend.toFixed(0)),
          wearables: totalSellerWearables
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
        <div>
        <h2>{this.state.wearable.name} Historical Sales</h2>
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

        </form>
        </div>
      );
    }
  }

  renderCurrentPrices() {
    if (this.state.floorPrice) {
      return(
        <div>
          <h2>{this.state.wearable.name} Open Listings</h2>
          <p>Floor Price: <a href={this.state.floorPrice.link}>{this.state.floorPrice.floor} GHST</a> (Qty: {this.state.floorPrice.qty})</p>
          <p>Price Range: {this.state.openListings.floor}-{this.state.openListings.ceiling} GHST, Total Listed Units: {this.state.openListings.listedQuantity}, Total Listings: {this.state.openListings.listingCount}</p>
          {this.renderOpenListingsTable()}
        </div>
      );
    }
  }

  renderOpenListingsTable() {
    const _this = this;
    if (this.state.openListings.listings.length > 0) {
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
        { field: 'name', headerName: 'Name', width: 185 },
        { field: 'seller', headerName: 'Seller', width: 450 },
        { field: 'quantity', headerName: 'Qty', width: 80 },
        { field: 'price', headerName: 'Unit Price', width: 120 },
      ];

      let rows = [];
      this.state.openListings.listings.map(function(listing, index) {

        let row = {
          id: listing.id,
          name: _this.state.wearable.name,
          seller: listing.seller,
          quantity: listing.quantity,
          price: ethers.utils.formatEther(listing.priceInWei),
        };

        rows.push(row);
      });

      return (
        <div>
          <div style={{ height: '500px', width: '100%' }}>
            <DataGrid rows={rows} columns={columns} pageSize={10} density="compact" disableSelectionOnClick="true" />
          </div>
        </div>
      );
    }
  }

  renderMetadata() {
    return(
      <div className="row">
        <div className="col">
          <p>ID: {this.state.wearableId}</p>
          <p>Name: {this.state.wearable.name}</p>
          <p>Quantity: {this.state.wearable.totalQuantity}</p>
          <p>Rarity: {wearableRarityLabel(wearableItemTypes[this.state.wearableId])}</p>
          <p>Slot: {wearablePositionLabel(wearableItemTypes[this.state.wearableId])}</p>
          <p>Trait Modifiers: {wearableTraitModifiers(this.state.wearable.traitModifiers)}</p>
        </div>
        <div className="col">
          {this.renderWearableUtilisation()}
        </div>
      </div>
    );
  }

  renderWearableUtilisation() {
    if (this.state.gotchisWithWearable && this.state.openListings) {
      let unlistedUnequippedUnits = this.state.wearable.totalQuantity - this.state.openListings.listedQuantity - this.state.gotchisWithWearableUnits;

      let pieChartData = [];

      pieChartData.push({
        name: 'Equipped Units',
        x: this.state.gotchisWithWearableUnits,
        y: parseFloat(((this.state.gotchisWithWearableUnits/this.state.wearable.totalQuantity)*100).toFixed(2))
      });

      pieChartData.push({
        name: 'Listed Units',
        x: this.state.openListings.listedQuantity,
        y: parseFloat(((this.state.openListings.listedQuantity/this.state.wearable.totalQuantity)*100).toFixed(2))
      });

      pieChartData.push({
        name: 'Unequipped & Unlisted Units',
        x: unlistedUnequippedUnits,
        y: parseFloat(((unlistedUnequippedUnits/this.state.wearable.totalQuantity)*100).toFixed(2))
      });

      console.log('pieChartData', pieChartData);

      let pieChartOptions = {
        title: { text: `${this.state.wearable.name} Wearable Utilization` },
        chart: { type: 'pie' },
        subtitle: { text: `Total Units: ${this.state.wearable.totalQuantity}` },
        series: [{ name: 'Utilization', colorByPoint: true, data: pieChartData }],
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.x} ({point.percentage:.2f}%)'
            }
          }
        },
        tooltip: {
          pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
        },
        credits: {
          enabled: true,
          href: `https://aavegotchistats.com/wearables/${this.state.wearableId}`,
          text: `aavegotchistats.com/wearables/${this.state.wearableId}`
        }
      };

      // <div className="col">
      //   <p>Units in Total: {this.state.wearable.totalQuantity}</p>
      //   <p>Units Listed (as Wearable Listings): {this.state.openListings.listedQuantity}</p>
      //   <p>Units Equipped to Aavegotchis: {this.state.gotchisWithWearableUnits} (across {this.state.gotchisWithWearable.length} Aavegotchis)</p>
      //   <p>Units Unlisted and Unequipped: {unlistedUnequippedUnits}</p>
      // </div>

      return(
        <div className="row">
          <div className="col">
            <HighchartsReact
              highcharts={Highcharts}
              options={pieChartOptions}
            />
          </div>
        </div>
      );
    }
  }

  render() {
    return(
      <div>
        <h1>{this.state.wearable.name} Wearable Analytics</h1>
        {this.renderMetadata()}
        {this.renderCurrentPrices()}
        {this.renderFilters()}
        {this.state.loading &&
          <Loading message="Loading Wearable Sales from TheGraph..." />
        }
        {this.renderSalesAvgPriceChart()}
        {this.renderTopAddressesTables()}
        {this.renderSalesTable()}
        <p><a href="/wearables">Back to Wearables List</a></p>
      </div>
    );
  }
}

export default withRouter(WearableDetails);
