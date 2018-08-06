import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import rootReducer from '../store/reducers';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import Header from '../components/header/Header';
import Home from '../views/home/Home';
import About from '../views/about/About';

const store = createStore(rootReducer);

const Layout = () => (
  <div>
    <Router>
      <Provider store={store}>
        <div>
          <Header />
          <Route exact path="/" component={Home} />
          <Route exact path="/about" component={About} />
        </div>
      </Provider>
    </Router>
  </div>
);

export default Layout;
