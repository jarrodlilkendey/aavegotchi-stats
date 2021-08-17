import React, { Component } from 'react';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { DataGrid } from '@material-ui/data-grid';

import DatePicker from 'react-datepicker';

import Loading from './Loading';

import { retrieveSoldWearableListingsById } from '../util/WearablesUtil';

import { formatGhst, wearableRarityLabel, wearablePositionLabel } from '../util/AavegotchiMath';

import { withRouter } from 'react-router-dom';

import wearableItemTypes from '../data/wearables/wearables.json';

const _ = require('lodash');
const moment = require('moment');


class WearablesList extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    console.log(wearableItemTypes);
  }

  render() {
    return(
      <div>
        <h1>Aavegotchi Wearables</h1>
        <div>
        {Object.keys(wearableItemTypes).map((key, index) => {
          let w = wearableItemTypes[key];
          return(
            <p><a href={`/wearables/${key}`}>{`#${key}`} {w.name}</a></p>
          );
        })}
        </div>
      </div>
    );
  }
}

export default WearablesList;
