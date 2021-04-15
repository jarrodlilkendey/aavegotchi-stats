import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { DataGrid } from '@material-ui/data-grid';

import DatePicker from 'react-datepicker';

import Loading from './Loading';

import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

import wearableItemTypes from '../data/wearables/wearables.json';

import { retrieveSoldGotchisListings } from '../util/Graph';
import { graphAddressToCollateral } from '../util/Collateral';
import { formatGhst } from '../util/AavegotchiMath';

const _ = require('lodash');
const moment = require('moment');

class AavegotchiSales extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sales: [],
      sellers: {},
      buyers: {},
      gotchiIds: [],
      salesChartData: [],
      loading: true,
      filteredGotchiSales: [],
    };

    this.onChangeDebounced = _.debounce(this.onChangeDebounced, 2000);
  }

  async componentDidMount() {
    retrieveSoldGotchisListings()
      .then((listings) => {
        let sellers = {};
        let buyers = {};
        let gotchiIds = [];
        let earliestDate = 0;
        let brsRange = [0, 0];
        let mrsRange = [0, 0];
        let kinsRange = [0, 0];
        let expRange = [0, 0];

        listings.map(function(listing, index) {
          let brs = parseInt(listing.gotchi.baseRarityScore);
          let mrs = parseInt(listing.gotchi.modifiedRarityScore);
          let kins = parseInt(listing.gotchi.kinship);
          let exp = parseInt(listing.gotchi.experience);

          listings[index].timePurchased = parseInt(listing.timePurchased);
          listings[index].formattedTime = moment.unix(parseInt(listing.timePurchased)).format("MMM DD YYYY");
          listings[index].priceInGhst = formatGhst(listing.priceInWei);
          listings[index].gotchi.baseRarityScore = brs;
          listings[index].gotchi.modifiedRarityScore = mrs;
          listings[index].gotchi.kinship = kins;
          listings[index].gotchi.experience = exp;
          listings[index].gotchi.stakedAmount = parseInt(listing.gotchi.stakedAmount);
          listings[index].gotchi.collateralName = graphAddressToCollateral(listing.gotchi.collateral);

          if (index == 0) {
            earliestDate = listings[index].timePurchased;
            brsRange = [ brs, brs ];
            mrsRange = [ mrs, mrs ];
            kinsRange = [ kins, kins ];
            expRange = [ exp, exp ];
          } else {
            if (listings[index].timePurchased < earliestDate) {
              earliestDate = listings[index].timePurchased;
            }

            if (brsRange[0] > brs) {
              brsRange[0] = brs;
            }
            if (brsRange[1] < brs) {
              brsRange[1] = brs;
            }

            if (mrsRange[0] > mrs) {
              mrsRange[0] = mrs;
            }
            if (mrsRange[1] < mrs) {
              mrsRange[1] = mrs;
            }

            if (kinsRange[0] > kins) {
              kinsRange[0] = kins;
            }
            if (kinsRange[1] < kins) {
              kinsRange[1] = kins;
            }

            if (expRange[0] > exp) {
              expRange[0] = exp;
            }
            if (expRange[1] < exp) {
              expRange[1] = exp;
            }
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

          if (!_.includes(gotchiIds, listings[index].gotchi.id)) {
            gotchiIds.push(listings[index].gotchi.id);
          }
        });
        console.log('sales', listings);
        console.log('sellers', sellers);
        console.log('buyers', buyers);
        console.log('gotchiIds', gotchiIds);

        let dateFrom = new Date(earliestDate * 1000);
        dateFrom.setHours(0,0,0,0);

        let dateTo = new Date();
        dateTo.setHours(23,59,59,999);

        console.log('brsRange', brsRange);
        console.log('mrsRange', mrsRange);
        console.log('kinsRange', kinsRange);
        console.log('expRange', expRange);

        let sliderMin = [brsRange[0], mrsRange[0], kinsRange[0], expRange[0]];
        let sliderMax = [brsRange[1], mrsRange[1], kinsRange[1], expRange[1]];

        this.setState({ sales: listings, sellers, buyers, gotchiIds, dateFrom, dateTo, loading: false, brsRange, mrsRange, kinsRange, expRange, sliderMin, sliderMax });

        this.applyFilters();
      });
  }

  refreshVisualisations() {
    this.prepareSalesAvgPriceChartData();
    this.prepareCollateralChartData();
  }

  applyFilters() {
    const _this = this;

    let filteredGotchiSales = [...this.state.sales];
    let filteredSellers = {};
    let filteredBuyers = {};
    let filteredGotchiIds = [];

    // apply date filters
    if (this.state.dateFrom) {
      filteredGotchiSales = _.filter(filteredGotchiSales, function(g) { return new Date(g.timePurchased * 1000) >= _this.state.dateFrom; });
    }

    if (this.state.dateTo) {
      filteredGotchiSales = _.filter(filteredGotchiSales, function(g) { return new Date(g.timePurchased * 1000) <= _this.state.dateTo; });
    }

    // apply brs filters
    if (this.state.brsRange) {
      filteredGotchiSales = _.filter(filteredGotchiSales, function(g) { return g.gotchi.baseRarityScore >= _this.state.brsRange[0] && g.gotchi.baseRarityScore <= _this.state.brsRange[1] });
    }

    // apply mrs filters
    if (this.state.mrsRange) {
      filteredGotchiSales = _.filter(filteredGotchiSales, function(g) { return g.gotchi.modifiedRarityScore >= _this.state.mrsRange[0] && g.gotchi.modifiedRarityScore <= _this.state.mrsRange[1] });
    }

    // apply kins filters
    if (this.state.kinsRange) {
      filteredGotchiSales = _.filter(filteredGotchiSales, function(g) { return g.gotchi.kinship >= _this.state.kinsRange[0] && g.gotchi.kinship <= _this.state.kinsRange[1] });
    }

    // apply exp filters
    if (this.state.expRange) {
      filteredGotchiSales = _.filter(filteredGotchiSales, function(g) { return g.gotchi.experience >= _this.state.expRange[0] && g.gotchi.experience <= _this.state.expRange[1] });
    }

    // apply price filters
    if (this.state.priceFrom && this.state.priceFrom != '') {
      filteredGotchiSales = _.filter(filteredGotchiSales, function(g) { return g.priceInGhst >= _this.state.priceFrom; });
    }

    if (this.state.priceTo && this.state.priceTo != '') {
      filteredGotchiSales = _.filter(filteredGotchiSales, function(g) { return g.priceInGhst <= _this.state.priceTo; });
    }

    // apply account filters
    if (this.state.account && this.state.account != '') {
      filteredGotchiSales = _.filter(filteredGotchiSales, function(g) { return g.buyer.toLowerCase().includes(_this.state.account.toLowerCase()) || g.seller.toLowerCase().includes(_this.state.account.toLowerCase()); });
    }

    // apply gotchiId filters
    if (this.state.gotchiId && this.state.gotchiId != '') {
      filteredGotchiSales = _.filter(filteredGotchiSales, function(g) { return g.gotchi.id == _this.state.gotchiId });
    }

    // apply collateral filters
    if (this.state.collateral && this.state.collateral != '' && this.state.collateral != 'Any') {
      filteredGotchiSales = _.filter(filteredGotchiSales, function(g) { return g.gotchi.collateralName == _this.state.collateral; });
    }

    // order by time last purchased
    filteredGotchiSales = _.orderBy(filteredGotchiSales, 'timePurchased', 'desc');

    filteredGotchiSales.map(function(listing, index) {
      if (!_.includes(filteredSellers, filteredGotchiSales[index].seller)) {
        if (!filteredSellers.hasOwnProperty(filteredGotchiSales[index].seller)) {
          filteredSellers[filteredGotchiSales[index].seller] = { listings: [filteredGotchiSales[index]] };
        } else {
          filteredSellers[filteredGotchiSales[index].seller].listings = [...filteredSellers[filteredGotchiSales[index].seller].listings, filteredGotchiSales[index]];
        }
      }

      if (!_.includes(filteredBuyers, filteredGotchiSales[index].buyer)) {
        if (!filteredBuyers.hasOwnProperty(filteredGotchiSales[index].buyer)) {
          filteredBuyers[filteredGotchiSales[index].buyer] = { listings: [filteredGotchiSales[index]] };
        } else {
          filteredBuyers[filteredGotchiSales[index].buyer].listings = [...filteredBuyers[filteredGotchiSales[index].buyer].listings, filteredGotchiSales[index]];
        }
      }

      if (!_.includes(filteredGotchiIds, filteredGotchiSales[index].erc1155TypeId)) {
        filteredGotchiIds.push(filteredGotchiSales[index].erc1155TypeId);
      }
    });

    this.setState(
      { filteredGotchiSales, filteredBuyers, filteredSellers, filteredGotchiIds },
      () => {
        this.refreshVisualisations();
      }
    );

    console.log('filteredGotchiSales', filteredGotchiSales);
    //
    // console.log('filteredWearableSales', filteredWearableSales, _this.state.dateFrom, _this.state.dateTo);
    // console.log('filtered', filteredBuyers, filteredSellers, filteredWearableIds);
  }

  prepareSalesAvgPriceChartData() {
    let data = { 'totalSales': [], 'averageSales': [] };
    let totalSales = { };
    let averageSales = { };

    _.orderBy(this.state.filteredGotchiSales, ['timePurchased', 'desc']).map(function(listing, index) {
      if (!totalSales.hasOwnProperty(listing.formattedTime)) {
        totalSales[listing.formattedTime] = 1;
        averageSales[listing.formattedTime] = [listing.priceInGhst]
      } else {
        totalSales[listing.formattedTime] += 1;
        averageSales[listing.formattedTime] = [...averageSales[listing.formattedTime], listing.priceInGhst];
      }
    });

    Object.keys(totalSales).map(function(date, index) {
      data.totalSales.push([date, totalSales[date]]);
      data.averageSales.push([date, parseFloat(_.mean(averageSales[date]).toFixed(2))]);
    });

    // data.totalSales.push([listing.formattedTime, 1]);

    this.setState({ salesChartData: data });

    console.log('salesChartDate', data, averageSales);
  }

  prepareCollateralChartData() {
    const _this = this;
    let collateralData = [];
    let totalSales = this.state.filteredGotchiSales.length;
    let collaterals = ['maUSDC', 'maDAI', 'maUSDT', 'maTUSD', 'maWETH' ,'maAAVE','maUNI','maYFI', 'maLINK'];
    collaterals.map(function(c, index) {
      let countCollateral = _.filter(_this.state.filteredGotchiSales, ['gotchi.collateralName', c]).length;
      let collateralPercentage = parseFloat(((countCollateral/totalSales)*100).toFixed(2));
      collateralData.push({
        name: c,
        y: collateralPercentage
      });
    });

    console.log('prepareCollateralChartData', collateralData);
    this.setState({ collateralData });
  }

  renderSalesAvgPriceChart() {
    if (this.state.salesChartData && this.state.salesChartData.totalSales && this.state.salesChartData.totalSales.length > 0) {
      const options = {
        chart: { zoomType: 'xy' },
        title: { text: 'Aavegotchi Sales Over Time' },
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
          href: 'https://aavegotchistats.com/gotchisales',
          text: 'aavegotchistats.com/gotchisales'
        }
      };

      return (
        <div>
          <h2>Aavegotchi Sales Over Time</h2>
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
          />
        </div>
      );
    }
  }

  renderSalesTable() {
    if (this.state.sales.length > 0) {
      const columns = [
        {
          field: 'id',
          headerName: 'Listing',
          width: 100,
          renderCell: (params: GridCellParams) => (
            <a href={`https://aavegotchi.com/baazaar/erc721/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        {
          field: 'gotchiId',
          headerName: 'Gotchi',
          width: 100,
          renderCell: (params: GridCellParams) => (
            <a href={`https://aavegotchi.com/gotchi/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'name', headerName: 'Name', width: 160 },
        { field: 'date', headerName: 'Date', width: 120 },
        { field: 'buyer', headerName: 'Buyer', width: 120 },
        { field: 'seller', headerName: 'Seller', width: 120 },
        { field: 'price', headerName: 'Sale Price', width: 120 },
        { field: 'baseRarityScore', headerName: 'BRS', width: 90 },
        { field: 'modifiedRarityScore', headerName: 'MRS', width: 90 },
        { field: 'kinship', headerName: 'KINS', width: 90 },
        { field: 'experience', headerName: 'EXP', width: 90 },
        { field: 'wearables', headerName: 'Wearables', width: 120 },
      ];

      let rows = [];
      _.orderBy(this.state.filteredGotchiSales, 'timePurchased', 'desc').map(function(listing, index) {
        let row = {
          id: listing.id,
          gotchiId: listing.gotchi.id,
          name: listing.gotchi.name,
          date: listing.formattedTime,
          buyer: listing.buyer,
          seller: listing.seller,
          price: listing.priceInGhst,
          baseRarityScore: listing.gotchi.baseRarityScore,
          modifiedRarityScore: listing.gotchi.modifiedRarityScore,
          kinship: listing.gotchi.kinship,
          experience: listing.gotchi.experience,
          wearables: _.pull(listing.gotchi.equippedWearables, 0).length
        };

        rows.push(row);
      });

      return (
        <div>
          <h2>Aavegotchi Sales</h2>
          <div style={{ height: '1080px', width: '100%' }}>
            <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" />
          </div>
        </div>
      );
    }
  }

  renderTopAddressesTables() {
    const _this = this;

    if (this.state.filteredGotchiSales.length > 0) {
      const buyersColumns = [
        { field: 'id', headerName: 'Buyer', width: 370 },
        { field: 'spend', headerName: 'Spend', width: 100 },
        { field: 'gotchis', headerName: '# Gotchis', width: 140 },
      ];

      const sellersColumns = [
        { field: 'id', headerName: 'Seller', width: 370 },
        { field: 'spend', headerName: 'Spend', width: 100 },
        { field: 'gotchis', headerName: '# Gotchis', width: 140 },
      ];

      let buyersRows = [];
      let sellersRows = [];

      Object.keys(this.state.filteredBuyers).map(function(buyer, index) {
        buyersRows.push({
          id: buyer,
          spend: parseFloat(_.sumBy(_this.state.filteredBuyers[buyer].listings, 'priceInGhst').toFixed(0)),
          gotchis: _this.state.filteredBuyers[buyer].listings.length
        });
      });

      Object.keys(this.state.filteredSellers).map(function(seller, index) {
        sellersRows.push({
          id: seller,
          spend: parseFloat(_.sumBy(_this.state.filteredSellers[seller].listings, 'priceInGhst').toFixed(0)),
          gotchis: _this.state.filteredSellers[seller].listings.length
        });
      });

      return (
        <div className="container">
          <div className="row">
            <div className="col">
              <h2>Top Buyers</h2>
              <div style={{ height: '450px', width: '100%' }}>
                <DataGrid rows={_.orderBy(buyersRows, ['spend'], ['desc'])} columns={buyersColumns} pageSize={10} density="compact" />
              </div>
            </div>
            <div className="col">
              <h2>Top Sellers</h2>
              <div style={{ height: '450px', width: '100%' }}>
                <DataGrid rows={_.orderBy(sellersRows, ['spend'], ['desc'])} columns={sellersColumns} pageSize={10} density="compact" />
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  renderCollateralPieChart() {
    if (this.state.collateralData && this.state.collateralData.length > 0) {
      const options = {
        chart: { type: 'pie' },
        title: { text: 'Aavegotchi Sales by Collateral' },
        subtitle: { text: '' },
        series: [{
          name: 'Collateral',
          colorByPoint: true,
          data: this.state.collateralData,
        }],
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
          href: 'https://aavegotchistats.com/gotchisales',
          text: 'aavegotchistats.com/gotchisales'
        }
      };

      return (
        <div>
          <h2>Aavegotchi Collateral Breakdown</h2>
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
          />
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
    if (this.state.sales && this.state.sales.length > 0) {
      return(
        <form class="row g-3">
          <div class="col-12">
            <label>Date Sold From <DatePicker selected={this.state.dateFrom} onChange={(date) => this.handleDateChange(date, 'dateFrom')} dateFormat='MMM dd yyyy' /></label> <label> To <DatePicker selected={this.state.dateTo} onChange={(date) => this.handleDateChange(date, 'dateTo')} dateFormat='MMM dd yyyy' /></label>
          </div>

          <div class="col-2">
            <label for="priceFrom" class="form-label">Price From</label>
            <input type="number" class="form-control" id="priceFrom" value={this.state.priceFrom} onChange={(event) => this.onInputChange(event)} />
          </div>
          <div class="col-2">
            <label for="priceTo" class="form-label">Price To</label>
            <input type="number" class="form-control" id="priceTo" value={this.state.priceTo} onChange={(event) => this.onInputChange(event)} />
          </div>

          <div class="col-2">
            <label for="collateral" class="form-label">Collateral</label>
            <select id="collateral" class="form-select" onChange={(event) => this.onInputChange(event)} value={this.state.collateral}>
              <option>Any</option>
              <option>maWETH</option>
              <option>maLINK</option>
              <option>maAAVE</option>
              <option>maUNI</option>
              <option>maYFI</option>
              <option>maUSDC</option>
              <option>maDAI</option>
              <option>maTUSD</option>
              <option>maUSDT</option>
            </select>
          </div>

          <div class="col-3">
            <div>
              <label for="brsRange" class="form-label">Base Rarity Score</label>
              <Slider
                style={{ 'marginTop': '30px', 'width': '250px', 'marginLeft': '15px' }}
                id="brsRange"
                value={this.state.brsRange}
                onChange={(event, newValue) => this.handleChange(event, newValue)}
                valueLabelDisplay="auto"
                aria-labelledby="brsRange"
                min={this.state.sliderMin[0]}
                max={this.state.sliderMax[0]}
                valueLabelDisplay="on"
                />
            </div>
          </div>

          <div class="col-3">
            <div>
              <label for="mrsRange" class="form-label">Modified Rarity Score</label>
              <Slider
                style={{ 'marginTop': '30px', 'width': '250px', 'marginLeft': '15px' }}
                id="mrsRange"
                value={this.state.mrsRange}
                onChange={(event, newValue) => this.handleChange(event, newValue)}
                valueLabelDisplay="auto"
                aria-labelledby="mrsRange"
                min={this.state.sliderMin[1]}
                max={this.state.sliderMax[1]}
                valueLabelDisplay="on"
                />
            </div>
          </div>

          <div class="col-2">
            <label for="gotchiId" class="form-label">Aavegotchi ID</label>
            <input type="text" class="form-control" id="gotchiId" value={this.state.gotchiId} onChange={(event) => this.onInputChange(event)} />
          </div>

          <div class="col-4">
            <label for="account" class="form-label">Buyer or Seller Address</label>
            <input type="text" class="form-control" id="account" value={this.state.account} onChange={(event) => this.onInputChange(event)} />
          </div>

          <div class="col-3">
            <div>
              <label for="kinsRange" class="form-label">Kinship</label>
              <Slider
                style={{ 'marginTop': '30px', 'width': '250px', 'marginLeft': '15px' }}
                id="kinsRange"
                value={this.state.kinsRange}
                onChange={(event, newValue) => this.handleChange(event, newValue)}
                valueLabelDisplay="auto"
                aria-labelledby="kinsRange"
                min={this.state.sliderMin[2]}
                max={this.state.sliderMax[2]}
                valueLabelDisplay="on"
                />
            </div>
          </div>

          <div class="col-3">
            <div>
              <label for="expRange" class="form-label">Experience</label>
              <Slider
                style={{ 'marginTop': '30px', 'width': '250px', 'marginLeft': '15px' }}
                id="expRange"
                value={this.state.expRange}
                onChange={(event, newValue) => this.handleChange(event, newValue)}
                valueLabelDisplay="auto"
                aria-labelledby="expRange"
                min={this.state.sliderMin[3]}
                max={this.state.sliderMax[3]}
                valueLabelDisplay="on"
                />
            </div>
          </div>
        </form>
      );
    }
  }

  handleChange(event, newValue) {
    console.log('handleChange', event, newValue);
    this.setState(
      { [event.target.parentNode.id] : newValue },
      () => {
        this.onChangeDebounced(event);
      }
    );
  }

  render() {
    return(
      <div>
        <h1>Aavegotchi Sales</h1>
        {this.state.loading &&
          <Loading message="Loading Aavegotchi Sales from TheGraph..." />
        }
        {this.renderFilters()}

        {this.renderSalesAvgPriceChart()}
        {this.renderCollateralPieChart()}

        {this.renderTopAddressesTables()}
        {this.renderSalesTable()}
      </div>
    );
  }
}

export default AavegotchiSales;
