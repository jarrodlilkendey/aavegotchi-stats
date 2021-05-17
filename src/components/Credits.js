// donate GHST to support development on this site
import React, { Component } from 'react';

class Credits extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <nav className="navbar fixed-bottom navbar-dark" style={{'backgroundColor': '#2f3136'}}>
        <div className="container-fluid">
          <p className="text-center" style={{'width': '100%', 'fontSize': '14px'}}><small className="text-muted"><a href='https://programmablewealth.com'>programmablewealth.com</a> | <a href='https://github.com/programmablewealth/aavegotchi-stats'>source code</a> | <a href='https://etherscan.io/address/0x708Ef16bF16Bb9f14CfE36075E9ae17bCd1C5B40'>donate</a></small></p>
        </div>
      </nav>
    );
  }
}

export default Credits;
