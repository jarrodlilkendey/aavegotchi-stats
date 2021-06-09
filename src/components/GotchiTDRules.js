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
        <h3>What is Gotchi Tower Defense?</h3>
        <p><a href='/td'>Gotchi TD</a> is a tower defense minigame for Aavegotchi built by <a href='https://aavegotchistats.com'>jarrod</a> featuring the track "I Wanna Be The Ape" created by <a href='https://soundcloud.com/jowijames/sets/aavegotchicom-minigame-chiptunes'>jo0wz</a>.</p>
        <p>To access your Gotchis, connect your account in Metamask that is holding your Gotchis, you will then be able to retrieve your Gotchis to strategically place them on the map to attack spawned enemy ghosts from the Aavegotchi game</p>
        <img src='/metamask-setup.gif' width='1024px' />
        <h3>Gotchi Traits</h3>
        <p>The Energy, Aggression, Spookiness and Brain Size traits of your Gotchi will influence gameplay. The further these traits are from 50, the greater influence they will have on gameplay.</p>
        <ul>
          <li>Energy impacts your Gotchi's attack speed</li>
          <li>Aggression impacts your Gotchi's attack damage</li>
          <li>Spookiness impacts your Gotchi's attack range</li>
          <li>Brain Size impacts the amount of XP points are gained per kill by your Gotchi which are redeemable for in game trait upgrade points</li>
        </ul>
        <h3>Bring Your Equipped Weapons</h3>
        <p>Enemies health points are based on their rarity score and they are easier to kill if you have fewer Gotchis on your account. You can select a maximum of 5 Gotchis from your account to be placed on a course.</p>
        <p>If your Gotchi has equipped a <a href='https://aavegotchi.com/baazaar/wearables?sort=priceLow&filter=all&search=fireball&slot=all'>fireball</a> it can be used as an in game item to deal attack damage and burn damage to enemies.</p>
        <p>If your Gotchi has equipped a <a href='https://aavegotchi.com/baazaar/wearables?sort=priceLow&filter=all&search=MK2%20Grenade&slot=all'>MK2 grenade</a> or a <a href='https://aavegotchi.com/baazaar/wearables?sort=priceLow&filter=all&search=M67%20Grenade&slot=all'>M67 grenade</a> these can be used as an in game item to deal attack damage and splash damage to nearby enemies.</p>
        <p>These items can be purchased in game from in-game currency that is earned from killing enemies.</p>
        <h3>Leaderboards</h3>
        <p>Gotchi Tower Defense has leaderboards and Gotchis that have got at least one kill will appear in these leaderboards.</p>
        <p>Progress higher up on the leaderboards by racking up enemy Gotchi kills, using the speed controls to complete the course as quickly as possible and by placing the fewest gotchis on the course.</p>
        <p>Note: if you are using the Brave browser, please disable shields for AavegotchiStats.com to prevent text alignment issues.</p>
      </div>
    );
  }
}

export default GotchiTDRules;
