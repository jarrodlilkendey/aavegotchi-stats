import React, { Component } from 'react';

class AddPromotedListing extends Component {
  constructor(props) {
    super(props);

    document.title = 'Add Promoted Listing';

    this.state = {
    };
  }

  async componentDidMount() {

  }

  render() {
    return(
      <div>
        <h1>Promote your listing on AavegotchiStats.com</h1>
        <p>AavegotchiStats.com is a growing tool for tracking statistics in the Aavegotchi ecosystem that is currently being used by over 3.5K users per month. Promoting your listing on AavegotchiStats will put your listing in front of many dedicated users in the Aavegotchi community.</p>
        <p>AavegotchiStats.com user statistics as of 5th September 2021 from Google Analytics</p>
        <img src='/aavegotchistats-users.png' />
        <h2>What do you get with a promoted listing on AavegothiStats.com?</h2>
        <p>Your promoted Aavegotchi Baazaar listing will be displayed on every page of AavegotchiStats.com (with the exception of the Tower Defense game).</p>
        <p>You will be able to select a promotion period of either 24 hours or 48 hours. At the end of this period, your listing will be removed from the promoted listings section of AavegotchiStats.</p>
        <p>Sample Listing on Desktop</p>
        <img src='/promo-listing-desktop.png' style={{ 'border': '3px solid white' }} />
        <p>Sample Listing on Smart Phone</p>
        <img src='/promo-listing-mobile.png' style={{ 'border': '3px solid white' }} />
        <h2>How much does it cost?</h2>
        <p>24 Hour Promotion: 1 GHST</p>
        <p>48 Hour Promotion: 2 GHST</p>
        <p>If the listing is sold or cancelled during the promotion period, the promotion of the listing on AavegotchiStats will expire and it will no longer show in the promoted listings section.</p>
        <p>Note: these current prices are likely to increase in the future and are currently lowered to test the viability of this service.</p>
        <h2>How to get your listing promoted on AavegotchiStats.com</h2>
        <p>Fill out the <a href='https://forms.gle/fSzrbJbYtywhabMZA'>Google Form survey</a> containing the details of your listing and send correct amount of GHST (1 GHST for a 24 hour promotion or 2 GHST for a 48 hour promotion) to the address <a href='https://polygonscan.com/address/0x708ef16bf16bb9f14cfe36075e9ae17bcd1c5b40'>0x708ef16bf16bb9f14cfe36075e9ae17bcd1c5b40</a>.</p>
        <p>The Google Form will be reviewed by me manually for completeness and I will check the GHST has been sent, I am based in Melbourne, Australia and I will do my best to get back to you promptly.</p>
        <p>Once reviewed I will provide confirmation via Discord/email when I have enabled the promotion to go live on AavegothiStats.</p>
        <p>Google Form survey link: <a href='https://forms.gle/fSzrbJbYtywhabMZA'>https://forms.gle/fSzrbJbYtywhabMZA</a></p>
        <p>I will be showing a maximum of 6 promoted listings at any one time on the website to avoid clutter, I will advise you early if this will be an issue and will provide an estimate on when the promotion can go live.</p>
        <p>Jarrod, AavegotchiStats.com</p>
      </div>
    );
  }
}

export default AddPromotedListing;
