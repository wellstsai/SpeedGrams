import React, { Component } from 'react';
import * as PIXI from 'pixi.js';

import startNewGame from './startNewGame';

class Game extends Component {
  constructor(props) {
    super(props);
    this.app = new PIXI.Application(800, 600, {backgroundColor : 'black'});

    this.onLoad = this.onLoad.bind(this);
  }

  componentDidMount() {
    document.getElementById('game').appendChild(this.app.view);
    PIXI.loader
      .add('tiles', 'assets/images/wood_spritesheet.json')
      .load(this.onLoad);
  }

  onLoad(loader, resources) {
    // load start screen
    // join multiplayer
    // start a new game
    startNewGame(this.app, resources, 2);
  }

  render() {
    return (
      <div id="game" />
    );
  }
}

export default Game;
