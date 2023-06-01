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

// import GotchiTowerDefence from './tdgame/GotchiTowerDefence';

import TicketSales from './components/TicketSales';
import FloorPrices from './components/FloorPrices';
import WearableDetails from './components/WearableDetails';
import WearablesList from './components/WearablesList';
import AavegotchiPortalRarityDistributions from './components/AavegotchiPortalRarityDistributions';
import Ownership from './components/Ownership';
import Land from './components/Land';

import PromotedListings from './components/PromotedListings';
import AddPromotedListing from './components/AddPromotedListing';

import ForgeOrBuy from './components/ForgeOrBuy';

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
  { path: '/floor', name: 'Floor Prices' },
  { path: '/wearables', name: 'Wearable Analytics' },
  // { path: '/leaderboards', name: 'Rarity Leaderboards' },
  // { path: '/traits', name: 'Traits Distribution' },
  // { path: '/rarity', name: 'Rarity Distribution' },
  // { path: '/portals', name: 'Portal Stats' },
  { path: '/gotchisales', name: 'Aavegotchi Sales' },
  { path: '/wearablesales', name: 'Wearable Sales' },
  { path: '/ticketsales', name: 'Ticket Sales' },
  // { path: '/landsales', name: 'Land Sales' },
  { path: '/recommendations', name: 'Wearable Recommendations' },
  { path: '/forge', name: 'Forge Calculator' },
  { path: '/td', name: 'Tower Defense' },
  // { path: '/tools', name: 'Recommended Tools' },
  // { path: '/timeline', name: 'Timeline' },
  // { path: '/networth', name: 'Networth' },
  // { path: '/petall', name: 'Pet All' },
];


ReactDOM.render(
  <React.StrictMode>
    <Router>
      <div className="container">
        <NavBar pages={navBarPages} />

        {/*<PromotedListings />*/}

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

          <Route path="/portalrarity">
            <AavegotchiPortalRarityDistributions title="Distribution of Rarity Scores in Portal Options" />
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

          {/*
                    <Route path="/td">
            <GotchiTowerDefence title="Gotchi Tower Defense" />
          </Route>
          */}

          <Route path="/floor">
            <FloorPrices title="Aavegotchi Floor Prices" />
          </Route>

          <Route path="/wearables/:id">
            <WearableDetails />
          </Route>

          <Route exact path="/wearables">
            <WearablesList title='Aavegotchi Wearables' />
          </Route>

          <Route path="/promote">
            <AddPromotedListing />
          </Route>

          {/*<Route path="/owners">
            <Ownership title="Aavegotchi Ownership Statistics" />
          </Route>*/}

          <Route path="/land">
            <Land title="Aavegotchi Land Statistics" />
          </Route>

          {/*
          <Route path="/landsales">
            <RealmSales title="Aavegotchi Land Sales" />
          </Route>

          <Route path="/activity">
            <BaazaarActivity title="Aavegotchi Baazaar Activity" />
          </Route>

          <Route path="/assets/:address">
            <AssetTracker />
          </Route>
          */}

          {/*<Route path="/erc721">
            <BaazaarERC721Listings title="Baazaar ERC721 Listings" />
          </Route>*/}

          <Route path="/forge">
            <ForgeOrBuy title="Forge or Buy Calculator" />
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

// <Route path="/frens">
//   <Frens />
// </Route>

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
