import React, { Component } from 'react';

class GotchiTDRules extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;
  }

  render() {
    return(
      <div>
        <h2>How to Play Gotchi Tower Defense</h2>
        <p>Gotchi TD is a tower defense minigame for Aavegotchi built by the community, it is currently in beta phase and there are no XP drops right now for playing.</p>
        <p>Connect your account in Metamask holding your Gotchis to retrieve your Gotchis to strategically place them on the map to attack spawned enemy ghosts from the Aavegotchi game</p>
        <p>The traits of your Gotchi to will influence gameplay.</p>
        <ul>
          <li>The further your Gotchi's Energy is from 50, the quicker your attack speed will be</li>
          <li>The further your Gotchi's Aggression is from 50, the higher your attack damage will be</li>
          <li>The further your Gotchi's Spookiness is from 50, the larger your attack range will be</li>
          <li>The further your Gotchi's Brain Size is from 50, the more XP points are gained per kill which are redeemable for in game trait upgrade points</li>
        </ul>
        <p>If your Gotchi has equipped a fireball it can be used as an in game item to deal attack damage and burn damage to enemies.</p>
        <p>Enemies health points are based on their rarity score and they are easier to kill if you have fewer Gotchis on your account. If you have more than 21 Gotchis on your account, a maximum of 21 Gotchis will be randomly selected from your account that can be used in-game.</p>
        <p><a href="./tdleaderboard">Leaderboards</a> have been created for three different modes 100 Gotchis, 250 Gotchis and 1000 Gotchis. The quicker you complete the map with the fewest Gotchis, the better your rank will be. There is also a leaderboard ranking individual Gotchis with the most enemy kills.</p>
        <p>The game is currently in beta, you may experience bugs or performance issues when playing, please use the <a href="https://docs.google.com/forms/d/e/1FAIpQLSe8fPhWSv2c8kUNFqG-3owMI3KK33X7_OM6CxU_dNEIHt8d_w/viewform?usp=sf_link">google form</a> to provide your feedback on the game. Please report anything around bugs, performance, game balance, things you like or dislike or any other feedback you think would make the game better for a full launch. Include hardware specs and browser information to help with resolution of reported issues. Note: if you are using the Brave browser, please disable shields for AavegotchiStats.com to prevent text alignment issues.</p>
      </div>
    );
  }
}

export default GotchiTDRules;
