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
        <div className="row">
          <div className="col-md-6">
            <img src='./aavegotchi-stats-banner.png' height='120px' className="img-fluid" />
          </div>
          <div className="col-md-6" style={{ 'marginTop': '25px'}}>
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
    );
  }

  renderNavBar() {
    const _this = this;
    return this.props.pages.map(function(page, index){
      if (page.path === _this.props.location.pathname) {
        return(
          <li className="nav-item" key={page.path}>
            <a className="nav-link active" aria-current="page" href={page.path}>{page.name}</a>
          </li>
        );
      } else {
        return(
          <li className="nav-item" key={page.path}>
            <a className="nav-link" href={page.path}>{page.name}</a>
          </li>
        );
      }
    });
  }

  render() {
    if (this.props.location.pathname !== "/td" && this.props.location.pathname !== "/tdxpleaderboard") {
      return (
        <div>
        {this.renderSiteInfo()}

        <nav className="navbar navbar-expand-lg navbar-dark">
          <div className="container-fluid">
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarTogglerDemo01">
              <a className="navbar-brand" href="https://aavegotchistats.com">AavegotchiStats.com</a>
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                {this.renderNavBar()}
              </ul>
            </div>
          </div>
        </nav>

        </div>
      );
    } else {
      return(
        <div></div>
      );
    }
  }
}

export default withRouter(NavBar);
