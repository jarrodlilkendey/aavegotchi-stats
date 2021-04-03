import React, { Component } from 'react';

class Loading extends Component {
  render() {
    return(
      <p><img src='./loading.gif' alt='Loading ROFL' width='32px' height='32px' /> {this.props.message}</p>
    );
  }
}

export default Loading;
