import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';

import Recommendations from './components/Recommendations';
import Credits from './components/Credits';
import NavBar from './components/NavBar';
import Leaderboards from './components/Leaderboards';
import AavegotchiTraitDistributions from './components/AavegotchiTraitDistributions';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

const pages = [
  { path: '/', name: 'Recommendations' },
  { path: '/leaderboards', name: 'Leaderboards' },
  { path: '/traits', name: 'Traits Distribution' },
];

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <div className="container">
        <NavBar pages={pages} />

        <Switch>
          <Route path="/leaderboards">
            <Leaderboards />
          </Route>

          <Route path="/traits">
            <AavegotchiTraitDistributions />
          </Route>

         <Route expath="/">
           <Recommendations />
         </Route>

        </Switch>

       <Credits />
      </div>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
