import React, { Component } from 'react';
import * as PIXI from 'pixi.js';

class Game extends Component {
  constructor(props) {
    super(props);
    this.app = new PIXI.Application(800, 600, {backgroundColor : 'black'});

    this.onLoad = this.onLoad.bind(this);
  }

  componentDidMount() {
    // const app = new PIXI.Application(800, 600, {backgroundColor : 0x1099bb});
    document.getElementById('game').appendChild(this.app.view);
    console.log('hit loader');
    PIXI.loader
      .add('tiles', 'assets/images/wood_spritesheet.json')
      .load(this.onLoad);
  }

  onLoad(loader, resources) {
    console.log('onload');
    console.log('loader:', loader);
    console.log('resources', resources);
    console.log('resourcesx', resources["assets/images/wood_spritesheet.json"])
    
    let sprite = new PIXI.Sprite(
      resources.tiles.textures["letter_A.png"]
    );

    //Center the sprite vertically
    sprite.x = 68;
    sprite.y = this.app.stage.height / 2 - sprite.height / 2;
    this.app.stage.addChild(sprite);
    // sprite.alpha = 0.5;
    // sprite.interactive = true;
    // sprite.dragging = true;

  }

  render() {
    return (
      <div id="game" />
    )
  }
}

export default Game;
