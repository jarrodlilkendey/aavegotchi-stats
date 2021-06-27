import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';

import Credits from './components/Credits';
import NavBar from './components/NavBar';

import Home from './components/Home';
import Recommendations from './components/Recommendations';
import Leaderboards from './components/Leaderboards';
import AavegotchiTraitDistributions from './components/AavegotchiTraitDistributions';
import AavegotchiRarityDistributions from './components/AavegotchiRarityDistributions';
import PortalStats from './components/PortalStats';
import WearableSales from './components/WearableSales';
import AavegotchiSales from './components/AavegotchiSales';
import AavegotchiVotingPower from './components/AavegotchiVotingPower';
import PetAll from './components/PetAll';
import GotchiTowerDefence from './tdgame/GotchiTowerDefence';
import TDLeaderboard from './components/TDLeaderboard';
import TDXPLeaderboard from './components/TDXPLeaderboard';
import GotchiTDRules from './components/GotchiTDRules';
import TicketSales from './components/TicketSales';

// import Timeline from './components/Timeline';
// import AavegotchiNetworth from './components/AavegotchiNetworth';
// import CheapestSets from './components/CheapestSets';
// import Consumables from './components/Consumables';
// import Kinship from './components/Kinship';
// import DollarCostAverageTickets from './components/DollarCostAverageTickets';

import firebase from 'firebase/app';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

require('dotenv').config();

firebase.initializeApp(JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG));
console.log('firebase initialize', firebase);

const navBarPages = [
  { path: '/recommendations', name: 'Wearable Recommendations' },
  { path: '/leaderboards', name: 'Rarity Leaderboards' },
  { path: '/traits', name: 'Traits Distribution' },
  { path: '/rarity', name: 'Rarity Distribution' },
  { path: '/portals', name: 'Portal Stats' },
  { path: '/wearablesales', name: 'Wearable Sales' },
  { path: '/gotchisales', name: 'Aavegotchi Sales' },
  { path: '/ticketsales', name: 'Ticket Sales' },
  { path: '/td', name: 'Tower Defense' },
  // { path: '/timeline', name: 'Timeline' },
  // { path: '/networth', name: 'Networth' },
  { path: '/petall', name: 'Pet All' },
];

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <div className="container">
        <NavBar pages={navBarPages} />

        <Switch>
          <Route path="/recommendations">
            <Recommendations title="Aavegotchi Wearables Recommendations Engine" />
          </Route>

          <Route path="/leaderboards">
            <Leaderboards title="Aavegotchi Rarity Farming Leaderboard" />
          </Route>

          <Route path="/portals">
            <PortalStats title="Aavegotchi Portal Statistics" />
          </Route>

          <Route path="/traits">
            <AavegotchiTraitDistributions title="Distribution of Traits in Aavegotchi" />
          </Route>

          <Route path="/rarity">
            <AavegotchiRarityDistributions title="Distribution of Rarity Scores in Aavegotchi" />
          </Route>

          <Route path="/wearablesales">
            <WearableSales title="Aavegotchi Wearable Sales" />
          </Route>

          <Route path="/gotchisales">
            <AavegotchiSales title="Aavegotchi Sales" />
          </Route>

          <Route path="/ticketsales">
            <TicketSales title="Ticket Sales" />
          </Route>

          <Route path="/voting">
            <AavegotchiVotingPower title="Aavegotchi Voting Power" />
          </Route>

          <Route path="/td">
            <GotchiTowerDefence title="Gotchi Tower Defense" />
          </Route>

          <Route path="/tdleaderboard">
            <TDLeaderboard title="Gotchi Tower Defense Leaderboard" />
          </Route>

          <Route path="/tdxpleaderboard">
            <TDXPLeaderboard title="Gotchi Tower Defense XP Event Leaderboard" />
          </Route>

          <Route path="/tdhelp">
            <GotchiTDRules title="How to Play Gotchi Tower Defense" />
          </Route>

          <Route path="/petall">
            <PetAll title="Pet All Aavegotchis" />
          </Route>

          <Route path="/">
            <Home title="What is AavegotchiStats?" />
          </Route>
         </Switch>

         <Credits />
      </div>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

          //                     <Route path="/timeline">
          //                       <Timeline title="Timeline" />
          //                     </Route>
          //
          //                     <Route path="/networth">
          //                       <AavegotchiNetworth title="Networth" />
          //                     </Route>
          //                     <Route path="/consumables">
          //                       <Consumables title="Consumables" />
          //                     </Route>
          //                     <Route path="/kinship">
          //                       <Kinship title="Kinship analytics" />
          //                     </Route>
          //
          // <Route path="/tickets">
          //   <DollarCostAverageTickets />
          // </Route>
          // <Route path="/open">
          //   <OpenPortalListings title="" />
          // </Route>
          //
          // <Route path="/sets">
          //   <CheapestSets title="Cheapest Sets" />
          // </Route>

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
