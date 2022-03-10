import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { DataGrid } from '@material-ui/data-grid';

import { retrieveListedPortalOptions, retrieveListedAavegotchis } from '../util/ListingsUtil';
import { formatGhst } from '../util/AavegotchiMath';

import Loading from './Loading';

import { ethers } from "ethers";

const _ = require('lodash');
const axios = require('axios');
const ss = require('simple-statistics')

class BaazaarERC721Listings extends Component {
  constructor(props) {
    super(props);

    // this.renderRarityDistribution = this.renderRarityDistribution.bind(this);

    document.title = this.props.title;

    this.state = {
      openPortalListings: [],
      aavegotchiListings: [],
      chartData: {
        portalOptions: [],
        gotchis: []
      },
      loading: true,
    };
  }

  async componentDidMount() {
    retrieveListedPortalOptions()
      .then((openPortalListings) => {
        console.log('portal listings', openPortalListings);
        retrieveListedAavegotchis()
          .then((aavegotchiListings) => {
            console.log('aavegotchi listings', aavegotchiListings);
            this.calculateRarityData(openPortalListings, aavegotchiListings, [490, 999], [0, 10000]);
            this.calculateKinshipData(aavegotchiListings, [191, 9999], [0, 5000]);
            this.calculateXPData(aavegotchiListings, [0, 9999], [0, 5000]);
            this.setState({ openPortalListings, aavegotchiListings });
          });
      });
  }

  calculateRarityData(openPortalListings, aavegotchiListings, brsRange, priceRange) {
    let rarityChartData = { portalOptions: [], gotchis: [] };
    openPortalListings.map((listing) => {
      let price = parseInt(ethers.utils.formatEther(listing.priceInWei));
      if (price >= priceRange[0] && price <= priceRange[1]) {
        listing.portal.options.map((option) => {
          if (option.baseRarityScore >= brsRange[0] && option.baseRarityScore <= brsRange[1]) {
            rarityChartData.portalOptions.push({
              name: listing.id,
              x: option.baseRarityScore,
              y: price,
            });
          }
        });
      }
    });

    aavegotchiListings.map((listing) => {
      let price = parseInt(ethers.utils.formatEther(listing.priceInWei));
      if (price >= priceRange[0] && price <= priceRange[1]) {
        if (listing.gotchi.baseRarityScore >= brsRange[0] && listing.gotchi.baseRarityScore <= brsRange[1]) {
          rarityChartData.gotchis.push({
            name: listing.id,
            x: listing.gotchi.baseRarityScore,
            y: price,
          });
        }
      }
    });

    this.setState({ rarityChartData });
  }

  calculateKinshipData(aavegotchiListings, kinshipRange, priceRange) {
    let kinshipChartData = { gotchis: [] };

    aavegotchiListings.map((listing) => {
      let price = parseInt(ethers.utils.formatEther(listing.priceInWei));
      if (price >= priceRange[0] && price <= priceRange[1]) {
        let kinship = parseInt(listing.gotchi.kinship);
        let ghstPerKinship = parseFloat(price) / parseFloat(kinship);
        if (kinship >= kinshipRange[0] && kinship <= kinshipRange[1]) {
          kinshipChartData.gotchis.push({
            name: listing.id,
            x: kinship,
            y: parseFloat(ghstPerKinship.toFixed(3)),
            z: price,
          });
        }
      }
    });

    this.setState({ kinshipChartData });
  }

  calculateXPData(aavegotchiListings, xpRange, priceRange) {
    let xpChartData = { gotchis: [] };

    aavegotchiListings.map((listing) => {
      let price = parseInt(ethers.utils.formatEther(listing.priceInWei));
      if (price >= priceRange[0] && price <= priceRange[1]) {
        let xp = parseInt(listing.gotchi.experience);
        let ghstPerXp = parseFloat(price) / parseFloat(xp);
        if (xp >= xpRange[0] && xp <= xpRange[1]) {
          xpChartData.gotchis.push({
            name: listing.id,
            x: xp,
            y: parseFloat(ghstPerXp.toFixed(3)),
            z: price,
          });
        }
      }
    });

    this.setState({ xpChartData });
  }

  renderRarityPriceDistribution() {
    // brs by price
    if (this.state.rarityChartData && this.state.rarityChartData.portalOptions && this.state.rarityChartData.portalOptions.length > 0 && this.state.rarityChartData.gotchis.length > 0) {
      const options = {
        chart: {
          type: 'scatter',
          zoomType: 'xy'
        },
        title: {
          text: 'Listed Gotchis and Portal Options by Base Rarity Score'
        },
        xAxis: {
          title: {
            text: 'Base Rarity Score'
          }
        },
        yAxis: {
          title: {
            text: 'Price in GHST'
          }
        },
        plotOptions: {
          scatter: {
            marker: {
                radius: 5,
                states: {
                    hover: {
                        enabled: true,
                        lineColor: 'rgb(100,100,100)'
                    }
                }
            },
            states: {
                hover: {
                    marker: {
                        enabled: false
                    }
                }
            },
            tooltip: {
                headerFormat: '<b>{series.name}</b><br>',
                pointFormat: '{point.x} BRS for {point.y} GHST'
            }
          },
          series: {
            cursor: 'pointer',
            events: {
              click: function(event) {
                console.log('click', event);
                window.open(`https://app.aavegotchi.com/baazaar/erc721/${event.point.name}`, '_blank').focus();
              },
            },
          }
        },
        series: [{
            name: 'Portal Options',
            data: this.state.rarityChartData.portalOptions,
        }, {
            name: 'Gotchis',
            data: this.state.rarityChartData.gotchis,
        }],
        credits: {
          enabled: true,
          href: 'https://aavegotchistats.com/wearables',
          text: 'aavegotchistats.com/wearables'
        }
      };

      return(
        <div>
          <h2>Wearables Traits Distribution by Rarity</h2>
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
          />
        </div>
      );
    }
  }

  renderKinshipPriceDistribution() {
    console.log('renderKinshipPriceDistribution', this.state);
    if (this.state.kinshipChartData && this.state.kinshipChartData.gotchis && this.state.kinshipChartData.gotchis.length > 0) {
      console.log('renderKinshipPriceDistribution2');
      const options = {
        chart: {
          type: 'scatter',
          zoomType: 'xy'
        },
        title: {
          text: 'Listed Gotchis by Kinship'
        },
        xAxis: {
          title: {
            text: 'Kinship'
          }
        },
        yAxis: {
          title: {
            text: 'Price in GHST'
          }
        },
        plotOptions: {
          scatter: {
            marker: {
                radius: 5,
                states: {
                    hover: {
                        enabled: true,
                        lineColor: 'rgb(100,100,100)'
                    }
                }
            },
            states: {
                hover: {
                    marker: {
                        enabled: false
                    }
                }
            },
            tooltip: {
                headerFormat: '<b>{series.name}</b><br>',
                pointFormat: '{point.x} Kinship for {point.z} GHST at {point.y} GHST per Kinship'
            }
          },
          series: {
            cursor: 'pointer',
            events: {
              click: function(event) {
                console.log('click', event);
                window.open(`https://app.aavegotchi.com/baazaar/erc721/${event.point.name}`, '_blank').focus();
              },
            },
          }
        },
        series: [{
            name: 'Gotchis',
            data: this.state.kinshipChartData.gotchis,
        }],
        credits: {
          enabled: true,
          href: 'https://aavegotchistats.com/wearables',
          text: 'aavegotchistats.com/wearables'
        }
      };

      return(
        <div>
          <h2>Listed Gotchis by Kinship and Price</h2>
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
          />
        </div>
      );
    }
  }

  renderXPPriceDistribution() {
    if (this.state.xpChartData && this.state.xpChartData.gotchis && this.state.xpChartData.gotchis.length > 0) {
      const options = {
        chart: {
          type: 'scatter',
          zoomType: 'xy'
        },
        title: {
          text: 'Listed Gotchis by XP'
        },
        xAxis: {
          title: {
            text: 'Experience'
          }
        },
        yAxis: {
          title: {
            text: 'Price in GHST'
          }
        },
        plotOptions: {
          scatter: {
            marker: {
                radius: 5,
                states: {
                    hover: {
                        enabled: true,
                        lineColor: 'rgb(100,100,100)'
                    }
                }
            },
            states: {
                hover: {
                    marker: {
                        enabled: false
                    }
                }
            },
            tooltip: {
                headerFormat: '<b>{series.name}</b><br>',
                pointFormat: '{point.x} Experience for {point.z} GHST at {point.y} GHST per XP'
            }
          },
          series: {
            cursor: 'pointer',
            events: {
              click: function(event) {
                console.log('click', event);
                window.open(`https://app.aavegotchi.com/baazaar/erc721/${event.point.name}`, '_blank').focus();
              },
            },
          }
        },
        series: [{
            name: 'Gotchis',
            data: this.state.xpChartData.gotchis,
        }],
        credits: {
          enabled: true,
          href: 'https://aavegotchistats.com/wearables',
          text: 'aavegotchistats.com/wearables'
        }
      };

      return(
        <div>
          <h2>Listed Gotchis by Experience and Price</h2>
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
          />
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <h1>Listed Aavegotchi and Portal Option Prices</h1>
        {/*this.state.loading &&
          <Loading message="Loading Aavegotchis from TheGraph..." />
        */}
        {this.renderRarityPriceDistribution()}
        {this.renderKinshipPriceDistribution()}
        {this.renderXPPriceDistribution()}
      </div>
    );
  }
}

export default BaazaarERC721Listings;
