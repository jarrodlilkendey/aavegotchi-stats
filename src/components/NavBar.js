import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { withRouter } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faTwitter, faYoutube } from '@fortawesome/free-brands-svg-icons';

class NavBar extends Component {
  constructor(props) {
    super(props);

    this.renderNavBar = this.renderNavBar.bind(this);
  }

  renderSiteInfo() {
    return (
      <div className="container">
        <div className="row">
          <div className="col">
            <img src='./boo-removebg.png' width='120px' height='120px' />
            <img src='./aavegotchi-stats-logo.png' height='120px' />
          </div>
          <div className="col" style={{ 'margin-top': '25px'}}>
            <p>Keep in touch with AavegotchiStats on popular social networks</p>
            <a href="https://discord.gg/yShc8P4wX9" rel="noopener noreferrer" target="_blank" style={{ padding: '5px' }}>
              <FontAwesomeIcon icon={faDiscord} size="2x" color="#E259FD" />
            </a>
            <a href="https://twitter.com/GotchiStats" rel="noopener noreferrer" target="_blank" style={{ padding: '5px' }}>
              <FontAwesomeIcon icon={faTwitter} size="2x" color="#E259FD" />
            </a>
            <a href="https://www.youtube.com/channel/UCg5857-6abSZbk7bgxsvbbg" rel="noopener noreferrer" target="_blank" style={{ padding: '5px' }}>
              <FontAwesomeIcon icon={faYoutube} size="2x" color="#E259FD" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  renderNavBar() {
    const _this = this;
    return this.props.pages.map(function(page, index){
      if (page.path === _this.props.location.pathname) {
        return(
          <li className="nav-item" key={page.path}>
            <Link className="nav-link active" aria-current="page" to={page.path}>{page.name}</Link>
          </li>
        );
      } else {
        return(
          <li className="nav-item" key={page.path}>
            <Link className="nav-link" to={page.path}>{page.name}</Link>
          </li>
        );
      }
    });
  }

  render() {
    return (
      <div>
      {this.renderSiteInfo()}

      <div className="container">
        <ul className="nav nav-tabs">
          {this.renderNavBar()}
        </ul>
      </div>
      </div>
    );
  }
}

export default withRouter(NavBar);
