import React, { Component } from 'react';

class Home extends Component {
  render() {
    return(
      <div>
        <h1>Welcome to AavegotchiStats</h1>
        <h2>What is AavegotchiStats?</h2>
        <p>AavegotchiStats is a series of <a href="https://github.com/programmablewealth/aavegotchi-stats">open source</a> tools I built to analyse raw data from the blockchain to improve visibility into the Aavegotchi game and ecosystem.</p>
        <p>Tools I have created that are accessible via AavegotchiStats.com include:</p>
        <ul>
          <li><a href="./recommendations">Aavegotchi Wearables Recommendation Engine</a></li>
          <li><a href="./leaderboards">Aavegotchi Rarity Farming Leaderboards</a></li>
          <li><a href="./traits">Aavegotchi Traits Distribution</a></li>
          <li><a href="./rarity">Aavegotchi Rarity Distribution</a></li>
          <li><a href="./portals">Aavegotchi Portal Opening and Claiming Statistics</a></li>
        </ul>
        <h2>Aavegotchi Basics</h2>
        <p>I have created a series of videos on YouTube that will help you get started with the Aavegotchi game by covering the core game mechanics. Check out the YouTube playlist embedded below.</p>
        <iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=PLbj8o-ZwvWtJGebr8Wig5EWEcVNSUy60K" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
      </div>
    );
  }
}

export default Home;
