// donate GHST to support development on this site
import React, { Component } from 'react';

class Credits extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <footer><p><small className="text-muted">built by Jarrod from <a href='https://programmablewealth.com'>programmablewealth.com</a> | aavegothchistats.com is not affiliated with aavegotchi.com | <a href='https://github.com/programmablewealth/aavegotchi-stats'>source code</a> | donations: 0x708Ef16bF16Bb9f14CfE36075E9ae17bCd1C5B40</small></p></footer>
    );
  }
}

export default Credits;
