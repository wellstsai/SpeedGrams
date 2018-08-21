import React, { Component } from 'react';
import * as PIXI from 'pixi.js';
import { createStore } from 'redux';

import gameReducer from '../../store/reducers/gameReducer';
import { getGameState } from '../../store/utils/getGameState';
import startNewGame from './new-game/startNewGame';

class Game extends Component {
  constructor(props) {
    super(props);
    this.store = createStore(gameReducer);
    this.initializeGameStore(this.store);

    const gameState = getGameState(this.store);
    this.app = gameState.app;
  }

  componentDidMount() {
    document.getElementById('game').appendChild(this.app.view);
    PIXI.loader
      .add('tiles', 'assets/images/wood_spritesheet.json')
      .load(this.onLoad);
  }

  initializeGameStore = (store) => {
    store.dispatch({
      type: 'ADD_APP',
      app: new PIXI.Application(800, 600, { backgroundColor : 'transparent' })
    });
  };

  onLoad = (loader, resources) => {
    // load start screen
    // join multiplayer
    // start a new game
    this.store.dispatch({
      type: 'ADD_RESOURCES',
      resources,
    });
    startNewGame(this.store, resources, 2);
  }

  render() {
    return (
      <div id="game" />
    );
  }
}

export default Game;
