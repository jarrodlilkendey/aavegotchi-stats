import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { DataGrid } from '@material-ui/data-grid';

import DatePicker from 'react-datepicker';

import Loading from './Loading';

import { retrieveSoldTicketListings } from '../util/Graph';
import { formatGhst } from '../util/AavegotchiMath';

const _ = require('lodash');
const moment = require('moment');

class TicketSales extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    this.state = {
      sales: [],
      sellers: {},
      buyers: {},
      salesChartData: [],
      ticketSales: [],
      filteredTicketSales: [],
      loading: true,
      ticketRarityLabel: ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical', 'Godlike', 'Drop']
    };

    this.onChangeDebounced = _.debounce(this.onChangeDebounced, 2000);
  }

  async componentDidMount() {
    let _this = this;
    retrieveSoldTicketListings()
      .then((listings) => {
        let sellers = {};
        let buyers = {};
        let ticketIds = [];
        let earliestDate = 0;

        listings.map(function(listing, index) {
          listings[index].timeLastPurchased = parseInt(listing.timeLastPurchased);
          listings[index].formattedTime = moment.unix(parseInt(listing.timeLastPurchased)).format("MMM DD YYYY");
          listings[index].priceInGhst = formatGhst(listing.priceInWei);
          listings[index].quantity = parseInt(listing.quantity);
          listings[index].totalPrice = listing.quantity * listings[index].priceInGhst;
          listings[index].rarity = _this.state.ticketRarityLabel[listing.erc1155TypeId];

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

          if (!_.includes(ticketIds, listings[index].erc1155TypeId)) {
            ticketIds.push(listings[index].erc1155TypeId);
          }
        });

        console.log('sales', listings);
        console.log('sellers', sellers);
        console.log('buyers', buyers);
        console.log('ticketIds', ticketIds);

        let dateFrom = new Date(earliestDate * 1000);
        dateFrom.setHours(0,0,0,0);

        let dateTo = new Date();
        dateTo.setHours(23,59,59,999);

        this.setState({ ticketSales: listings, sellers, buyers, ticketIds, dateFrom, dateTo, loading: false });

        this.applyFilters();
      });
  }

  refreshVisualisations() {
    this.prepareSalesAvgPriceChartData();
    this.prepareRarityChartData();
  }

  applyFilters() {
    console.log('applyFilters');

    const _this = this;

    let filteredTicketSales = [...this.state.ticketSales];
    let filteredSellers = {};
    let filteredBuyers = {};
    let filteredTicketIds = [];

    // apply date filters
    if (this.state.dateFrom) {
      filteredTicketSales = _.filter(filteredTicketSales, function(w) { return new Date(w.timeLastPurchased * 1000) >= _this.state.dateFrom; });
    }

    if (this.state.dateTo) {
      filteredTicketSales = _.filter(filteredTicketSales, function(w) { return new Date(w.timeLastPurchased * 1000) <= _this.state.dateTo; });
    }

    // apply price filters
    if (this.state.priceFrom && this.state.priceFrom != '') {
      filteredTicketSales = _.filter(filteredTicketSales, function(w) { return w.priceInGhst >= _this.state.priceFrom; });
    }

    if (this.state.priceTo && this.state.priceTo != '') {
      filteredTicketSales = _.filter(filteredTicketSales, function(w) { return w.priceInGhst <= _this.state.priceTo; });
    }

    // apply account filters
    if (this.state.account && this.state.account != '') {
      filteredTicketSales = _.filter(filteredTicketSales, function(w) { return w.buyer.toLowerCase().includes(_this.state.account.toLowerCase()) || w.seller.toLowerCase().includes(_this.state.account.toLowerCase()); });
    }

    // apply rarity filters
    if (this.state.rarity && this.state.rarity != '' && this.state.rarity != 'Any') {
      filteredTicketSales = _.filter(filteredTicketSales, function(w) { return w.rarity == _this.state.rarity; });
    }

    // order by time last purchased
    filteredTicketSales = _.orderBy(filteredTicketSales, 'timeLastPurchased', 'desc');

    filteredTicketSales.map(function(listing, index) {
      if (!_.includes(filteredSellers, filteredTicketSales[index].seller)) {
        if (!filteredSellers.hasOwnProperty(filteredTicketSales[index].seller)) {
          filteredSellers[filteredTicketSales[index].seller] = { listings: [filteredTicketSales[index]] };
        } else {
          filteredSellers[filteredTicketSales[index].seller].listings = [...filteredSellers[filteredTicketSales[index].seller].listings, filteredTicketSales[index]];
        }
      }

      if (!_.includes(filteredBuyers, filteredTicketSales[index].buyer)) {
        if (!filteredBuyers.hasOwnProperty(filteredTicketSales[index].buyer)) {
          filteredBuyers[filteredTicketSales[index].buyer] = { listings: [filteredTicketSales[index]] };
        } else {
          filteredBuyers[filteredTicketSales[index].buyer].listings = [...filteredBuyers[filteredTicketSales[index].buyer].listings, filteredTicketSales[index]];
        }
      }

      if (!_.includes(filteredTicketIds, filteredTicketSales[index].erc1155TypeId)) {
        filteredTicketIds.push(filteredTicketSales[index].erc1155TypeId);
      }
    });

    this.setState(
      { filteredTicketSales, filteredBuyers, filteredSellers, filteredTicketIds },
      () => {
        this.refreshVisualisations();
      }
    );

    console.log('filteredTicketSales', filteredTicketSales, _this.state.dateFrom, _this.state.dateTo);
    console.log('filtered', filteredBuyers, filteredSellers, filteredTicketIds);
  }

  prepareSalesAvgPriceChartData() {
    let data = { 'totalSales': [], 'averageSales': [] };
    let totalSales = { };
    let averageSales = { };

    _.orderBy(this.state.filteredTicketSales, ['timeLastPurchased', 'desc']).map(function(listing, index) {
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

    console.log('salesChartData', data, averageSales);
  }

  prepareRarityChartData() {
    const _this = this;
    let rarityData = [];
    let totalSales = this.state.filteredTicketSales.length;

    let rarities = ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical' ,'Godlike', 'Drop'];
    let colors = ['#8064ff', '#33bacc', '#59bcff', '#ffc36b', '#ff96ff', '#51ffa8', '#000'];
    rarities.map(function(r, index) {
      let countRarity = _.sumBy(_.filter(_this.state.filteredTicketSales, ['rarity', r]), 'quantity');
      if (countRarity > 0) {
        let rarityPercentage = parseFloat(((countRarity/totalSales)*100).toFixed(2));
        rarityData.push({
          name: r,
          x: countRarity,
          y: rarityPercentage,
          color: colors[index]
        });
      }
    });

    console.log('prepareRarityChartData', rarityData);
    this.setState({ rarityData });
  }

  renderSalesAvgPriceChart() {
    if (this.state.salesChartData && this.state.salesChartData.totalSales && this.state.salesChartData.totalSales.length > 0) {
      const options = {
        chart: { zoomType: 'xy' },
        title: { text: 'Ticket Sales Over Time' },
        subtitle: { text: 'Daily Sales Volume and Average Sales Price' },

        series: [{
          data: this.state.salesChartData.totalSales,
          name: 'Number of Tickets Sold',
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
              text: 'Number of Tickets Sold',
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
          href: 'https://aavegotchistats.com/ticketsales',
          text: 'aavegotchistats.com/ticketsales'
        }
      };

      return (
        <div>
          <h2>Ticket Sales Over Time</h2>
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
          />
        </div>
      );
    }
  }

  renderSalesTable() {
    if (this.state.filteredTicketSales.length > 0) {
      const columns = [
        { field: 'id', hide: true },
        {
          field: 'listingId',
          headerName: 'Listing',
          width: 120,
          renderCell: (params: GridCellParams) => (
            <a href={`https://aavegotchi.com/baazaar/erc1155/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'rarity', headerName: 'Rarity', width: 120 },
        { field: 'date', headerName: 'Date', width: 120 },
        { field: 'buyer', headerName: 'Buyer', width: 260 },
        { field: 'seller', headerName: 'Seller', width: 260 },
        { field: 'quantity', headerName: 'Qty', width: 120 },
        { field: 'price', headerName: 'Sale Price', width: 150 },
        { field: 'totalPrice', headerName: 'Total Price', width: 150 },
      ];

      let rows = [];
      this.state.filteredTicketSales.map(function(listing, index) {
        let row = {
          id: listing.id,
          listingId: listing.listingID,
          rarity: listing.rarity,
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
          <h2>Ticket Sales</h2>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
          </div>
        </div>
      );
    }
  }

  renderTopAddressesTables() {
    const _this = this;

    if (this.state.filteredTicketSales.length > 0) {
      const buyersColumns = [
        { field: 'id', headerName: 'Buyer', width: 370 },
        { field: 'spend', headerName: 'Spend', width: 120 },
        { field: 'tickets', headerName: '# Tickets', width: 120 },
      ];

      const sellersColumns = [
        { field: 'id', headerName: 'Seller', width: 370 },
        { field: 'spend', headerName: 'Spend', width: 120 },
        { field: 'tickets', headerName: '# Tickets', width: 120 },
      ];

      let buyersRows = [];
      let sellersRows = [];

      Object.keys(this.state.filteredBuyers).map(function(buyer, index) {
        let totalBuyerSpend = 0;
        let totalBuyerTickets = 0;

        _this.state.filteredBuyers[buyer].listings.map((listing) => {
          totalBuyerSpend += (listing.priceInGhst * listing.quantity);
          totalBuyerTickets += listing.quantity;
        });

        buyersRows.push({
          id: buyer,
          spend: parseFloat(totalBuyerSpend.toFixed(0)),
          tickets: totalBuyerTickets
        });
      });

      Object.keys(this.state.filteredSellers).map(function(seller, index) {
        let totalSellerSpend = 0;
        let totalSellerTickets = 0;

        _this.state.filteredSellers[seller].listings.map((listing) => {
          totalSellerSpend += (listing.priceInGhst * listing.quantity);
          totalSellerTickets += listing.quantity;
        });

        sellersRows.push({
          id: seller,
          spend: parseFloat(totalSellerSpend.toFixed(0)),
          tickets: totalSellerTickets
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
    if (this.state.rarityData && this.state.rarityData.length > 0) {
      let options = {
        chart: { type: 'pie' },
        subtitle: { text: '' },
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              format: '<b>{point.name}</b>: {point.x} Tickets Sold ({point.percentage:.2f}%)'
            }
          }
        },
        tooltip: {
          pointFormat: '{point.x} Tickets Sold ({point.percentage:.2f}%)'
        },
        credits: {
          enabled: true,
          href: 'https://aavegotchistats.com/ticketsales',
          text: 'aavegotchistats.com/ticketsales'
        }
      };

      let rarityOptions = {...options};
      rarityOptions.title = { text: 'Tickets Sold by Rarity' };
      rarityOptions.series = [{ name: 'Rarity', colorByPoint: true, data: this.state.rarityData }];

      return (
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h2>Ticket Rarity Breakdown</h2>
              <HighchartsReact
                highcharts={Highcharts}
                options={rarityOptions}
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
    if (this.state.ticketSales && this.state.ticketSales.length > 0) {
      return(
        <form class="row g-3">
          <div class="col-12">
            <label>Date Sold From <DatePicker selected={this.state.dateFrom} onChange={(date) => this.handleDateChange(date, 'dateFrom')} dateFormat='MMM dd yyyy' /></label> <label> To <DatePicker selected={this.state.dateTo} onChange={(date) => this.handleDateChange(date, 'dateTo')} dateFormat='MMM dd yyyy' /></label>
          </div>

          <div class="col-2">
            <label for="rarity" class="form-label">Ticket Rarity</label>
            <select id="rarity" class="form-select" onChange={(event) => this.onInputChange(event)} value={this.state.rarity}>
              <option>Any</option>
              <option>Common</option>
              <option>Uncommon</option>
              <option>Rare</option>
              <option>Legendary</option>
              <option>Mythical</option>
              <option>Godlike</option>
              <option>Drop</option>
            </select>
          </div>

          <div class="col-2">
            <label for="priceFrom" class="form-label">Price From</label>
            <input type="number" class="form-control" id="priceFrom" value={this.state.priceFrom} onChange={(event) => this.onInputChange(event)} />
          </div>
          <div class="col-2">
            <label for="priceTo" class="form-label">Price To</label>
            <input type="number" class="form-control" id="priceTo" value={this.state.priceTo} onChange={(event) => this.onInputChange(event)} />
          </div>
          <div class="col-6">
            <label for="account" class="form-label">Buyer or Seller Address</label>
            <input type="text" class="form-control" id="account" value={this.state.account} onChange={(event) => this.onInputChange(event)} />
          </div>
        </form>
      );
    }
  }

  render() {
    return(
      <div>
        <h1>Ticket Sales</h1>
        {this.state.loading &&
          <Loading message="Loading Ticket Sales from TheGraph..." />
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

export default TicketSales;
