import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { withRouter } from 'react-router-dom';

class NavBar extends Component {
  constructor(props) {
    super(props);

    this.renderNavBar = this.renderNavBar.bind(this);
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
      <div className="container">
        <ul className="nav nav-tabs">
          {this.renderNavBar()}
        </ul>
      </div>
    );
  }
}

export default withRouter(NavBar);
