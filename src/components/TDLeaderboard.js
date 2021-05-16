import React, { Component } from 'react';

import { DataGrid } from '@material-ui/data-grid';

import { readScores } from '../tdgame/leaderboard/LeaderboardUtil';

import Loading from './Loading';

const _ = require('lodash');

class TDLeaderboard extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    this.state = {
      modes: ['100 Gotchi', '250 Gotchi', '1000 Gotchi' ],
      modeLeaderboards: ['leaderboard-level1-100', 'leaderboard-level1-250', 'leaderboard-level1-1000' ],
      selectedMode: 0,
      loading: true,
      results: []
    };

    this.handleLeaderboardSelect = this.handleLeaderboardSelect.bind(this);

    this.renderLeaderboard = this.renderLeaderboard.bind(this);
  }

  async componentDidMount() {
    let leaderboard = this.state.modeLeaderboards[this.state.selectedMode];
    console.log('retrieve', leaderboard);
    readScores({ leaderboard: leaderboard })
      .then((results) => {
        console.log('results', results);
        this.setState({ results, loading: false });
      });
  }

  handleLeaderboardSelect(mode) {
    this.setState(
      { selectedMode: mode, loading: true },
      () => {
        let leaderboard = this.state.modeLeaderboards[this.state.selectedMode];
        readScores({ leaderboard: leaderboard })
          .then((results) => {
            console.log('results', results);
            this.setState({ results, loading: false });
          });
      }
    );
  }

  renderLeaderboard() {
    const _this = this;

    let rows = [];
    let columns = [
      { field: 'id', headerName: 'Rank', width: 90 },
      { field: 'user', headerName: 'Account', width: 380 },
      { field: 'score', headerName: 'Score', width: 90 },
      { field: 'time', headerName: 'Time', width: 90 },
      { field: 'placed', headerName: 'Gotchis Placed', width: 160 },
    ];

    if (this.state.results.length > 0) {
      let leaders = _.orderBy(this.state.results, ['score', 'time', 'placed'], ['desc', 'desc', 'desc']);

      leaders.map((result, index) => {
        console.log(result);

        let row = {
          id: index + 1,
          user: result.user,
          score: result.score,
          time: result.timeElapsed,
          placed: result.gotchisPlaced
        };

        rows.push(row);
      });

      return (
        <div style={{ height: '1080px', width: '100%' }}>
          <DataGrid rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
        </div>
      );
    }

    if (this.state.results.length == 0 && this.state.loading == false) {
      return(
        <p>No results</p>
      );
    }
  }

  render() {
    return(
      <div>
        <h1>Gotch Tower Defense Leaderboards</h1>
        <h2>{this.state.modes[this.state.selectedMode]} Leaderboard</h2>
        <div style={{margin: "10px"}}>
          <button className="btn btn-primary btn-sm" onClick={() => this.handleLeaderboardSelect(0)}>100 Gotchis</button> <button className="btn btn-primary btn-sm" onClick={() => this.handleLeaderboardSelect(1)}>250 Gotchis</button> <button className="btn btn-primary btn-sm" onClick={() => this.handleLeaderboardSelect(2)}>1000 Gotchis</button>
        </div>
        {this.state.loading &&
          <Loading message="Loading Leaderboard Results..." />
        }
        {this.renderLeaderboard()}
      </div>
    );
  }
}

export default TDLeaderboard;
