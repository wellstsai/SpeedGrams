import React, { Component } from 'react';
import { Link } from 'react-router-dom'

class Header extends Component {
  render() {
    return (
      <div>
        <Link to='/'><button onClick={this.handleClickHome}>home</button></Link>
        <Link to='/about'><button onClick={this.handleClickAbout}>about</button></Link>
      </div>
    );
  }
}

export default Header;
