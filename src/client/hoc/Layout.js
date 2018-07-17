import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Header from '../components/header/Header';
import Home from '../views/home/Home';
import About from '../views/about/About';

const Layout = () => (
  <div>
    <Router>
      <div>
        <Header />
        <Route exact path="/" component={Home} />
        <Route exact path="/about" component={About} />
      </div>
    </Router>
  </div>
);

export default Layout;
