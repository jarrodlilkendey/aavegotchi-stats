import React, { Component } from 'react';

import { DataGrid } from '@material-ui/data-grid';

import { readScores } from '../tdgame/leaderboard/LeaderboardUtil';

import Loading from './Loading';

const _ = require('lodash');

class TDXPLeaderboard extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;

    this.state = {
      loading: true,
      results: [],
      filter: '',
    };

    this.onFilterChange = this.onFilterChange.bind(this);
    this.renderLeaderboard = this.renderLeaderboard.bind(this);
  }

  onFilterChange(event) {
    event.preventDefault();
    this.setState({ filter: event.target.value });
  }

  filterGotchi(aavegotchi) {
    let filter = this.state.filter.toLowerCase();

    // ignore blank filter
    if (filter.length == 0) {
      return true;
    }

    // owner address filter
    if (filter.startsWith('0x')) {
      if (aavegotchi.owner.toLowerCase().startsWith(filter)) {
        return true;
      } else {
        return false;
      }
    }

    // id filter
    if (!isNaN(filter)) {
      if (aavegotchi.id.startsWith(filter)) {
        return true;
      } else {
        return false;
      }
    }

    // name filter
    if (aavegotchi.name.toLowerCase().startsWith(filter)) {
      return true;
    }

    return false;
  }

  async componentDidMount() {
    readScores({ leaderboard: 'xpEvent' })
      .then((results) => {
        console.log('results', results);
        this.setState({ results, loading: false });
      });
  }

  renderLeaderboard() {
    const _this = this;

    let rows = [];
    let columns = [];

    if (this.state.results.length > 0) {
      columns = [
        {
          field: 'id',
          headerName: 'ID',
          width: 70,
          renderCell: (params: GridCellParams) => (
            <a href={`https://aavegotchi.com/gotchi/${params.value}`} target="_blank">
              {params.value}
            </a>
          )
        },
        { field: 'name', headerName: 'NAME', width: 180 },
        { field: 'xp', headerName: 'XP', width: 90 },
        { field: 'kills', headerName: 'KILLS', width: 90 },
        { field: 'c100Score', headerName: 'C1 SC.', width: 95 },
        { field: 'c100Time', headerName: 'C1 TI.', width: 90 },
        { field: 'c100Placed', headerName: 'C1 PL.', width: 95 },
        { field: 'c100Rank', headerName: 'C1 RA.', width: 100 },
        { field: 'c250Score', headerName: 'C2 SC.', width: 95 },
        { field: 'c250Time', headerName: 'C2 TI.', width: 90 },
        { field: 'c250Placed', headerName: 'C2 PL.', width: 95 },
        { field: 'c250Rank', headerName: 'C2 RA.', width: 100 },
        { field: 'c1000Score', headerName: 'C3 SC.', width: 95 },
        { field: 'c1000Time', headerName: 'C3 TI.', width: 90 },
        { field: 'c1000Placed', headerName: 'C3 PL.', width: 95 },
        { field: 'c1000Rank', headerName: 'C3 RA.', width: 100 },
      ];

      let leaders = _.orderBy(this.state.results, ['kills'], ['desc']);

      let results100 = _.orderBy(_.filter(this.state.results, ['course-100.score', 100]), ['course-100.timeElapsed', 'course-100.gotchisPlaced'], ['asc', 'asc']);
      let results250 = _.orderBy(_.filter(this.state.results, ['course-250.score', 250]), ['course-250.timeElapsed', 'course-250.gotchisPlaced'], ['asc', 'asc']);
      let results1000 = _.orderBy(_.filter(this.state.results, ['course-1000.score', 1000]), ['course-1000.timeElapsed', 'course-1000.gotchisPlaced'], ['asc', 'asc']);

      leaders.map((result, index) => {
        let row = {
          id: result.info.gotchiId,
          name: result.info.name,
          kills: result.kills,
          owner: result.info.owner,
        };

        row.xp = 0;
        if (result.kills >= 250 && result.hasOwnProperty('course-100') && result['course-100'].score == 100) {
          row.xp = 5;
          if (result.hasOwnProperty('course-250') && result['course-250'].score == 250 && result.hasOwnProperty('course-1000') && result['course-1000'].score == 1000) {
            row.xp = 10;
            let rank1000 = _.findIndex(results1000, ['info.gotchiId', row.id]) + 1;
            if (rank1000 <= 500) {
              row.xp = 15;
            }
          }
        }

        if (result.hasOwnProperty('course-100')) {
          row.c100Score = result['course-100'].score;
          row.c100Time = result['course-100'].timeElapsed;
          row.c100Placed = result['course-100'].gotchisPlaced;
          if (row.c100Score == 100) {
            row.c100Rank = _.findIndex(results100, ['info.gotchiId', row.id]) + 1;
          }
        }

        if (result.hasOwnProperty('course-250')) {
          row.c250Score = result['course-250'].score;
          row.c250Time = result['course-250'].timeElapsed;
          row.c250Placed = result['course-250'].gotchisPlaced;
          if (row.c250Score == 250) {
            row.c250Rank = _.findIndex(results250, ['info.gotchiId', row.id]) + 1;
          }
        }

        if (result.hasOwnProperty('course-1000')) {
          row.c1000Score = result['course-1000'].score;
          row.c1000Time = result['course-1000'].timeElapsed;
          row.c1000Placed = result['course-1000'].gotchisPlaced;
          if (row.c1000Score == 1000) {
            row.c1000Rank = _.findIndex(results1000, ['info.gotchiId', row.id]) + 1;
          }
        }

        if (_this.filterGotchi(row)) {
          rows.push(row);
        }
      });

      return (
        <div style={{ height: '1080px', width: '100%' }}>
          <DataGrid
            rows={rows} columns={columns} pageSize={100} density="compact" disableSelectionOnClick="true" />
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
        <h1>Gotch Tower Defense XP Event Leaderboard</h1>
        <h2>Gotchi XP Requirements</h2>
        <ul>
          <li>Level 1 (5XP Total): 250+ Gotchi Kills & Score of 100 on Course 1</li>
          <li>Level 2 (10XP Total): Level 1 Requirements, Score of 250 on Course 2 & Score of 1000 on Course 3</li>
          <li>Level 3 (15XP Total): Level 1 & 2 Requirements & Top 500 Rank in Course 3</li>
        </ul>
        <p>Course ranks are sorted by score, time, then by the lowest amount of gotchis placed.</p>
        <div>
          <p><b>Filter Aavegotchis in Leaderboard</b></p>
          <div className="form-group">
            <input type="text" id="filter" className="form-control" value={this.state.filter} onChange={this.onFilterChange} placeholder="Filter by Owner, Name or Gotchi Id" /><br />
          </div>
        </div>
        {this.state.loading &&
          <Loading message="Loading Leaderboard Results..." />
        }
        {this.renderLeaderboard()}
      </div>
    );
  }
}

export default TDXPLeaderboard;
