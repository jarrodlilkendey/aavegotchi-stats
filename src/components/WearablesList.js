import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { DataGrid } from '@material-ui/data-grid';

import DatePicker from 'react-datepicker';

import Loading from './Loading';

import { retrieveSoldWearableListingsById } from '../util/WearablesUtil';

import { formatGhst, wearableTraitModifiers } from '../util/AavegotchiMath';

import { withRouter } from 'react-router-dom';

import wearableItemTypes from '../data/wearables/wearables.json';

const _ = require('lodash');
const moment = require('moment');


class WearablesList extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    console.log(wearableItemTypes);

    this.state = {
      wearablesByRarity: {},
      wearablesBySlot: {},
      traitsByRarity: {},
      traitsBySlot: {}
    };
  }

  componentDidMount() {
    this.calculateData();

  }

  getSlotLabel(sp) {
    if (sp[0]) {
      return 'Body';
    }

    if (sp[3]) {
      return 'Head';
    }

    if (sp[4] && sp[5]) {
      return 'Hands';
    }

    if (sp[4]) {
      return 'Left Hand';
    }

    if (sp[1]) {
      return 'Face';
    }

    if (sp[2]) {
      return 'Eyes';
    }

    if (sp[6]) {
      return 'Pet';
    }

    return 'Background';
  }

  calculateData() {
    let traitsByRarity = {
      '1': [0, 0, 0, 0, 0, 0, 0, 0],
      '2': [0, 0, 0, 0, 0, 0, 0, 0],
      '5': [0, 0, 0, 0, 0, 0, 0, 0],
      '10': [0, 0, 0, 0, 0, 0, 0, 0],
      '20': [0, 0, 0, 0, 0, 0, 0, 0],
      '50': [0, 0, 0, 0, 0, 0, 0, 0],
    };

    let wearablesByRarity = {
      '1': 0,
      '2': 0,
      '5': 0,
      '10': 0,
      '20': 0,
      '50': 0,
    };

    let traitsBySlot = {
      'Body': [0, 0, 0, 0, 0, 0, 0, 0],
      'Hands': [0, 0, 0, 0, 0, 0, 0, 0],
      'Left Hand': [0, 0, 0, 0, 0, 0, 0, 0],
      'Head': [0, 0, 0, 0, 0, 0, 0, 0],
      'Face': [0, 0, 0, 0, 0, 0, 0, 0],
      'Eyes': [0, 0, 0, 0, 0, 0, 0, 0],
      'Pet': [0, 0, 0, 0, 0, 0, 0, 0],
    };

    let wearablesBySlot = {
      'Body': 0,
      'Hands': 0,
      'Left Hand': 0,
      'Head': 0,
      'Face': 0,
      'Eyes': 0,
      'Pet': 0,
    };

    Object.keys(wearableItemTypes).map((key, wearableIndex) => {
      let w = wearableItemTypes[key];
      let rarity = w.rarityScoreModifier;
      let slotLabel = this.getSlotLabel(w.slotPositions);

      wearablesByRarity[rarity] += parseInt(w.totalQuantity);
      wearablesBySlot[slotLabel] += parseInt(w.totalQuantity);

      for (let ti = 0; ti < 4; ti++) {
        let tv = parseInt(w.traitModifiers[ti]);
        if (tv > 0) {
          traitsByRarity[rarity][ti * 2] += parseInt(w.totalQuantity);
          traitsBySlot[slotLabel][ti * 2] += parseInt(w.totalQuantity);
        } else if (tv < 0) {
          traitsByRarity[rarity][(ti * 2) + 1] += parseInt(w.totalQuantity);
          traitsBySlot[slotLabel][(ti * 2) + 1] += parseInt(w.totalQuantity);
        }
      };
    });

    this.setState({ traitsByRarity, traitsBySlot, wearablesByRarity, wearablesBySlot })
  }

  renderWearablesByRarityAndSlot() {
    if (Object.keys(this.state.wearablesByRarity).length > 0 && Object.keys(this.state.wearablesBySlot).length > 0) {
      const rarityOptions = {
        chart: {
          type: 'column'
        },
        title: {
          text: 'Aavegotchi Wearables by Rarity'
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
          title: {
            text: 'Total Wearables'
          }
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        series: [{
          name: 'Rarity',
          colorByPoint: true,
          data: [
            {
              name: 'Common',
              y: this.state.wearablesByRarity['1'],
              color: '#8064ff'
            }, {
              name: 'Uncommon',
              y: this.state.wearablesByRarity['2'],
              color: '#33bacc'
            }, {
              name: 'Rare',
              y: this.state.wearablesByRarity['5'],
              color: '#59bcff'
            }, {
              name: 'Legendary',
              y: this.state.wearablesByRarity['10'],
              color: '#ffc36b'
            }, {
              name: 'Mythical',
              y: this.state.wearablesByRarity['20'],
              color: '#ff96ff'
            }, {
              name: 'Godlike',
              y: this.state.wearablesByRarity['50'],
              color: '#51ffa8'
            }
          ]
        }],
        credits: {
          enabled: true,
          href: 'https://aavegotchistats.com/wearables',
          text: 'aavegotchistats.com/wearables'
        }
      };

      const slotOptions = {
        chart: {
          type: 'column'
        },
        title: {
          text: 'Aavegotchi Wearables by Slot'
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
          title: {
            text: 'Total Wearables'
          }
        },
        plotOptions: {
            column: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        series: [{
          name: 'Slot',
          colorByPoint: true,
          data: [
            {
              name: 'Body',
              y: this.state.wearablesBySlot['Body']
            }, {
              name: 'Hands',
              y: this.state.wearablesBySlot['Hands']
            }, {
              name: 'Left Hand',
              y: this.state.wearablesBySlot['Left Hand']
            }, {
              name: 'Head',
              y: this.state.wearablesBySlot['Head']
            }, {
              name: 'Face',
              y: this.state.wearablesBySlot['Face']
            }, {
              name: 'Eyes',
              y: this.state.wearablesBySlot['Eyes']
            }, {
              name: 'Pet',
              y: this.state.wearablesBySlot['Pet']
            }
          ]
        }],
        credits: {
          enabled: true,
          href: 'https://aavegotchistats.com/wearables',
          text: 'aavegotchistats.com/wearables'
        }
      };

      return (
        <div className="container">
          <div className="row">
            <div className="col">
              <h2>Wearables By Rarity</h2>
              <HighchartsReact
                highcharts={Highcharts}
                options={rarityOptions}
              />
            </div>
            <div className="col">
              <h2>Wearables By Slot</h2>
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

  renderWearablesByTraitsAndRarity() {
    if (Object.keys(this.state.traitsByRarity).length > 0) {
      const options = {
        chart: {
          type: 'column'
        },
        title: {
          text: 'Aavegotchi Wearables Traits Distribution by Rarity'
        },
        xAxis: {
            categories: ['+NRG', '-NRG', '+AGG', '-AGG', '+SPK', '-SPK', '+BRN', '-BRN']
        },
        yAxis: {
          title: {
            text: 'Total Wearables'
          }
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true
                }
            }
        },
        series: [{
            name: 'Godlike',
            data: this.state.traitsByRarity['50'],
            color: '#51ffa8'
        }, {
            name: 'Mythical',
            data: this.state.traitsByRarity['20'],
            color: '#ff96ff'
        }, {
            name: 'Legendary',
            data: this.state.traitsByRarity['10'],
            color: '#ffc36b'
        }, {
            name: 'Rare',
            data: this.state.traitsByRarity['5'],
            color: '#59bcff'
        }, {
            name: 'Uncommon',
            data: this.state.traitsByRarity['2'],
            color: '#33bacc'
        }, {
            name: 'Common',
            data: this.state.traitsByRarity['1'],
            color: '#8064ff'
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

  renderWearablesByTraitsAndSlot() {
    if (Object.keys(this.state.traitsBySlot).length > 0) {
      const options = {
        chart: {
          type: 'column'
        },
        title: {
          text: 'Aavegotchi Wearables Traits Distribution by Slot'
        },
        xAxis: {
            categories: ['+NRG', '-NRG', '+AGG', '-AGG', '+SPK', '-SPK', '+BRN', '-BRN']
        },
        yAxis: {
          title: {
            text: 'Total Wearables'
          }
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true
                }
            }
        },
        series: [{
            name: 'Body',
            data: this.state.traitsBySlot['Body']
        }, {
            name: 'Hands',
            data: this.state.traitsBySlot['Hands']
        }, {
            name: 'Left Hand',
            data: this.state.traitsBySlot['Left Hand']
        }, {
            name: 'Head',
            data: this.state.traitsBySlot['Head']
        }, {
            name: 'Face',
            data: this.state.traitsBySlot['Face']
        }, {
            name: 'Eyes',
            data: this.state.traitsBySlot['Eyes']
        }, {
            name: 'Pet',
            data: this.state.traitsBySlot['Pet']
        }],
        credits: {
          enabled: true,
          href: 'https://aavegotchistats.com/wearables',
          text: 'aavegotchistats.com/wearables'
        }
      };

      return(
        <div>
          <h2>Wearables Traits Distribution by Slot</h2>
          <HighchartsReact
            highcharts={Highcharts}
            options={options}
          />
        </div>
      );
    }
  }

  renderWearablesList() {
    const columns = [
      {
        field: 'id',
        headerName: 'ID',
        width: 140,
        renderCell: (params: GridCellParams) => (
          <a href={`/wearables/${params.value}`} target="_blank">
            {params.value}
          </a>
        )
      },
      { field: 'name', headerName: 'Name', width: 240 },
      { field: 'slot', headerName: 'Slot', width: 180 },
      { field: 'rarity', headerName: 'Rarity', width: 180 },
      { field: 'totalQuantity', headerName: 'Total Quantity', width: 180 },
      { field: 'traitModifiers', headerName: 'Trait Modifiers', width: 240 },
    ];

    let rows = [];

    let rarityLookup = {'1': 'Common', '2': 'Uncommon', '5': 'Rare', '10': 'Legendary', '20': 'Mythical', '50': 'Godlike'};

    Object.keys(wearableItemTypes).map((key, index) => {
      let w = wearableItemTypes[key];
      rows.push({
        id: key,
        name: w.name,
        slot: this.getSlotLabel(w.slotPositions),
        rarity: rarityLookup[w.rarityScoreModifier],
        totalQuantity: parseInt(w.totalQuantity),
        traitModifiers: wearableTraitModifiers(w.traitModifiers)
      });
    });

    return(
      <div>
        <h2>Wearables List</h2>
        {/*Object.keys(wearableItemTypes).map((key, index) => {
          let w = wearableItemTypes[key];
          return(
            <p><a href={`/wearables/${key}`}>{`#${key}`} {w.name}</a></p>
          );
        })*/}
        <div style={{ height: '1080px', width: '100%' }}>
          <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
        </div>
      </div>
    );
  }

  render() {
    return(
      <div>
        <h1>Aavegotchi Wearables</h1>
        {this.renderWearablesByRarityAndSlot()}
        {this.renderWearablesByTraitsAndRarity()}
        {this.renderWearablesByTraitsAndSlot()}
        {this.renderWearablesList()}
      </div>
    );
  }
}

export default WearablesList;
