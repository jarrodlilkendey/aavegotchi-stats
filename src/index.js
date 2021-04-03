import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';

import AavegotchiNetworth from './components/AavegotchiNetworth';
import OpenPortalListings from './components/OpenPortalListings';
import AavegotchiListings from './components/AavegotchiListings';
import WearableListings from './components/WearableListings';
import AavegotchiSupply from './components/AavegotchiSupply';
import Recommendations from './components/Recommendations';
import Credits from './components/Credits';
import NavBar from './components/NavBar';
import ClosedPortalListings from './components/ClosedPortalListings';
import Leaderboards from './components/Leaderboards';
import Consumables from './components/Consumables';
import Raffles from './components/Raffles';
import PetAll from './components/PetAll';
import AavegotchiTraitDistributions from './components/AavegotchiTraitDistributions';
import GotchiDonkeyKong from './components/GotchiDonkeyKong';
import Voting from './components/Voting';
import AavegotchiRarityDistributions from './components/AavegotchiRarityDistributions';
import WhaleWatch from './components/WhaleWatch';
import Timeline from './components/Timeline';
import Home from './components/Home';
import PortalStats from './components/PortalStats';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

const pages = [
  { path: '/', name: 'Home' },
  { path: '/recommendations', name: 'Recommendations' },
  { path: '/leaderboards', name: 'Leaderboards' },
  { path: '/traits', name: 'Traits Distribution' },
  { path: '/rarity', name: 'Rarity Distribution' },
  { path: '/portals', name: 'Portal Stats' },
];

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <div className="container">
        <NavBar pages={pages} />

        <Switch>
          <Route path="/recommendations">
            <Recommendations title="Aavegotchi Wearables Recommendations Engine" />
          </Route>

          <Route path="/leaderboards">
            <Leaderboards title="Aavegotchi Rarity Farming Leaderboard" />
          </Route>

          <Route path="/portals">
            <PortalStats />
          </Route>

          <Route path="/traits">
            <AavegotchiTraitDistributions />
          </Route>

          <Route path="/rarity">
            <AavegotchiRarityDistributions title="Distribution of Rarity Scores in Aavegotchi" />
          </Route>

           <Route path="/">
             <Home />
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
