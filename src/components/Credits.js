// donate GHST to support development on this site
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

class Credits extends Component {
  static propTypes = {
    match: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
  }

  render() {
    if (this.props.location.pathname != "/td") {
      return(
        <nav className="navbar fixed-bottom navbar-dark" style={{'backgroundColor': '#2f3136'}}>
          <div className="container-fluid">
            <p className="text-center" style={{'width': '100%', 'fontSize': '14px'}}><small className="text-muted"><a href='https://programmablewealth.com'>programmablewealth.com</a> | <a href='https://github.com/programmablewealth/aavegotchi-stats'>source code</a> | <a href='https://polygonscan.com/address/0x708ef16bf16bb9f14cfe36075e9ae17bcd1c5b40'>donate</a></small></p>
          </div>
        </nav>
      );
    }
    return null;
  }
}

export default withRouter(Credits);
