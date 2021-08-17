import React, { Component } from 'react';

class Tools extends Component {
  constructor(props) {
    super(props);

    document.title = this.props.title;
  }

  render() {
    return(
      <div>
        <h1>Recommended Tools</h1>
        <p>I have created this page for products and services I use and recommend you try.</p>
        <p>NOTE: This page contains affiliate links.</p>
        <img src='/trezor.jpg' align='right' />
        <h2>Trezor Cryptocurrency Hardware Wallet</h2>
        <p>If you have more cryptocurrency then you are prepared to lose, I recommend that your consider getting a hardware wallet to secure your cryptocurrency.</p>
        <p>I have a Trezor hardware wallet which I use with the Metamask browser extension in Chrome for managing my Ethereum wallet which also works on the Polygon network.</p>
        <p>When making transactions through your Trezor wallet, you need to set up a PIN which is entered into your computer and a confirmation display is show on your Trezor to approve each trasnsaction that you make.</p>
        <p>Trezor is an afforable hardware wallet and provides ease of mind so that if your hard drive was to corrupt or your computer gets stolen you wouldn't lose all your crypto.</p>
        <div>
          <a href="https://shop.trezor.io/?offer_id=10&aff_id=8805&file_id=482" target="_blank">
            <img src="https://media.go2speed.org/brand/files/trezor/10/20210707060115-T1TT_banner_728x90_3.png" width="728" height="90" border="0" />
          </a>
          <img src="http://trezor.go2cloud.org/aff_i?offer_id=10&file_id=482&aff_id=8805" width="0" height="0" style={{ position: 'absolute', visibility: 'hidden' }} border="0" />
        </div>
        <h2>Coinjar Exchange</h2>
        <p><a href="https://cjr.io/pMKB">Coinjar</a> is a cryptocurrency exchange available to Australians. It is very easy to use and it has reasonable fees. You can fund your account in Australian dollars using payment methods popular in Australia including Pay ID, BPAY, cash deposits using Blueshyft and Mastercard and Visa credit/debit cards.</p>
        <p>If you sign up to Coinjar and complete your identity verification through my <a href="https://cjr.io/pMKB">referral link</a> we will both receive 500 CoinJar Rewards Points which can be used to reduce trading and withdrawal fees.</p>
        <a href="https://cjr.io/pMKB">
          <img src='https://miro.medium.com/max/700/1*TEEj0Jafl9d4tiOnSwj-Tg.png' />
        </a>
      </div>
    )
  }
}

export default Tools;
